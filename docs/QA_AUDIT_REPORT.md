# QA audit report

Site: https://thebhardwajrohit.github.io/ (source: this repository)
Date: 2026-10-22
Tools: `qa/audit.mjs` (Playwright driving Chrome 155), `astro check`, ESLint, `node:test`, and the
design-taste-frontend skill's `lint.mjs` and `inspect.mjs`.

Re-run it any time:

```bash
npm run build && npm run preview
npm run qa -- http://localhost:4321
```

## Result

| Gate | Result |
|---|---|
| `astro check` (TypeScript, 26 files) | 0 errors, 0 warnings, 0 hints |
| ESLint, `--max-warnings 0` | 0 problems |
| Unit tests (`npm test`) | 44 passed, 0 failed |
| Production build | 3 pages, 0 warnings |
| Design linter (source) | 0 FAIL, 0 WARN (exceptions annotated, see below) |
| Design inspector (rendered, 1440 / 768 / 390) | 0 FAIL, 0 WARN |
| QA audit, local build | 895 checks, 894 passed. The one failure was the link to this repository, which did not exist until it was pushed |
| QA audit, live site (https://thebhardwajrohit.github.io) | **895 checks, 0 failed** |

## What the audit checks

### Routes

| Route | Expected | Got |
|---|---|---|
| `/` | 200 | 200 |
| `/resume/` | 200 | 200 |
| `/no-such-page/` | 404, custom page | 404, "Nothing at this address." |

### Layout: 3 routes x 5 widths x 2 themes = 30 renders

Widths 375, 768, 1024, 1440, 2560; light and dark. For each render: no horizontal scroll and no
element past the right edge; nothing spilling out of a panel, figure, table or case study; no
truncated text; every image loaded; exactly one `h1`; no console errors, page errors or failed
requests. Full-page screenshots of each are written to `qa/output/screens/`.

180 of 180 passed.

### Controls: every link, button, input and menu option on every route

| Check | Count | Passed |
|---|---:|---:|
| Has an accessible name | 134 | 134 |
| Link has a real target (`href`, not `#`) | 75 | 75 |
| Button has an explicit `type` | 13 | 13 |
| Pointer cursor on visible links and buttons | 84 | 84 |
| Hover changes what you see (pixel comparison, rest vs hover) | 84 | 84 |
| Active (pressed) changes what you see | 84 | 84 |
| Keyboard: every Tab stop shows a focus ring | 88 | 88 |
| Keyboard: first Tab reaches "Skip to content" and Tab reaches the controls (each route); the skip link moves focus to `main` | 7 | 7 |

Counts are per route, so a header link appears once for each of the three routes. Menu options
inside the closed command menu are counted for names; their states are covered by the behaviour
checks below.

### Every URL

In-page anchors were checked against the element ids in the served HTML; internal pages and files
were requested; external links were requested with a browser user agent (requests to github.com are
spaced out so its rate limit does not answer for the page).

| URL | Kind | Status |
|---|---|---|
| `#main` (every page) | skip link anchor | found |
| `/`, `/resume/` | internal | 200 |
| `/#work`, `/#recognition`, `/#contact` | anchors | found |
| `#linklens`, `#echelon`, `#ulpf`, `#vitalgrid`, `#record`, `#check` | anchors | found |
| `/Rohit_Bhardwaj_Resume.pdf` | download | 200, `application/pdf`, `download` attribute set |
| `mailto:rbhardwaj.office@gmail.com` | email | valid address |
| github.com/TheBhardwajRohit | external | 200 |
| github.com/TheBhardwajRohit/LinkLens | external | 200 |
| thebhardwajrohit.github.io/LinkLens/ | external | 200 |
| LinkLens `docs/MODEL_REPORT.md` at lines 42-46, 89, 99 (pinned commit 7893f98) | evidence | 200 |
| LinkLens `PROGRESS.md#L125`, `api/tests/` (pinned) | evidence | 200 |
| LinkLens `docs/MODEL_REPORT.md`, `docs/TECH_DECISIONS.md` (main) | external | 200 |
| Echelon repository, `guardrail.py#L61`, `tests/` (pinned bb172dc) | evidence | 200 |
| svnit_ps1 repository, `evaluation.py#L13` (pinned af024a5) | evidence | 200 |
| ULPF repository, `README.md#L572-L592`, `README.md#L572`, `docs/THROUGHPUT.md#L69`, `#L77-L89` (pinned 3bd2fc8) | evidence | 200 |
| ULPF commits filtered to TheBhardwajRohit | external | 200, lists all 32 commits |
| github.com/TheBhardwajRohit/AI_Doc_Parser | external | 200 |
| ctftime.org/team/369743 | external | 200 |
| linkedin.com/in/bhardwaj-rohit | external | 999 (LinkedIn's wall for non-browser clients; the profile opens in a browser) |
| github.com/TheBhardwajRohit/TheBhardwajRohit.github.io | external | 200 after the push (404 before it existed) |

Plus 58 asset requests (every `src`, `srcset`, `poster`, icon, font, script and style referenced by
the built pages, the Open Graph image, sitemap, robots.txt, the recording): all 200.

### Behaviour

| Check | Result |
|---|---|
| Link check renders its first example without JavaScript input (built at build time) | pass |
| `аpple.com/signin` (Cyrillic а) scores 54, Suspicious, and shows the browser's `xn--pple-43d.com` | pass |
| `onlinesbi.sbi` is "Looks safe", 0 | pass |
| `192.168.1.1/login` is at least Suspicious (LinkLens's private-address floor) | pass |
| `javascript:` links are refused with a message | pass |
| Defanged output is never a link | pass |
| Ctrl+K opens the command menu and focuses its input; `/` opens it; Esc closes it | pass |
| Typing filters commands; Copy email copies; theme switch applies and survives navigation; View resume navigates | pass |
| Contact "Copy" copies the address and says "Copied" | pass |
| LinkLens figure: choosing "Report" shows the report and pauses the cycle; "Scan story" plays the recording | pass |
| Skip link moves focus to `main`; "Work" in the nav scrolls to the section | pass |
| Reduced motion: the recording does not autoplay and no section stays hidden | pass |
| No console errors during any of the above | pass |

### SEO and accessibility

Every route: `lang="en"`, title, description, Open Graph and Twitter large-image card, `Person`
structured data, header/nav/main/footer landmarks, alt text on every image. The two content routes
carry a canonical URL; the 404 is `noindex`. 18 of 18 passed.

## Issues found and fixed during the audit

| Found | Cause | Fix |
|---|---|---|
| Reasons in the link check rendered as "+25The address…" after a check ran | Rows built by the script do not carry Astro's scoped-style attribute | Styles for script-built rows marked `:global` |
| Text under 13px in seven places | Monospace set at 0.875em inside small text | `.data` floored at 13px; keyboard keys and source links raised to 13px |
| Five near-empty desktop screens | Every section was one 560px column | Case studies became narrative + evidence column with full-width figures; Record in two columns; the letter on a colour field |
| 14px horizontal scroll at 375px | Single-column grids sized to their widest content | `grid-template-columns: minmax(0, 1fr)` on every single-column grid |
| Check button and score row poked out of the link-check panel at 375px | Same cause, inside the panel | Same fix; the audit now checks that nothing spills out of a panel |
| Two pressed buttons showed no hover | The pressed style overrode the hover style | A separate pressed-and-hovered style |
| `/` did nothing right after Esc | The closed menu's input kept focus until the close event, so `/` counted as typing | Fields inside a closed dialog no longer count as typing; focus is dropped on close |
| Ctrl+K right after "Copy email" closed the menu instead of opening it | The copy command closed the menu only after the clipboard answered | The menu closes first, then copies |
| The embedded PDF viewer had no visible focus, and Android Chrome cannot show inline PDFs at all | Chrome keeps focus inside the PDF plugin | `/resume/` shows a sharp picture of the page that opens the PDF, beside Download and Open buttons |
| Empty figure wrapper after VitalGrid | An empty slot still counted as content | Case studies without a figure render without the slot |
| ApoorvCTF row linked "IIIT Kottayam" to CTFtime | Link on the wrong cell | The link now reads "on CTFtime" beside the result |
| Resume PDF opened with the tab title "Resume_4.0 [TCS]" | Canva metadata | PDF title set to "Rohit Bhardwaj, Resume"; page content unchanged (text compared before and after) |

## Accepted exceptions (deliberate, annotated in source with `taste-skill-ignore`)

- Monospace (JetBrains Mono) for figures, dates, code and defanged links: required by the brief.
- 1px rules inside tables, the link-check panel, the Echelon decode panel, the 404 report and the
  command menu; 1px outlines on small controls (Ctrl K, Copy, chips, input): required by the brief.
- A shadow on the command menu: it is a real overlay.
- The word "unlock" in `linkcheck.ts`: a scam keyword in LinkLens's rule data, not copy.

## Not covered by automation

- Real iOS Safari and Android Chrome devices (covered by emulated widths only).
- Screen reader output (names, roles and landmarks are checked; spoken output is not).
- LinkedIn's page content (it refuses non-browser requests).

## Live run

After the first deploy (GitHub Actions run 39798019713: build, tests, type check, lint and deploy
all green), the same audit ran against the production URL:

```bash
node qa/audit.mjs https://thebhardwajrohit.github.io
```

Result: **895 checks, 0 failed.** GitHub Pages serves `/` and `/resume/` with 200, the resume as
`application/pdf`, and any unknown path with this site's own 404 page and status 404. The existing
project site at `/LinkLens/` still answers 200 next to it.
