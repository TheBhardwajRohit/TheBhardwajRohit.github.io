// Zero-trust QA for the built site. Drives the installed Chrome through playwright-core.
//
//   npm run build && npm run preview          (in one terminal)
//   node qa/audit.mjs http://localhost:4321   (in another)
//
// Checks every route at five widths in both themes, every link and button, focus, hover and active
// states, the live link check, the command menu, and every internal and external URL. Writes
// qa/output/results.json and qa/output/report.md, plus screenshots, and exits non-zero on any failure.

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const OUT = 'qa/output';
const ROUTES = [
  { path: '/', status: 200 },
  { path: '/resume/', status: 200 },
  { path: '/no-such-page/', status: 404 },
];
const WIDTHS = [375, 768, 1024, 1440, 2560];
const THEMES = ['light', 'dark'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0 Safari/537.36';

mkdirSync(`${OUT}/screens`, { recursive: true });

const results = { base: BASE, startedAt: new Date().toISOString(), checks: [], urls: [] };
const record = (area, name, ok, detail = '') => {
  results.checks.push({ area, name, ok, detail });
  if (!ok) console.log(`FAIL [${area}] ${name} ${detail}`);
};

const browser = await chromium.launch({ channel: 'chrome' });

async function newPage({ width = 1440, height = 900, theme = 'light', reduced = true } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    // The 404 route answers 404 on purpose; Chrome logs that as a failed resource.
    if (m.type() === 'error' && !(/status of 404/.test(m.text()) && page.url().includes('no-such-page'))) errors.push(`console: ${m.text()}`);
  });
  page.on('requestfailed', (r) => {
    // Media loads cut short by the page itself are not failures.
    if (!/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on('response', (r) => {
    if (r.url().startsWith(BASE) && r.status() >= 400 && !r.url().includes('no-such-page')) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return { context, page, errors };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}

// 1. Routes respond with the right status and type.
for (const r of ROUTES) {
  const res = await fetch(BASE + r.path);
  const body = await res.text();
  record('routes', `${r.path} returns ${r.status}`, res.status === r.status, `got ${res.status}`);
  if (r.status === 404) record('routes', '404 page is the custom one', body.includes('Nothing at this address'), '');
}

// 2. Layout at every width and theme: no horizontal scroll, nothing cut off, images load, no errors.
for (const r of ROUTES) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const { context, page, errors } = await newPage({ width, theme });
      await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      const layout = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth - vw;
        const culprits = [];
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.right <= vw + 1) continue;
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p);
            if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) { clipped = true; break; }
          }
          if (!clipped && getComputedStyle(el).position !== 'fixed') culprits.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        }
        const truncated = [...document.querySelectorAll('body *')].filter((el) => {
          const s = getComputedStyle(el);
          return s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.offsetParent !== null;
        }).map((el) => el.textContent.trim().slice(0, 40));
        const broken = [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src);
        // Nothing may stick out of a panel: interface fragments, figures, tables, the hero.
        const spills = [];
        for (const box of document.querySelectorAll('[data-ui], figure, table, .hero-grid, .case')) {
          const outer = box.getBoundingClientRect();
          for (const el of box.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > outer.right + 1 || r.left < outer.left - 1) && getComputedStyle(el).position !== 'absolute') {
              spills.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} in ${box.tagName.toLowerCase()}.${[...box.classList].join('.')}`);
            }
          }
        }
        const h1 = document.querySelectorAll('h1').length;
        return { overflow, culprits: culprits.slice(0, 5), truncated, broken, h1, spills: [...new Set(spills)].slice(0, 5) };
      });
      const tag = `${r.path} @${width} ${theme}`;
      record('layout', `${tag}: no horizontal scroll`, layout.overflow <= 0 && layout.culprits.length === 0, `overflow ${layout.overflow}px ${layout.culprits.join(', ')}`);
      record('layout', `${tag}: no truncated text`, layout.truncated.length === 0, layout.truncated.join(' | '));
      record('layout', `${tag}: nothing spills out of its panel`, layout.spills.length === 0, layout.spills.join(', '));
      record('layout', `${tag}: images load`, layout.broken.length === 0, layout.broken.join(', '));
      record('layout', `${tag}: one h1`, layout.h1 === 1, `found ${layout.h1}`);
      record('layout', `${tag}: no console errors or failed requests`, errors.length === 0, errors.slice(0, 3).join(' | '));
      if (theme === 'light' || width === 1440) {
        const name = `${r.path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'}-${width}-${theme}`;
        await page.screenshot({ path: `${OUT}/screens/${name}.jpg`, type: 'jpeg', quality: 70, fullPage: true });
      }
      await context.close();
    }
  }
}

// 3. Every link and button on every route: a name, a real target, pointer cursor, distinct
//    hover, active and keyboard focus states.
const allLinks = new Map();
for (const r of ROUTES) {
  const { context, page } = await newPage({ width: 1440 });
  await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
  await scrollThrough(page);

  const items = await page.evaluate(() => {
    const nameOf = (el) => {
      const labelled = el.getAttribute('aria-labelledby');
      if (labelled) return labelled.split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim();
      return (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || el.getAttribute('title') || el.querySelector('img')?.alt || '').replace(/\s+/g, ' ').trim();
    };
    return [...document.querySelectorAll('a, button, input, [role="option"]')].map((el, i) => {
      el.setAttribute('data-qa', String(i));
      const rect = el.getBoundingClientRect();
      return {
        i,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        name: nameOf(el),
        href: el.getAttribute('href'),
        download: el.hasAttribute('download'),
        type: el.getAttribute('type'),
        visible: rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('dialog:not([open])') && !el.closest('[hidden]'),
        cursor: getComputedStyle(el).cursor,
        focusOnly: el.classList.contains('skip-link'),
      };
    });
  });

  for (const it of items) {
    const label = `${r.path} ${it.tag}${it.role ? `[${it.role}]` : ''} "${it.name.slice(0, 48)}"`;
    record('controls', `${label}: has an accessible name`, it.name.length > 0);
    if (it.tag === 'a') {
      record('controls', `${label}: has a target`, !!it.href && it.href !== '#', `href=${it.href}`);
      if (it.href) {
        const key = it.href.startsWith('#') ? `${r.path}${it.href}` : it.href;
        if (!allLinks.has(key)) allLinks.set(key, { href: it.href, from: r.path, download: it.download });
      }
    }
    if (it.tag === 'button') record('controls', `${label}: has type`, !!it.type, `type=${it.type}`);
    // The skip link is off-screen until focused; the keyboard pass covers it.
    if (!it.visible || it.tag === 'input' || it.focusOnly) continue;
    record('controls', `${label}: pointer cursor`, it.cursor === 'pointer', `cursor=${it.cursor}`);

    const loc = page.locator(`[data-qa="${it.i}"]`);
    await loc.scrollIntoViewIfNeeded();
    const box = await loc.boundingBox();
    if (!box) continue;
    const clip = { x: Math.max(0, box.x - 6), y: Math.max(0, box.y - 6), width: box.width + 12, height: box.height + 12 };
    await page.mouse.move(2, 2);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.waitForTimeout(260);
    const rest = await page.screenshot({ clip });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(260);
    const hover = await page.screenshot({ clip });
    record('states', `${label}: hover is visible`, !rest.equals(hover));
    await page.mouse.down();
    await page.waitForTimeout(120);
    const active = await page.screenshot({ clip });
    await page.mouse.move(2, 2);
    await page.mouse.up();
    record('states', `${label}: active is visible`, !hover.equals(active) || !rest.equals(active));
    await page.waitForTimeout(200);
  }

  // Keyboard: Tab through the page; every stop must show a focus indicator.
  await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
  await page.mouse.move(2, 2);
  const seen = new Set();
  for (let n = 0; n < 160; n++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      if (!el.hasAttribute('data-qa-focus')) el.setAttribute('data-qa-focus', String(Math.random()).slice(2, 10));
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        id: el.getAttribute('data-qa-focus'),
        name: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 48),
        outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1,
        box: { x: r.x, y: r.y, width: r.width, height: r.height },
      };
    }).catch(() => null);
    if (!info) break;
    if (seen.has(info.id)) break;
    seen.add(info.id);
    if (n === 0) record('keyboard', `${r.path}: first Tab reaches the skip link`, /skip to content/i.test(info.name), info.name);
    record('keyboard', `${r.path} focus "${info.name}": visible focus indicator`, info.outline, '');
  }
  record('keyboard', `${r.path}: keyboard reaches controls`, seen.size > 3, `${seen.size} stops`);
  await context.close();
}

// 4. Every URL: in-page anchors exist, internal pages and assets answer 200, external links answer.
async function check(url, { method = 'GET' } = {}) {
  // github.com rate-limits bursts (429); wait and retry rather than report a live page as dead.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA, accept: '*/*' }, signal: AbortSignal.timeout(25000) });
      if (res.status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)));
        continue;
      }
      return { status: res.status, type: res.headers.get('content-type') ?? '', length: Number(res.headers.get('content-length') ?? 0), body: method === 'GET' ? await res.text().catch(() => '') : '' };
    } catch (e) {
      return { status: 0, type: '', length: 0, body: '', error: e.message };
    }
  }
  return { status: 429, type: '', length: 0, body: '' };
}

const pageCache = new Map();
async function htmlOf(path) {
  if (!pageCache.has(path)) pageCache.set(path, (await check(BASE + path)).body);
  return pageCache.get(path);
}

for (const [key, link] of allLinks) {
  const { href } = link;
  // Space out requests to github.com so its rate limit does not answer for the pages.
  if (href.includes('github.com')) await new Promise((r) => setTimeout(r, 1500));
  if (href.startsWith('mailto:')) {
    const ok = /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href);
    results.urls.push({ url: href, kind: 'email', status: ok ? 'valid address' : 'invalid' });
    record('links', `${href} is a valid mailto`, ok);
    continue;
  }
  if (href.startsWith('#') || href.startsWith('/')) {
    const url = new URL(href, BASE + link.from);
    const path = url.pathname;
    const res = await check(BASE + path);
    const expected = ROUTES.find((x) => x.path === path)?.status ?? 200;
    const okStatus = res.status === expected;
    let okAnchor = true;
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      okAnchor = (await htmlOf(path)).includes(`id="${id}"`);
    }
    if (link.download) record('links', `${href} downloads a PDF`, res.type.includes('application/pdf'), res.type);
    results.urls.push({ url: href, kind: url.hash ? 'anchor' : 'internal', status: res.status, from: link.from, anchor: url.hash ? okAnchor : undefined });
    record('links', `${key} resolves`, okStatus && okAnchor, `status ${res.status}${url.hash ? `, anchor ${okAnchor ? 'found' : 'missing'}` : ''}`);
    continue;
  }
  const res = await check(href);
  // LinkedIn answers 999 to anything that is not a signed-in browser; that is its bot wall, not a dead link.
  const botWall = res.status === 999 && href.includes('linkedin.com');
  const ok = (res.status >= 200 && res.status < 400) || botWall;
  results.urls.push({ url: href, kind: 'external', status: res.status, note: botWall ? 'LinkedIn bot wall (999); profile opens in a browser' : res.error ?? '' });
  record('links', `${href} answers`, ok, `status ${res.status} ${res.error ?? ''}`);
}

// Assets referenced by the built pages (images, video, fonts, icons, scripts, styles).
for (const r of ROUTES.filter((x) => x.status === 200)) {
  const html = await htmlOf(r.path);
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href|poster)="([^"]+)"/g)) {
    const v = m[1];
    if (v.startsWith('/') && !v.startsWith('//') && !v.includes('#')) refs.add(v.split('?')[0]);
  }
  // Absolute URLs of this site in meta tags (og:image and the like).
  for (const m of html.matchAll(/content="https:\/\/thebhardwajrohit\.github\.io(\/[^"]*)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) refs.add(part.trim().split(' ')[0]);
  for (const ref of refs) {
    if (!ref || !ref.startsWith('/')) continue;
    const res = await check(BASE + ref, { method: 'HEAD' });
    record('assets', `${r.path} asset ${ref}`, res.status === 200, `status ${res.status}`);
  }
}

// 5. Behaviour: the live link check, the command menu, copy buttons, the slideshow, the theme.
{
  const { context, page, errors } = await newPage({ width: 1440, reduced: false });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const score = () => page.locator('#check [data-score]').innerText();
  const word = () => page.locator('#check [data-word]').innerText();

  record('link check', 'first example is rendered without typing', (await score()) === '50' && (await word()) === 'Suspicious', `${await score()} ${await word()}`);
  await page.locator('#lc-input').fill('https://аpple.com/signin');
  await page.locator('#lc-input').press('Enter');
  record('link check', 'homograph link scores 54, Suspicious', (await score()) === '54' && (await word()) === 'Suspicious', `${await score()} ${await word()}`);
  record('link check', 'homograph shows what the browser sees', (await page.locator('#check [data-reads]').innerText()).includes('xn--pple-43d.com'));
  await page.getByRole('button', { name: 'onlinesbi.sbi' }).click();
  record('link check', 'real SBI site is Looks safe, score 0', (await score()) === '0' && (await word()) === 'Looks safe', `${await score()} ${await word()}`);
  await page.getByRole('button', { name: '192.168.1.1/login' }).click();
  record('link check', 'private address is at least Suspicious', Number(await score()) >= 40);
  await page.locator('#lc-input').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  record('link check', 'non-web scheme is refused with a message', (await page.locator('#check [data-error]').innerText()).includes('Only web links'));
  record('link check', 'defanged output is never a link', (await page.locator('#check [data-defanged] a').count()) === 0);

  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Control+k');
  record('command menu', 'Ctrl+K opens it', await page.locator('#palette').evaluate((d) => d.open));
  record('command menu', 'focus moves to its input', await page.locator('#palette-input').evaluate((el) => el === document.activeElement));
  await page.keyboard.type('resume');
  const shown = await page.locator('#palette [role="option"]:not([hidden])').count();
  record('command menu', 'typing filters the commands', shown === 2, `${shown} shown`);
  await page.keyboard.press('Escape');
  record('command menu', 'Esc closes it', !(await page.locator('#palette').evaluate((d) => d.open)));
  await page.keyboard.press('/');
  record('command menu', '/ opens it', await page.locator('#palette').evaluate((d) => d.open));
  await page.keyboard.type('copy');
  await page.keyboard.press('Enter');
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
  record('command menu', 'Copy email copies the address', clip === 'rbhardwaj.office@gmail.com', clip);
  await page.keyboard.press('Control+k');
  await page.keyboard.type('switch');
  await page.keyboard.press('Enter');
  const theme = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('theme')]);
  record('command menu', 'theme switch applies and is remembered', theme[0] === 'dark' && theme[1] === 'dark', theme.join(','));
  await page.keyboard.press('Control+k');
  await page.keyboard.type('view resume');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/resume/');
  record('command menu', 'View resume navigates to /resume/', page.url().endsWith('/resume/'));
  record('theme', 'saved theme survives navigation', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.locator('#contact [data-copy]').click();
  record('contact', 'Copy button copies the email', (await page.evaluate(() => navigator.clipboard.readText())) === 'rbhardwaj.office@gmail.com');
  record('contact', 'Copy button confirms', (await page.locator('#contact .copied').innerText()) === 'Copied');

  await page.locator('#linklens').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  const active = await page.locator('[data-shots] .shot.is-active').getAttribute('data-shot-image');
  record('slideshow', 'choosing Report shows the report', active === '1', `active ${active}`);
  record('slideshow', 'choosing a screen pauses the cycle', (await page.locator('[data-shots-toggle]').innerText()) === 'Play');
  await page.getByRole('button', { name: 'Scan story', exact: true }).click();
  await page.waitForTimeout(1200);
  const playingVideo = await page.locator('[data-shots] video').evaluate((v) => !v.paused && v.readyState >= 2);
  record('slideshow', 'the scan story recording plays', playingVideo);

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  record('keyboard', 'skip link moves focus to main', await page.evaluate(() => document.activeElement?.id === 'main'));

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work' }).click();
  await page.waitForTimeout(900);
  const workTop = await page.locator('#work').evaluate((el) => Math.round(el.getBoundingClientRect().top));
  record('navigation', 'Work link scrolls to the section', Math.abs(workTop) < 40, `top ${workTop}px`);
  record('behaviour', 'no console errors during interaction', errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
}

// 6. Reduced motion: no autoplay, nothing hidden.
{
  const { context, page } = await newPage({ width: 1440, reduced: true });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.locator('#linklens').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  record('motion', 'reduced motion: the recording does not autoplay', await page.locator('[data-shots] video').evaluate((v) => v.paused));
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length);
  record('motion', 'reduced motion: every section is visible', hidden === 0, `${hidden} hidden`);
  await context.close();
}

// 7. Head: SEO and social tags, structured data, landmarks.
for (const r of ROUTES) {
  const { context, page } = await newPage({ width: 1440 });
  await page.goto(BASE + r.path, { waitUntil: 'networkidle' });
  const head = await page.evaluate(() => {
    const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? document.querySelector(sel)?.getAttribute('href') ?? null;
    let ld;
    try {
      ld = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? 'null');
    } catch {
      ld = 'invalid';
    }
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: meta('link[rel="canonical"]'),
      robots: meta('meta[name="robots"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogTitle: meta('meta[property="og:title"]'),
      twitter: meta('meta[name="twitter:card"]'),
      ld,
      landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => document.querySelector(t)).length,
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    };
  });
  const tag = r.path;
  record('seo', `${tag}: lang, title and description`, head.lang === 'en' && head.title.length > 10 && (head.description ?? '').length > 50, head.title);
  if (r.status === 200) record('seo', `${tag}: canonical URL`, head.canonical?.startsWith('https://thebhardwajrohit.github.io/') ?? false, head.canonical ?? '');
  else record('seo', `${tag}: 404 is noindex`, head.robots === 'noindex');
  record('seo', `${tag}: Open Graph and Twitter card`, !!head.ogImage && !!head.ogTitle && head.twitter === 'summary_large_image');
  record('seo', `${tag}: Person structured data`, head.ld && head.ld['@type'] === 'Person');
  record('a11y', `${tag}: header, nav, main and footer landmarks`, head.landmarks === 4);
  record('a11y', `${tag}: every image has alt`, head.imgNoAlt === 0, `${head.imgNoAlt} without`);
  await context.close();
}
for (const f of ['/og.png', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/Rohit_Bhardwaj_Resume.pdf', '/media/linklens-scan-story.mp4']) {
  const res = await check(BASE + f, { method: 'HEAD' });
  record('assets', `${f} is served`, res.status === 200, `status ${res.status} ${res.type}`);
}

await browser.close();

const failed = results.checks.filter((c) => !c.ok);
const byArea = {};
for (const c of results.checks) {
  byArea[c.area] ??= { pass: 0, fail: 0 };
  byArea[c.area][c.ok ? 'pass' : 'fail']++;
}
results.finishedAt = new Date().toISOString();
results.summary = { total: results.checks.length, failed: failed.length, byArea };
writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));

const lines = [
  `# QA run ${results.finishedAt}`,
  '',
  `Base: ${BASE}. ${results.checks.length} checks, ${failed.length} failed.`,
  '',
  '| Area | Passed | Failed |',
  '|---|---:|---:|',
  ...Object.entries(byArea).map(([a, v]) => `| ${a} | ${v.pass} | ${v.fail} |`),
  '',
  '## URLs',
  '',
  '| URL | Kind | Status | Note |',
  '|---|---|---|---|',
  ...results.urls.map((u) => `| ${u.url} | ${u.kind} | ${u.status} | ${u.anchor === false ? 'anchor missing' : u.note ?? ''} |`),
  '',
  '## Failures',
  '',
  ...(failed.length ? failed.map((f) => `- [${f.area}] ${f.name} ${f.detail}`) : ['None.']),
];
writeFileSync(`${OUT}/report.md`, lines.join('\n') + '\n');
console.log(`\n${results.checks.length} checks, ${failed.length} failed. Report: ${OUT}/report.md`);
process.exit(failed.length ? 1 : 0);
