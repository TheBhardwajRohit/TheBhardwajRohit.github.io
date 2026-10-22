# Portfolio Blueprint: Rohit Bhardwaj

Status: final after three critique passes (section 7). Written 2026-10-22, before any application code.

This document has four parts: what is true (Phase 1 findings), the first plan (v0), the three critique passes with the revision each one forced, and the final build spec (v3) that Phase 3 implements.

---

## 1. Phase 1 findings

### 1.1 Sources read

| Source | What it gave |
|---|---|
| `D:/Resume/PWC_Version/Resume_4.0 [PWC].pdf` (2026-10-06, newest) | Canonical facts, wording, contact details |
| `Resume_4.0 [TCS].pdf`, `Development (Python) _ Version` (2026-07-07) | Extra internship detail (Flask, Socket.IO, OSRM, Web3.py) |
| GitHub `TheBhardwajRohit`: 10 public repos, 0 pinned, 203 contributions in the last year | Project code, commit history, READMEs |
| `D:/Projects/LinkLens` (local clone): README, CLAUDE.md, PROGRESS.md, docs/MODEL_REPORT.md | Architecture and every LinkLens number, with its source line |
| `D:/Projects/Echelon` + `svnit_ps1` repo | LLM defense pipeline, test counts, labelled prompt set |
| `D:/Projects/ULPF` (team repo `D3v4nshPat3l/ULPF`, public, Apache-2.0) | Rohit's 28 commits: measurement harness and SIEM demo |
| CTFtime team page `ctftime.org/team/369743` | Team DIGGAJ (Rashtriya Raksha University), 21 events in 2026, 5th at ApoorvCTF 2026 |

### 1.2 Identity

- **Rohit Bhardwaj**, B.Tech Computer Science & Engineering, specialisation in Cyber Security, **Rashtriya Raksha University** (Institution of National Importance, Ministry of Home Affairs), Gandhinagar. Aug 2023 to Jul 2027.
- Resume headline: *Cybersecurity | Phishing & Fraud Detection | Secure Application Development | Risk & Compliance.*
- Core narrative: he builds **defensive tools that inspect hostile input** (scam links, malicious prompts, raw logs) and he is unusually **honest about measurement**: LinkLens's model report documents where the model fails; his ULPF commits read "republish the rate this machine actually sustains"; LinkLens's rule is "never claim a check that doesn't exist".
- Public contact: `rbhardwaj.office@gmail.com`, `linkedin.com/in/bhardwaj-rohit`, `github.com/TheBhardwajRohit`. Phone appears on the resume PDF only.

### 1.3 Flagship work (verified against code)

| Project | When / who | What is real | Headline numbers (source) |
|---|---|---|---|
| **LinkLens**: scam-link analyser | Sep 24 to Oct 20, 2026. Solo. 54 commits, MIT. Live homepage on GitHub Pages | FastAPI API, Playwright/Chromium sandbox behind an SSRF guard and pinned-IP proxy, blacklists, RDAP/DNS/GeoIP/cert recon, TLSH/simhash/pHash/favicon fingerprints, nightly family clustering, SiNMULI link-graph inference, LightGBM model capped so it never decides alone. ~14k lines Python, ~6.4k lines TypeScript, 264 Python tests, 6 Actions workflows | ROC AUC 0.9743; 97.5% precision, 75.9% recall at 0.5 on 15,558 unseen pages; 531 families from 55,084 pages; first model flagged 63 of 63 honest pages once `?utm_source=` was added, fixed by removing shortcut features (`docs/MODEL_REPORT.md`, `PROGRESS.md`) |
| **Echelon**: prompt-injection defense | Jan 31 to Feb 5, 2026. Echelon Hackathon, SVNIT Surat, **Top 8 finalist**. Team SRON (hackathon repo: Rohit 19 commits, teammate 6) | Five stages: sanitizer (Base64 decode, NFKC, homoglyphs), guardrail (regex + LLM "sandwich" classifier), session risk scorer, reprompt engine that salvages the legitimate half of a mixed prompt, output containment that redacts leaked keys | 116 labelled prompts in 12 categories (49 safe, 67 malicious); 199 unit + integration tests in the modular rewrite. README latency/FPR figures are unverified "~" values and **will not be used** |
| **ULPF**: log normaliser to OCSF | Sep 2026. Smart India Hackathon 2026, NTRO problem statement. Team of five; Rohit 28 commits | Rust, raw-bytes vault, hash chain with Ed25519-signed checkpoints. **Rohit's part**: wrote `measure_throughput.py` and the one-command demo compose, extended coverage measurement to the full public corpora, fixed Merkle checkpoints rebuilding the whole tree, added the forwarding sink for the Wazuh SIEM comparison | 99.8834% parse coverage on 32,414,250 real perimeter records; 8,000 events/s sustained with zero loss per collector (ULPF README, `docs/THROUGHPUT.md`). Numbers belong to the team's system; he built the tools that measured them |
| **VitalGrid** (research internship) | NIT Raipur, Jun to Jul 2026, under Dr. Preeti Chandrakar | Alert messaging and route-prediction modules of a decentralised emergency-vehicle routing system (Flask, Socket.IO, React, OSRM + Dijkstra, Web3.py to a local Ethereum contract); React roadside-unit dashboard checked with Playwright | No public code: shown as experience, never with a dead link |
| Institutional records platform | Smart India Hackathon, Sep 2025 | RBAC, AES-encrypted storage, hash integrity checks, batch-review APIs, data minimisation | Code not public |
| AI Document Parser | Nov 2025, public repo | FastAPI + EasyOCR + PyMuPDF backend, two Next.js frontends, rule-based fallback when the LLM is unavailable | none |

Not used: `TennisBallTracker` (unrelated to the security story), `n8n` (empty), `test_application`, `new-hostel-complaint`, Copilot exercises, and every private repo (cannot be linked).

### 1.4 Recognition (resume, cross-checked where a public source exists)

| Year | Event | Result | Check |
|---|---|---|---|
| 2026 | PwC AC India Fiercest Competitor 5.0, Cyber & Risk hackathon | Top 5, team lead; one of 30 students invited to PwC Bangalore, sponsored | Edition 4.0 ran in 2025, so 5.0 is 2026 |
| 2026 | Deloitte Hacksplosion (GenW.AI) | Top 60 teams nationally, cleared two national rounds | resume |
| 2026 | ApoorvCTF, IIIT Kottayam | 5th | **verified on CTFtime** |
| 2026 | Echelon Hackathon, SVNIT Surat | Top 8 finalist, qualified via online CTF round | repo dates match |
| 2026 | CTFtime season with Team DIGGAJ | Resume: 25th in India, 306th worldwide | **CTFtime today shows 57th in India, 583rd overall.** Open question 1 |
| 2023 | National Cyber Hygiene Initiative (AICTE, NCIIPC) | Recognised by the Government of India | resume |

Certifications: CNSP and Certified Bug Bounty Professional (The SecOps Group); CCNA ITN, SRWE, ENSA and Python Essentials 1 & 2 (Cisco Networking Academy).

Leadership: Research Lead, The Cyber Alliance club (4 hybrid seminars, 500+ students); Student Campus Ambassador, Google for Developers (workshops for 250+ students).

### 1.5 Working rules carried over from Rohit's own projects

From `LinkLens/CLAUDE.md`: plain, human, concise copy; **no em-dashes**; commits show only `TheBhardwajRohit` with the GitHub noreply address and **no Claude attribution**. These apply to this repo too.

---

## 2. The argument (v0)

Reader: a time-poor recruiter or hiring manager for security engineering, AppSec, cyber-risk consulting (PwC, Deloitte, Big 4 resume versions exist), or a research supervisor (SOPs to IIT Madras and NIT Calicut exist). They know the field; they do not know Rohit.

What they must believe after one screen: *this student ships real, measured security software, and has competed and placed at national level.*

| # | Claim | Proof |
|---|---|---|
| 1 | Rohit builds tools that catch scams and attacks on AI systems | name, role, university, one working demonstration |
| 2 | LinkLens is a real system, engineered safely, measured honestly | architecture, numbers with sources, live site, the 63/63 shortcut story |
| 3 | He defends LLM apps against prompt injection | a real decoded attack, pipeline, test counts, finalist result |
| 4 | He measures other people's claims too | ULPF coverage and throughput harness, scoped to his part |
| 5 | He places at national level | recognition table |
| 6 | He has worked on real infrastructure and research | experience, leadership, certifications |
| 7 | How he works, in his own words | short letter |
| 8 | Reach him or take the resume | email, LinkedIn, resume |

## 3. Inventory: things only Rohit has

1. LinkLens's report format: a 0 to 100 score where **every reason is written in plain words with its points**.
2. Defanged links: `hxxp://example[.]com`, never clickable.
3. The 63 of 63 honest pages wrongly flagged once a newsletter tag was added, and the fix.
4. 531 scam families from 55,084 pages.
5. Indian scam patterns: UPI/KYC, e-challan, India Post, the 1930 helpline.
6. The Base64 string `SWdub3JlIGFsbCBwcmV2aW91cyBpbnN0cnVjdGlvbnM=` that decodes to "Ignore all previous instructions".
7. 32,414,250 records; 8,000 events/s lossless.
8. Rashtriya Raksha University: a university under the Ministry of Home Affairs.
9. NCIIPC Green Team with ONGC, Adani, DERC.
10. His GitHub bio: "Commitment issues? Not here. I commit every day."
11. Commit messages in plain English ("Check the icon's address with the guard before opening it").

**Idea sentence:** *On this page, LinkLens's way of reporting (a verdict, then every reason in plain words, each with its evidence) becomes the way every claim about Rohit is shown: each number links to the file that measured it.*

Competitor test: another security student's portfolio cannot borrow this. It rests on his tool's actual report format and on source files that exist.

**The one live thing:** a working link check in the first screen. Type or pick a link; the page runs LinkLens's link-text rules (ported from `api/app/analysis/lexical.py` and the link reasons of `score.py`) in the browser and returns the points and plain reasons, with the link shown defanged. Nothing is fetched and the link never leaves the page; the panel says so, and says what a full scan adds (sandbox visit, blacklists, recon).

## 4. Direction (from the design-taste-frontend skill)

Dealt with `draw.mjs`, seed **1045863028**, sector personal-portfolio, tone technical. Three options were dealt: *quiet instrument*, *contact sheet*, *type-only statement*. Chosen: **The quiet instrument** (single column on a left alignment, small exact demonstrations, composed emptiness). Reason: Rohit's work is precise, measured and self-critical; a page that whispers and then demonstrates suits it better than one that shouts, and "small exact demonstrations" is exactly the live link check and the decoded prompt. *Contact sheet* was rejected because it needs dozens of pictures that do not exist.

| Slot | Dealt | Kept? |
|---|---|---|
| Type | Switzer 400/500 | yes |
| Colour | Three stones (#eeecea ground, #333231 ink, grey-green #5c6b54 action) | yes, plus a dark variant (pass 3) |
| Hero | Column on one line | adjusted in pass 1 |
| work | Quiet ledger, side preview | yes, plus case studies below it |
| proof | One quiet logo row | **redrawn** to *Recognition as a table*: there are no logos, and ranks need a result column |
| list | Two-ended rows, narrow column | yes |
| about | Founder's letter | yes, without a portrait (none exists) |
| contact | Sentence, portrait, two links | photo slot replaced (pass 2) |
| footer | A single quiet line | yes |
| Motion | Slow crossfade | yes, on real LinkLens screens |

### Where Rohit's manifesto overrides the skill's house rules

The skill bans monospace, 1px rules and a third font role. Rohit's brief asks for all three. The brief wins, with discipline so they stay information, not costume:

- **Monospace (JetBrains Mono)** only for data: figures in spec tables, dates, defanged links, decoded payloads, keyboard keys. Never for labels or headings.
- **1px rules** only inside real tables, the `data-ui` demo panel and the command dialog. Sections are separated by space, never by lines or boxes.
- **Three roles, two families**: Switzer 500 for headings, Switzer 400 for body (one grotesque family covers both roles), JetBrains Mono for data.

Inspector flags these will need: `--allow mono,hairline`. Every other house rule stands.

---

## 5. Plan v0

- Stack: Astro (static), TypeScript, plain CSS custom properties. Two client-side islands: link check, command palette.
- One page: hero, work ledger, four case studies, recognition table, experience list, letter, contact, footer. Plus `/resume/` and a custom 404.
- Hero per dealt blueprint: 27px headline, 380px column, demo panel peeking at the bottom, no navigation.
- Ledger lists seven projects including TennisBallTracker.
- Recognition table lists the resume's CTFtime rank as written.
- Contact uses a portrait.
- Cmd+K palette as the signature feature; blueprint-grid background as texture.

---

## 6. Critique passes

### Pass 1: the 6-second recruiter audit

Reading v0 as a hiring manager with 200 tabs open.

| Problem found | Why it fails | Revision |
|---|---|---|
| 27px headline, 80% empty first screen | In six seconds I see a small sentence and nothing to anchor who this is | Headline at display size (clamp to about 5vw, the direction's own composition rule outranks the hero blueprint). Name appears twice above the fold: wordmark and the first words of the supporting line |
| No proof above the fold | "Top 1%" has to be visible without scrolling | Add a four-row **record** table under the supporting line: LinkLens precision, PwC top 5 as team lead, ApoorvCTF 5th, NCIIPC Green Team. Real `<table>`, mono figures |
| No navigation | Recruiters jump to work or contact | Plain text links top-right: Work, Recognition, Contact, Resume. Resume also the primary hero button |
| Ledger shows only names | A list of titles is the "vague one-liner" failure | Ledger stays as an index (jump links); every flagship gets a full case study inline: Problem, Approach, Result, evidence table, links. No click needed to see impact |
| Team work not labelled | A recruiter who finds five names in ULPF's history would doubt everything | Every case study states role and team size in its first line: "Solo", "Team of 5, my part: measurement" |
| CTFtime 25th/306th contradicts the public page (57th/583rd today) | A linked number that does not match its source destroys trust in every other number | Show what is verifiable and link it: "21 CTFs in 2026 with Team DIGGAJ, 5th at ApoorvCTF". The resume figure is held back until Rohit confirms its date (open question 1) |
| Echelon README latency and FPR figures | Unverified "~" numbers | Dropped. Use test counts and the labelled set size, which are countable |
| TennisBallTracker in the ledger | Dilutes a security profile | Cut |
| Projects with no public code | Dead or missing links look like hiding | Write "Code not public (research lab)" in place of a link; no fake buttons |
| Resume access | Must be one click from anywhere | Hero button (direct PDF download), nav link, `/resume/` route with inline viewer and download, Cmd+K command, footer link. File name `Rohit_Bhardwaj_Resume.pdf`, with "updated Oct 2026" beside it |
| Email only as `mailto:` | Many recruiters use webmail; mailto does nothing for them | Email shown as text with a Copy button |
| Phone number | Public pages get scraped | Phone stays in the PDF only; not printed on the page |

### Pass 2: the anti-AI and craft audit

Reading v1 for anything a model would produce by default.

| Problem found | Revision |
|---|---|
| Cmd+K palette as the "signature" is itself a 2023 portfolio trope | The signature is the **link check**, which only Rohit could show. The palette stays as a keyboard layer (Ctrl/Cmd+K or `/`), offered by one small "Ctrl K" button, never advertised |
| Blueprint-grid background | Grid lines are costume; removed. The page ground is flat stone |
| Risk of mono creeping into labels | Rule written into the CSS: `--font-data` is only applied by `.data`, `td.num`, `time`, `code`, `kbd`. Lint for it in pass 4 |
| Section headings drifting into "Selected work", "My journey", "Tech stack" | Headings are plain nouns: Work, Recognition, Record, Contact. No eyebrows, no "01 / 02" |
| Case studies as identical blocks | Same reading order (it helps scanning) but each carries its own kind of demonstration: LinkLens a crossfade of real screens; Echelon a decoded attack shown step by step; ULPF its coverage table; VitalGrid text only |
| Skills section as tag cloud or bars | No skills section. Tools are named inside the work where they were used; the resume carries the full list |
| Copy clichés | Banned list from Rohit's brief plus the skill's lint list. No em-dashes anywhere (Rohit's rule). Every sentence must survive "could another candidate print this unchanged?" |
| README tone (emoji, "🛡️ AI-powered") leaking in | Rewrite all project copy from the code, not from README marketing |
| Contact portrait slot | No photo of Rohit exists to use, and stock is banned. The slot is dropped; the contact row is the sentence and the links |
| Imagery | Real pictures only, all the project's own: LinkLens home and scanner screens (captured from the live site), Echelon screenshots from its repo, ULPF console (team screenshot, Apache-2.0, credited). Square corners, one treatment, 1px frame only because they are `data-ui` interface captures |
| Colour | Stone ground and charcoal ink; grey-green only on the primary action. Verdict colours (safe, suspicious, dangerous) appear only inside the link-check panel, which is product UI |

### Pass 3: systems, UX and edge cases

| Concern | Decision |
|---|---|
| Ultrawide (2560px+) | Content sits in a 1440px frame centred in the viewport; the column's left alignment is 22% of the frame, not of the window, so it never drifts |
| Laptop 1024 to 1440 | Column 560px on the alignment; the ledger preview appears to the right only above 1100px |
| Tablet 768 | Alignment becomes a 48px margin; column takes the width up to 640px; no hover previews |
| Phone 375 | 20px margins, one column, record table becomes two-line blocks, nav collapses to Work, Contact, Resume plus the Ctrl K button is hidden (touch has no keyboard shortcut; a "Jump to" select is not needed with three links) |
| Hover-only UI | Ledger previews only under `(hover: hover) and (pointer: fine)`; focus shows them too; touch sees inline images |
| Long URLs typed into the link check | Input capped at 2,048 characters; output wraps with `overflow-wrap: anywhere`; no horizontal scroll |
| User input safety | Input is never rendered as HTML (`textContent` only), never sent anywhere, never stored |
| No JavaScript | The link check shows a static, labelled example result; everything else is plain HTML |
| Reduced motion | Crossfade shows only the first image; entrances drop travel and keep content visible |
| SEO | Title, description, canonical, Open Graph and Twitter cards with a 1200x630 image, JSON-LD `Person` (alumniOf, sameAs GitHub and LinkedIn), sitemap, robots.txt, SVG favicon plus PNG fallback |
| Accessibility | Skip link; `header`/`nav`/`main`/`footer` landmarks; one `h1`; sections labelled by their headings; tables with captions and `scope`; visible focus ring; palette as a `dialog` with combobox/listbox roles and arrow-key support; contrast AA (muted ink darkened to pass 4.5:1 on panels) |
| GitHub Pages | Repo `TheBhardwajRohit.github.io` gives a root site, so `base: '/'` and `site: 'https://thebhardwajrohit.github.io'`. Astro `build.format: 'directory'` so `/resume/` works without rewrites. `404.astro` builds to `/404.html`, which Pages serves for unknown paths. The existing project site at `/LinkLens/` keeps working because project repos take precedence for their own paths |
| Deploy | Actions: checkout, setup-node with npm cache, `npm ci`, `npm run check`, `npm run build`, upload-pages-artifact, deploy-pages. Pages source set to "GitHub Actions" |
| Performance | No framework runtime; two small scripts. Fonts self-hosted woff2 with `font-display: swap`, preloaded. Images through `astro:assets` (WebP, explicit width/height, lazy below the fold) |
| Print | Print stylesheet hides nav and demos so a printed page reads as a one-column dossier |
| Privacy | No analytics, no third-party requests at runtime |

---

## 7. Final build spec (v3)

### 7.1 Stack

| Choice | Why |
|---|---|
| Astro 5, static output | Zero JS by default; islands only where needed; first-class GitHub Pages support |
| TypeScript (strict) | `astro check` gives a type gate in CI |
| Plain CSS with custom properties | The whole design is tokens; a utility framework would add nothing |
| ESLint (typescript-eslint, eslint-plugin-astro) | "Zero linter warnings" gate |
| @astrojs/sitemap | Sitemap for SEO |
| Fonts: Switzer (Fontshare, ITF Free Font License), JetBrains Mono (OFL, @fontsource) | Self-hosted, no runtime third-party calls |

### 7.2 Routes

| Route | Content |
|---|---|
| `/` | The page below |
| `/resume/` | Inline PDF viewer (`<object>`), download button, "updated Oct 2026", plain fallback link |
| `/Rohit_Bhardwaj_Resume.pdf` | The newest resume (`Resume_4.0 [PWC].pdf`) |
| `/404.html` | Custom 404 written as a LinkLens-style verdict: the path defanged, "no page here", links home, to work and to the resume |

### 7.3 Tokens

```css
--bg: #eeecea;   --surface: #e4e1dd;   --field: #cdc3b6;
--ink: #333231;  --muted: #625e5a;     --accent: #5c6b54;   --accent-ink: #fff;
/* dark */
--bg: #1c1b1a;   --surface: #252422;   --field: #3a3632;
--ink: #ebe8e4;  --muted: #a8a29c;     --accent: #a3b596;   --accent-ink: #1c1b1a;
/* verdicts, inside data-ui only */
--safe: #3f6b4a; --warn: #8a6a1f; --danger: #9b3b30;

--font-text: "Switzer", system-ui, sans-serif;
--font-data: "JetBrains Mono", ui-monospace, monospace;

--step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);   /* captions, table meta */
--step-body:  clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);    /* running text */
--step-lead:  clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);      /* supporting line, case titles */
--step-head:  clamp(2rem, 1.3rem + 3.2vw, 4rem);             /* section headings, 404 */
--step-display: clamp(2.5rem, 1rem + 5vw, 5.25rem);          /* the h1 only */
```

Five sizes, two weights, one button shape (4px corners), section gaps 120 to 160px desktop, 88px phone.

### 7.4 Page, top to bottom (copy deck)

**Header.** Wordmark "Rohit Bhardwaj" on the alignment. Right: Work, Recognition, Contact, Resume; a small "Ctrl K" button.

**Hero.**
- h1: *I build tools that catch scams.*
- Supporting line: *I'm Rohit Bhardwaj, a final-year B.Tech student in Cyber Security at Rashtriya Raksha University, working on phishing, fraud and attacks on AI systems.*
- Record table (caption "Record", visually hidden):
  - LinkLens | 97.5% precision on 15,558 unseen pages
  - PwC Fiercest Competitor 5.0 | Top 5, team lead
  - ApoorvCTF 2026 | 5th
  - NCIIPC Green Team | Critical infrastructure, 2023
- Actions: **Download resume** (primary) and "Email me" (text link).
- Right of the column on desktop, below on phone: the **link check** panel (`data-ui`). Input "Paste a link", three example chips (a fake SBI KYC lookalike, a fake e-challan page, a real `sbi.co.in` address), result with score, verdict word, defanged link and reasons with points. Footnote: *These are LinkLens's link-text rules, run in your browser. Nothing is fetched. A full scan also opens the page in a sandbox, checks blacklists and looks up the owner.* Link: "How LinkLens works" to the case study.

**Work.** h2 "Work". Ledger rows (name, kind, year), each a jump link to its case study or, for small projects, to the repo:
- LinkLens | Scam-link analyser | 2026
- Echelon | Prompt-injection defense | 2026
- ULPF | Log normalisation, team | 2026
- VitalGrid | Emergency routing, research | 2026
- Institutional records platform | Smart India Hackathon | 2025
- AI Document Parser | OCR and matching | 2025

Case studies (h3 each). Meta line in data font: dates, role, stack. Then Problem, Approach, Result paragraphs, an evidence table whose every number links to the file that measured it, and links.

*LinkLens.* Sep to Oct 2026. Solo. Python, FastAPI, Playwright, PostgreSQL, LightGBM, React.
- Problem: A scam link is dangerous to open, and a bare "unsafe" label tells nobody what the page wanted or who runs it.
- Approach: Only a sandboxed Chromium ever visits the link. Every redirect hop goes through an SSRF guard that resolves the host and allows public addresses only, and a proxy that connects to the exact address the guard checked, so DNS rebinding cannot slip past. Around the visit: six blacklist sources in parallel, RDAP, DNS, certificate history and GeoIP recon, five kinds of page fingerprint, nightly grouping into scam families, and a link-graph inference from a 2026 paper. A LightGBM model gives one more opinion and is capped so it can never raise a verdict alone.
- Result: The first model flagged 63 of 63 honest pages as scams as soon as a newsletter tag was added to their links. It had learned dataset shortcuts. Removing those features and reweighting honest pages gave ROC AUC 0.974 and 97.5% precision on 15,558 pages it had never seen, with the failure cases written up in the model report.
- Evidence: 0.9743 ROC AUC; 97.5% precision, 75.9% recall; 55,084 pages in 531 families; 264 Python tests.
- Links: Source, Live site, Model report.
- Picture: crossfade of three real LinkLens screens.

*Echelon.* Jan to Feb 2026. Echelon Hackathon, SVNIT Surat, top 8 finalist. Team SRON.
- Problem: An LLM assistant that can see secrets can be talked into reading them out, and attackers hide the instruction in Base64 or look-alike letters.
- Approach: A middleware with five stages: decode and normalise (Base64, Unicode NFKC, homoglyphs), detect (pattern rules first, then an LLM classifier that wraps the input between fixed instructions), score per session so repeat attempts escalate, salvage the legitimate half of a mixed prompt, and redact any credential that still reaches the output.
- Demonstration (static): the Base64 string, decoded, then blocked; a mixed prompt reduced to its honest question.
- Result: Tested against a honeypot assistant seeded with fake AWS keys, database passwords and HR data, on 116 labelled prompts in 12 categories. The modular rewrite has 199 unit and integration tests.
- Links: Source, Hackathon build.

*ULPF.* Sep 2026. Smart India Hackathon 2026 (NTRO problem statement). Team of five; my part: measurement and the SIEM demo.
- What it is: A Rust pipeline that turns firewall, IDS, proxy, web, mail and host logs into OCSF 1.9 without discarding a byte, with a hash chain and signed checkpoints.
- My part: I wrote the throughput harness, moved coverage measurement from 2,000-line samples to the full public corpora, fixed checkpoints rebuilding the whole Merkle tree each time, and built the one-command Wazuh comparison demo.
- Result: 99.88% parse coverage on 32,414,250 real records; 8,000 events per second sustained with no loss on one collector.
- Links: Source (team repo), Throughput method.

*VitalGrid.* Jun to Jul 2026. Research intern, NIT Raipur, under Dr. Preeti Chandrakar.
- Built the alert messaging and route prediction modules of a decentralised emergency-vehicle routing system: OSRM road routing with Dijkstra, WebSocket alerts to vehicles inside a geofence, routing clearances written to a local Ethereum contract. Built the React dashboard for roadside units, its rendering checked with Playwright.
- Code not public (research lab).

**Recognition.** h2 "Recognition". Table: Year | Event | Organiser | Result. Rows from 1.4 except the unconfirmed CTFtime season rank, which is replaced by "Team DIGGAJ | CTFtime | 21 CTFs in 2026" (linked).

**Record.** h2 "Record". Two-ended rows in groups:
- Experience: NIT Raipur research intern (Jun to Jul 2026); NCIIPC and AICTE Green Team (Nov to Dec 2023), with one line each.
- Leadership: The Cyber Alliance, Research Lead (Apr 2025 to now); Google for Developers, Campus Ambassador (Jan 2025 to now).
- Certifications: CNSP; Certified Bug Bounty Professional; CCNA ITN, SRWE, ENSA; Python Essentials 1 and 2.
- Education: B.Tech CSE (Cyber Security), Rashtriya Raksha University, 2023 to 2027.

**Letter.** No heading (visually hidden "How I work" for the outline). Four short first-person paragraphs built only from facts in section 1: why links and prompts (hostile input), the 63/63 lesson, writing reasons in plain words, what he wants next. Signed "Rohit".

**Contact.** h2 "Contact". Statement: *Write to me about security engineering roles, internships or research.* Email as text with Copy, LinkedIn, GitHub. "Gandhinagar, India. IST, UTC+5:30."

**Footer.** One line: "Rohit Bhardwaj, Gandhinagar" | GitHub, LinkedIn, Resume, Source of this site | "2026". Image credit for the ULPF screenshot.

### 7.5 Interaction spec

- **Link check**: pure function `checkLink(input) -> { score, verdict, defanged, reasons[] }`, a faithful subset of LinkLens's link-text rules (scheme added, IP host, `@` in authority, `//` in path, punycode and confusable-letter lookalikes, typo and combo lookalikes against LinkLens's brand list, abused TLD, shortener, risky words, random-looking name, subdomain depth). Points match `score.py`; where the browser cannot match LinkLens (no Tranco list, a short public-suffix list), the code says so in a comment and the UI says "link-text rules only". Unit-tested with the same cases LinkLens's tests use where they apply.
- **Command palette**: native `<dialog>`; opens on Ctrl/Cmd+K, `/` (when not typing) or the header button; filters as you type; arrow keys and Enter; Esc closes and returns focus. Commands: jump to each section, open resume, download resume, copy email, open GitHub, open LinkedIn, toggle theme.
- **Theme**: follows the OS; the palette can override; choice remembered in `localStorage` inside try/catch.
- **Motion**: section parts rise 16px and fade in, staggered 70ms, once, via IntersectionObserver; content is visible by default and only hidden after the script confirms it can animate. Crossfade of LinkLens screens every 5.5s, paused when hidden or off-screen, off under reduced motion. Hover, press and focus feedback on every control.

### 7.6 Phase 4 gate

`astro check` (0 errors, 0 warnings), ESLint (0 warnings), `npm run build`, the skill's `lint.mjs` and `inspect.mjs` (no FAIL except the two allowed rules), and a Playwright or CDP script that loads every route at 375, 768, 1024, 1440 and 2560 widths, checks for horizontal overflow, follows every anchor and checks its target exists, requests every internal asset, checks every external URL responds, and checks that every link and button has a name, a target and a visible focus style. Results go in `QA_AUDIT_REPORT.md`.

### 7.7 Open questions for Rohit (defaults used until answered)

1. **CTFtime rank.** Resume says 25th in India and 306th worldwide in 2026; CTFtime shows 57th and 583rd today. Default: show verifiable facts only (21 CTFs in 2026, 5th at ApoorvCTF). If the resume figure was a peak on a known date, it can go back with that date.
2. **Phone number on the public PDF.** Default: publish the resume as is (it is the document he sends to employers). A phone-free copy can replace it.
3. **CGPA** (7.27) is on the resume and left off the page. Default: off.
