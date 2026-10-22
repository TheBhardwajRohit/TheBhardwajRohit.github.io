# thebhardwajrohit.github.io

Portfolio of Rohit Bhardwaj, cyber security student at Rashtriya Raksha University.
Live at **https://thebhardwajrohit.github.io/**.

The page shows four projects as short case studies (problem, approach, result) and links every
number to the file that measured it. The first screen has a working link check: LinkLens's
link-text rules, ported to TypeScript and run in the browser. Nothing is fetched and the link never
leaves the page.

## Stack

| Part | Choice | Why |
|---|---|---|
| Site | Astro 7, static output | No framework runtime; two small scripts (link check, command menu) |
| Language | TypeScript, strict | `astro check` in CI |
| Styles | Plain CSS with custom properties | The design is a handful of tokens (`src/styles/global.css`) |
| Type | Switzer (text), JetBrains Mono (figures and code) | Switzer is fetched from Fontshare at build time, see below |
| Tests | `node:test` for the link rules, Playwright for QA | The link rules are checked against LinkLens's own output |
| Hosting | GitHub Pages via Actions | `.github/workflows/deploy.yml` |

## Run it

You need Node 24.

```bash
npm install
npm run dev        # http://localhost:4321
```

Other scripts:

```bash
npm test           # link rules vs. LinkLens (tests/fixtures/linklens-oracle.json)
npm run check      # astro check + eslint, zero warnings allowed
npm run build      # static site in dist/
npm run preview    # serve dist/ on http://localhost:4321
npm run qa -- http://localhost:4321   # full QA audit, needs Chrome installed
```

## Where things live

| Path | What |
|---|---|
| `src/data/site.ts` | Every fact on the page, with its source link |
| `src/lib/linkcheck.ts` | The ported link rules. Header comment lists the LinkLens files they come from and the two simplifications |
| `src/components/` | One file per section; `figures/` holds the project pictures |
| `src/pages/` | `/`, `/resume/` and the custom `404` |
| `public/Rohit_Bhardwaj_Resume.pdf` | The resume served by every resume link |
| `qa/audit.mjs` | Routes, widths, themes, links, focus and hover states, behaviour |
| `docs/` | The design blueprint and the QA report |

## Updating

- **Resume:** replace `public/Rohit_Bhardwaj_Resume.pdf` and update `person.resume.updated` in `src/data/site.ts`.
- **A number changes:** edit it in `src/data/site.ts` and point its `source.href` at the commit and line that now proves it.
- **LinkLens rules change:** update `src/lib/linkcheck.ts`, regenerate `tests/fixtures/linklens-oracle.json` from LinkLens, run `npm test`.

## Credits and licences

- Switzer by Indian Type Foundry, ITF Free Font License. The licence allows self-hosting on this site
  but not redistributing the files, so `scripts/fetch-fonts.mjs` downloads them at build time and they
  are not committed.
- JetBrains Mono, SIL Open Font License, via `@fontsource/jetbrains-mono`.
- Brand list in `src/data/brands.json`: trimmed from LinkLens. TLD list: IANA root zone.
- ULPF console screenshot: the ULPF contributors, Apache-2.0.
- LinkLens and Echelon screenshots and the LinkLens recording: Rohit's own projects.
