// LinkLens's link-text rules, ported to run in the browser.
//
// Sources (github.com/TheBhardwajRohit/LinkLens):
//   api/app/analysis/lexical.py   the clues in the link itself
//   api/app/analysis/score.py     link_reasons(), the lookalike points, the verdict bands
//   api/app/analysis/brands.py    which domains belong to which brand
//
// Only the link is read. Nothing is fetched, so the sandbox visit, blacklists, recon, page checks,
// scam families and the model are out of reach here. Two simplifications, both towards fewer flags
// on ordinary sites being impossible to rule out: there is no Tranco popularity list (LinkLens
// skips the risky-word and odd-ending rules for popular sites), and the public suffix list is the
// IANA TLD list plus the common second-level and free-hosting suffixes below, not the full list.

import brandData from '../data/brands.json' with { type: 'json' };
import tldData from '../data/tlds.json' with { type: 'json' };
import { toUnicode } from './punycode.ts';

export type Verdict = 'safe' | 'suspicious' | 'dangerous';

export interface Reason {
  text: string;
  points: number;
}

export interface LinkCheck {
  ok: true;
  url: string;
  host: string;
  unicodeHost: string | null;
  defanged: string;
  score: number;
  verdict: Verdict;
  reasons: Reason[];
  goodSigns: Reason[];
}

export interface LinkCheckError {
  ok: false;
  error: string;
}

export const VERDICT_WORDS: Record<Verdict, string> = {
  safe: 'Looks safe',
  suspicious: 'Suspicious',
  dangerous: 'Likely dangerous',
};

export const SAFE_MAX = 30;
export const SUSPICIOUS_MAX = 69;
export const MAX_INPUT = 2048;

const LOOKALIKE_POINTS = { homograph: 45, typo: 35, subdomain: 30, combo: 25 } as const;
type LookalikeKind = keyof typeof LOOKALIKE_POINTS;

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'tiny.cc',
  'shorturl.at', 'rebrand.ly', 'bit.do', 's.id', 't.ly', 'v.gd', 'qrco.de', 'shorturl.asia',
  'tiny.one', 'bl.ink', 'lnkd.in', 'surl.li', 'u.to', 'clck.ru', 'bitly.ws', 'short.io',
  'linktr.ee', 'urlz.fr', 'shorte.st',
]);

const ABUSED_TLDS = new Set([
  'zip', 'mov', 'xyz', 'top', 'icu', 'click', 'gq', 'tk', 'ml', 'cf', 'ga', 'buzz', 'rest',
  'monster', 'cyou', 'sbs', 'cfd', 'lol', 'bond', 'quest', 'support', 'live', 'shop', 'online',
  'site', 'fun', 'win', 'loan', 'work', 'cam', 'bar', 'email', 'info',
]);

const URL_WORDS = new Set([
  'login', 'signin', 'sign-in', 'logon', 'verify', 'verification', 'update', 'secure', 'security',
  'account', 'kyc', 'banking', 'netbanking', 'wallet', 'bonus', 'gift', 'prize', 'reward', 'otp',
  'refund', 'suspend', 'suspended', 'unlock', 'confirm', 'support', 'helpdesk', 'recover', // taste-skill-ignore: scam keyword data, not copy
  'recovery', 'reactivate', 'claim', 'challan', 'aadhaar', 'pan', 'upi', 'free', 'win', 'winner',
  'invoice', 'payment', 'billing',
]);

// Letters from other alphabets that look Latin, plus common digit swaps.
const CONFUSABLES: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y', 'і': 'i', 'ј': 'j',
  'ԁ': 'd', 'һ': 'h', 'ӏ': 'l', 'ѕ': 's', 'ԛ': 'q', 'ԝ': 'w', 'ɡ': 'g', 'ո': 'n', 'ս': 'u',
  'ο': 'o', 'ρ': 'p', 'ν': 'v', 'τ': 't', 'κ': 'k', 'α': 'a', 'ε': 'e', 'ι': 'i', 'ı': 'i',
  'ł': 'l', '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g',
};

// Second-level public suffixes in common use (the full Public Suffix List is too heavy to ship).
const MULTI_LABEL_SUFFIXES = new Set([
  'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in', 'ac.in', 'edu.in', 'res.in',
  'gov.in', 'nic.in', 'mil.in', 'bank.in', 'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk',
  'ac.uk', 'gov.uk', 'nhs.uk', 'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'co.nz',
  'org.nz', 'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'com.br', 'net.br', 'org.br', 'gov.br',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'co.za', 'org.za', 'com.sg', 'edu.sg', 'gov.sg',
  'com.my', 'com.pk', 'com.bd', 'co.id', 'or.id', 'go.id', 'com.ng', 'com.mx', 'com.tr',
  'com.sa', 'com.eg', 'com.ar', 'com.co', 'com.ph', 'com.vn', 'com.hk', 'com.tw', 'co.kr',
  'co.il', 'co.th', 'in.th', 'com.np', 'com.lk', 'gov.lk',
]);

// Free hosting services from the Public Suffix List's private section, the ones phishing feeds
// show most. On these, each customer's site is its own site (evil.github.io), as in LinkLens.
const FREE_HOSTING_SUFFIXES = new Set([
  'github.io', 'gitlab.io', 'vercel.app', 'netlify.app', 'pages.dev', 'workers.dev', 'web.app',
  'firebaseapp.com', 'herokuapp.com', 'glitch.me', 'blogspot.com', 'weebly.com', 'wixsite.com',
  '000webhostapp.com', 'azurewebsites.net', 'appspot.com', 'onrender.com', 'replit.app',
  'repl.co', 'webflow.io', 'framer.website', 'ngrok-free.app', 'ngrok.io', 'r2.dev', 'surge.sh',
  'square.site', 'godaddysites.com', 'mybluehost.me', 'wcomhost.com', 'notion.site',
]);

// Only real banks and government bodies can register names under these.
const RESTRICTED_NAMES: [string, string][] = [
  ['.bank.in', 'a registered Indian bank'],
  ['.gov.in', 'Government of India'],
  ['.nic.in', 'Government of India'],
];

const TLDS = new Set<string>(tldData.tlds);

interface Brand {
  name: string;
  domains: string[];
  labels: string[];
}
const BRANDS: Brand[] = brandData.brands;

interface HostParts {
  subdomain: string;
  domain: string;
  suffix: string;
  isPrivate: boolean;
}

/** Splits a host the way tldextract does: the longest known suffix, then the label before it. */
function splitHost(host: string, includePrivate: boolean): HostParts {
  const labels = host.split('.');
  for (let i = 0; i < labels.length; i++) {
    const candidate = labels.slice(i).join('.');
    const isPrivate = includePrivate && FREE_HOSTING_SUFFIXES.has(candidate);
    const known = isPrivate || MULTI_LABEL_SUFFIXES.has(candidate) || (i === labels.length - 1 && TLDS.has(candidate));
    if (known) {
      return {
        subdomain: labels.slice(0, Math.max(i - 1, 0)).join('.'),
        domain: i > 0 ? labels[i - 1] : '',
        suffix: candidate,
        isPrivate,
      };
    }
  }
  // Unknown ending (a reserved name such as .example): no suffix, the last label is the domain.
  return { subdomain: labels.slice(0, -1).join('.'), domain: labels[labels.length - 1] ?? '', suffix: '', isPrivate: false };
}

function entropy(text: string): number {
  if (!text) return 0;
  const counts = new Map<string, number>();
  for (const c of text) counts.set(c, (counts.get(c) ?? 0) + 1);
  let h = 0;
  for (const n of counts.values()) h -= (n / text.length) * Math.log2(n / text.length);
  return h;
}

/** Does a name look machine-made? Judged word by word, so sbi-kyc-update is not called random. */
function looksRandom(label: string): boolean {
  for (const token of label.toLowerCase().split(/[-_.]+/)) {
    if (token.length < 10) continue;
    const letters = [...token].filter((c) => /[a-z]/.test(c));
    const vowels = letters.filter((c) => 'aeiou'.includes(c)).length;
    let switches = 0;
    for (let i = 1; i < token.length; i++) {
      if (/\d/.test(token[i - 1]) !== /\d/.test(token[i])) switches++;
    }
    const longestRun = Math.max(0, ...(token.match(/[bcdfghjklmnpqrstvwxz]+/g) ?? []).map((r) => r.length));
    const fewVowels = letters.length > 0 && vowels / letters.length < 0.2;
    if (entropy(token) >= 3 && (fewVowels || switches >= 3 || longestRun >= 6)) return true;
  }
  return false;
}

function skeleton(text: string): string {
  return [...text.toLowerCase()].map((c) => CONFUSABLES[c] ?? c).join('');
}

/** Unrestricted Damerau-Levenshtein distance (transpositions count once), as rapidfuzz computes it. */
export function damerauLevenshtein(a: string, b: string): number {
  const s = [...a];
  const t = [...b];
  const maxDist = s.length + t.length;
  const lastRow = new Map<string, number>();
  const d: number[][] = Array.from({ length: s.length + 2 }, () => new Array<number>(t.length + 2).fill(0));
  d[0][0] = maxDist;
  for (let i = 0; i <= s.length; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= t.length; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }
  for (let i = 1; i <= s.length; i++) {
    let lastMatchCol = 0;
    for (let j = 1; j <= t.length; j++) {
      const k = lastRow.get(t[j - 1]) ?? 0;
      const l = lastMatchCol;
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      if (cost === 0) lastMatchCol = j;
      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost,
        d[i + 1][j] + 1,
        d[i][j + 1] + 1,
        d[k][l] + (i - k - 1) + 1 + (j - l - 1),
      );
    }
    lastRow.set(s[i - 1], i);
  }
  return d[s.length + 1][t.length + 1];
}

function ownsDomain(brand: Brand, host: string, registered: string | null): boolean {
  return brand.domains.some((d) =>
    d.includes('.') ? registered === d || host === d || host.endsWith('.' + d) : host.endsWith('.' + d),
  );
}

function officialName(host: string, registered: string | null): string | null {
  const brand = BRANDS.find((b) => ownsDomain(b, host, registered));
  if (brand) return brand.name;
  return RESTRICTED_NAMES.find(([suffix]) => host.endsWith(suffix))?.[1] ?? null;
}

interface Lookalike {
  brand: string;
  kind: LookalikeKind;
  detail: string;
}

function findLookalike(label: string, subdomain: string): Lookalike | null {
  const uniLabel = toUnicode(label);
  const tokens = label.toLowerCase().split(/[-_.0-9]+/).filter(Boolean);
  const subLabels = subdomain.toLowerCase().split('.').filter(Boolean);
  let best: Lookalike | null = null;
  for (const brand of BRANDS) {
    for (const blabel of brand.labels) {
      if (uniLabel !== label && skeleton(uniLabel) === blabel) {
        return { brand: brand.name, kind: 'homograph', detail: `uses look-alike letters from another alphabet to spell "${blabel}"` };
      }
      if (label !== blabel && skeleton(label) === blabel) {
        return { brand: brand.name, kind: 'typo', detail: `swaps letters for digits to spell "${blabel}"` };
      }
      const limit = blabel.length >= 9 ? 2 : blabel.length >= 6 ? 1 : 0;
      if (limit && label !== blabel && damerauLevenshtein(label, blabel) <= limit) {
        best ??= { brand: brand.name, kind: 'typo', detail: `is one or two letters away from "${blabel}"` };
      } else if (label !== blabel && (tokens.includes(blabel) || (blabel.length >= 5 && label.includes(blabel)))) {
        best ??= { brand: brand.name, kind: 'combo', detail: `adds extra words around "${blabel}"` };
      } else if (subLabels.includes(blabel) || subLabels.some((s) => s.startsWith(blabel + '-'))) {
        best ??= { brand: brand.name, kind: 'subdomain', detail: `puts "${blabel}" in front of an unrelated domain` };
      }
    }
  }
  return best;
}

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** The ranges LinkLens's sandbox guard refuses: private, loopback, link-local, shared and reserved. */
function isBlockedAddress(host: string): boolean {
  const v4 = host.match(IPV4);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  const v6 = host.replace(/^\[|\]$/g, '').toLowerCase();
  return v6 === '::' || v6 === '::1' || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || v6.startsWith('::ffff:');
}

function wordsOf(text: string, extraSplit: boolean): string[] {
  return text.toLowerCase().split(extraSplit ? /[^a-z0-9-]+|-/ : /[^a-z0-9-]+/);
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** Writes a link so it cannot be clicked or followed: hxxp://example[.]com/path. */
export function defang(url: URL): string {
  const scheme = url.protocol.replace(/^http/, 'hxxp');
  const host = url.host.replace(/\./g, '[.]');
  return `${scheme}//${host}${url.pathname}${url.search}${url.hash}`;
}

export function verdictFor(score: number): Verdict {
  if (score <= SAFE_MAX) return 'safe';
  return score <= SUSPICIOUS_MAX ? 'suspicious' : 'dangerous';
}

export function checkLink(input: string): LinkCheck | LinkCheckError {
  const raw = input.trim();
  if (!raw) return { ok: false, error: 'Paste or type a link first.' };
  if (raw.length > MAX_INPUT) return { ok: false, error: `That is longer than ${MAX_INPUT.toLocaleString('en-IN')} characters.` };

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^/:]+:\d+(\/|$)/.test(raw);
  if (hasScheme && !/^https?:\/\//i.test(raw)) {
    return { ok: false, error: 'Only web links (http or https) can be checked. LinkLens refuses every other kind.' };
  }
  const normalized = hasScheme ? raw : `http://${raw}`;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return { ok: false, error: 'That does not read as a link. Try something like example.com/login.' };
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host) return { ok: false, error: 'That link has no site name in it.' };

  const authority = normalized.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?#]/)[0];
  const hasAt = authority.includes('@');
  const doubleSlashPath = url.pathname.slice(1).includes('//');
  const port = url.port && url.port !== '80' && url.port !== '443' ? Number(url.port) : null;
  const pathWords = wordsOf(safeDecode(`${url.pathname} ${url.search.slice(1)}`), false);
  const hostWords = wordsOf(host, true);
  const urlWords = [...new Set([...pathWords, ...hostWords])].filter((w) => URL_WORDS.has(w)).sort();
  const isIp = IPV4.test(host) || host.startsWith('[');

  // The features lexical.analyze_link() computes. An IP address stops it early, as in LinkLens.
  const pub = isIp ? null : splitHost(host, false);
  const site = isIp ? null : splitHost(host, true);
  const label = pub?.domain ?? '';
  const registered = pub?.suffix && pub.domain ? `${pub.domain}.${pub.suffix}` : null;
  const unicodeHost = !isIp && host.includes('xn--') ? toUnicode(host) : null;
  const freeHosting = site?.isPrivate ? site.suffix : null;
  const subdomainDepth = site ? site.subdomain.split('.').filter(Boolean).length : 0;
  const tld = pub?.suffix.split('.').pop() ?? '';
  const official = isIp ? null : officialName(host, registered);
  const lookalike = isIp || official ? null : findLookalike(label, pub?.subdomain ?? '');

  // score.link_reasons(), rule for rule and in the same order.
  const reasons: Reason[] = [];
  const add = (text: string, points: number) => reasons.push({ text, points });
  if (lookalike) add(`The address ${lookalike.detail}, imitating ${lookalike.brand}.`, LOOKALIKE_POINTS[lookalike.kind]);
  if (isIp) add('The link uses a bare IP address instead of a name.', 20);
  if (hasAt) add('The link hides its real destination after an @ sign.', 15);
  if (unicodeHost && lookalike?.kind !== 'homograph') add(`The name uses special characters: it really reads "${unicodeHost}".`, 10);
  if (freeHosting) add(`The page sits on a free hosting service (${freeHosting}), where anyone can make a site.`, 10);
  if (ABUSED_TLDS.has(tld)) add(`It uses the .${tld} ending, which scammers use often.`, 8);
  if (subdomainDepth >= 3) add('The address has many layers of subdomains.', 8);
  if (!isIp && looksRandom(label)) add('The name looks randomly generated.', 8);
  if ((label.match(/-/g) ?? []).length >= 2) add('The name has several hyphens, like many scam domains.', 5);
  if (urlWords.length && !official) add(`The link uses words scammers like: ${urlWords.slice(0, 4).join(', ')}.`, Math.min(4 * urlWords.length, 12));
  if (normalized.length > 100) add('The link is unusually long.', 5);
  if (port) add(`The link uses an unusual port (${port}).`, 8);
  if (doubleSlashPath) add('The link has a hidden second address inside it.', 5);
  if (registered && SHORTENERS.has(registered)) add('The link was shortened, which hides where it really goes.', 5);

  // score.reputation_reasons(), without the Tranco half.
  const goodSigns: Reason[] = official ? [{ text: `This is the real website of ${official}.`, points: -40 }] : [];

  // The sandbox guard refuses private addresses before any visit (score.behavior_reasons()).
  const blocked = isIp && isBlockedAddress(host);
  if (blocked) add('The link tried to reach a private or internal address. Real websites never do that.', 25);

  // Heaviest reason first, as in the LinkLens report.
  reasons.sort((a, b) => b.points - a.points);
  let score = Math.max(0, Math.min(100, [...reasons, ...goodSigns].reduce((sum, r) => sum + r.points, 0)));
  if (blocked) score = Math.max(score, SAFE_MAX + 10);

  return {
    ok: true,
    url: normalized,
    host,
    unicodeHost,
    defanged: defang(url),
    score,
    verdict: verdictFor(score),
    reasons,
    goodSigns,
  };
}
