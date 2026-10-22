// Every fact on the site lives here, with the file that proves it where one exists.
// Sources were checked on 2026-10-22 against the resume (Resume_4.0, 2026-10-06) and the repositories.

const LINKLENS = 'https://github.com/TheBhardwajRohit/LinkLens';
const LINKLENS_AT = `${LINKLENS}/blob/7893f98ad3dbc57178a1baba772c1bab54ba9a42`;
const ECHELON = 'https://github.com/TheBhardwajRohit/Echelon-Prompt-Injection-Defense-System';
const ECHELON_AT = `${ECHELON}/blob/bb172dc9e3e2d039218992f318cb9e42dd314bdf`;
const SVNIT = 'https://github.com/TheBhardwajRohit/svnit_ps1';
const SVNIT_AT = `${SVNIT}/blob/af024a53099c5812ef472f2d1f0454dc0f6dc722`;
const ULPF = 'https://github.com/D3v4nshPat3l/ULPF';
const ULPF_AT = `${ULPF}/blob/3bd2fc8286827b1e760992101da567e9697631c5`;

export const person = {
  name: 'Rohit Bhardwaj',
  role: 'Cyber security engineer',
  email: 'rbhardwaj.office@gmail.com',
  github: 'https://github.com/TheBhardwajRohit',
  linkedin: 'https://www.linkedin.com/in/bhardwaj-rohit/',
  university: 'Rashtriya Raksha University',
  universityUrl: 'https://rru.ac.in/',
  city: 'Gandhinagar, India',
  resume: {
    href: '/Rohit_Bhardwaj_Resume.pdf',
    file: 'Rohit_Bhardwaj_Resume.pdf',
    updated: 'October 2026',
    updatedIso: '2026-10-06',
  },
  siteSource: 'https://github.com/TheBhardwajRohit/TheBhardwajRohit.github.io',
} as const;

export interface Evidence {
  measure: string;
  value: string;
  source: { label: string; href: string };
}

export interface Link {
  label: string;
  href: string;
}

export interface Meta {
  term: string;
  detail: string;
}

export interface CaseStudy {
  id: string;
  name: string;
  kind: string;
  meta: Meta[];
  problem: string;
  approach: string;
  result: string;
  evidence: Evidence[];
  links: Link[];
  note?: string;
}

export const cases: CaseStudy[] = [
  {
    id: 'linklens',
    name: 'LinkLens',
    kind: 'Scam-link analyser',
    meta: [
      { term: 'When', detail: 'Sep to Oct 2026' },
      { term: 'Role', detail: 'Solo' },
      { term: 'Stack', detail: 'Python, FastAPI, Playwright, PostgreSQL, LightGBM, React, Docker' },
    ],
    problem:
      'A scam link is dangerous to open, and a bare “unsafe” label tells nobody what the page wanted, who runs it, or what to do next.',
    approach:
      'Only a sandboxed Chromium ever visits the link. Every redirect goes through a guard that resolves the host and allows public addresses only, and through a proxy that connects to the exact address the guard checked, so DNS rebinding cannot slip past. Around the visit run six blacklist sources, RDAP, DNS, certificate and GeoIP lookups, five kinds of page fingerprint, nightly grouping into scam families and a link-graph inference from a 2026 paper. A LightGBM model adds one more opinion and is capped so it can never raise a verdict alone.',
    result:
      'The first model called 63 of 63 honest pages scams once a newsletter tag was added to their links: it had learned shortcuts from the dataset. I removed those features and reweighted honest pages; the model now ranks pages at 0.974 ROC AUC, and the report lists where it still fails.',
    evidence: [
      { measure: 'ROC AUC on 15,558 pages it never saw', value: '0.9743', source: { label: 'MODEL_REPORT.md', href: `${LINKLENS_AT}/docs/MODEL_REPORT.md#L89` } },
      { measure: 'Precision and recall at 50%', value: '97.5% / 75.9%', source: { label: 'MODEL_REPORT.md', href: `${LINKLENS_AT}/docs/MODEL_REPORT.md#L99` } },
      { measure: 'Honest pages wrongly flagged by the first model', value: '63 of 63', source: { label: 'MODEL_REPORT.md', href: `${LINKLENS_AT}/docs/MODEL_REPORT.md#L42-L46` } },
      { measure: 'Scam families found in the page library', value: '531 in 55,084', source: { label: 'PROGRESS.md', href: `${LINKLENS_AT}/PROGRESS.md#L125` } },
      { measure: 'Automated tests (API, sandbox, jobs)', value: '264', source: { label: 'api/tests', href: `${LINKLENS}/tree/7893f98ad3dbc57178a1baba772c1bab54ba9a42/api/tests` } },
    ],
    links: [
      { label: 'Source code', href: LINKLENS },
      { label: 'Live site', href: 'https://thebhardwajrohit.github.io/LinkLens/' },
      { label: 'Model report', href: `${LINKLENS}/blob/main/docs/MODEL_REPORT.md` },
      { label: 'Why each tool was chosen', href: `${LINKLENS}/blob/main/docs/TECH_DECISIONS.md` },
    ],
  },
  {
    id: 'echelon',
    name: 'Echelon',
    kind: 'Prompt-injection defense',
    meta: [
      { term: 'When', detail: 'Jan to Feb 2026' },
      { term: 'Role', detail: 'Team SRON, Echelon Hackathon at SVNIT Surat, top 8 finalist' },
      { term: 'Stack', detail: 'Python, Streamlit, Gemini and Groq APIs' },
    ],
    problem:
      'An LLM assistant that can see secrets can be talked into reading them out, and attackers hide the instruction in Base64 or in letters borrowed from other alphabets.',
    approach:
      'A middleware with five stages. It decodes and normalises the input (Base64, Unicode NFKC, look-alike letters), detects with 46 pattern rules first and an LLM classifier second, scores each session so repeat attempts escalate, salvages the honest half of a mixed prompt, and redacts any credential that still reaches the output.',
    result:
      'Tested against a honeypot assistant seeded with fake AWS keys, database passwords and HR records, on 116 labelled prompts in 12 categories. The modular rewrite carries 199 unit and integration tests.',
    evidence: [
      { measure: 'Labelled prompts (67 malicious, 49 safe)', value: '116', source: { label: 'evaluation.py', href: `${SVNIT_AT}/evaluation.py#L13` } },
      { measure: 'Pattern rules before the LLM check', value: '46', source: { label: 'guardrail.py', href: `${ECHELON_AT}/guardrail.py#L61` } },
      { measure: 'Unit and integration tests', value: '199', source: { label: 'tests/', href: `${ECHELON}/tree/bb172dc9e3e2d039218992f318cb9e42dd314bdf/tests` } },
    ],
    links: [
      { label: 'Source code', href: ECHELON },
      { label: 'Hackathon build', href: SVNIT },
    ],
  },
  {
    id: 'ulpf',
    name: 'ULPF',
    kind: 'Log normalisation, team project',
    meta: [
      { term: 'When', detail: 'Sep 2026' },
      { term: 'Role', detail: 'Team project, 32 commits mine. My part: measurement and the SIEM demo' },
      { term: 'Stack', detail: 'Rust, Python, Docker Compose, Wazuh' },
    ],
    problem:
      'A security team gets logs from dozens of vendors in formats that do not agree, and most pipelines keep only the fields someone thought of, cutting the tie to the original evidence. This was Smart India Hackathon 2026 problem statement 26156, from NTRO.',
    approach:
      'ULPF turns firewall, IDS, proxy, web, mail and host logs into OCSF 1.9 without discarding a byte, and chains every record to the last with signed checkpoints. I wrote the throughput harness, moved coverage measurement from 2,000-line samples to the full public corpora, stopped checkpoints from rebuilding the whole Merkle tree each time, and built the one-command Wazuh comparison.',
    result:
      'The harness first reported exactly 70,000 records received at every rate from 8,000 events a second upward. That was the size of the socket buffer, not a speed limit. I made it wait for the collector to drain, and the honest ceiling came out at 8,000 events a second with no loss.',
    evidence: [
      { measure: 'Parse coverage on real perimeter logs', value: '99.8967%', source: { label: 'README.md', href: `${ULPF_AT}/README.md#L572-L592` } },
      { measure: 'Records in the measured corpora', value: '32,414,250', source: { label: 'README.md', href: `${ULPF_AT}/README.md#L572` } },
      { measure: 'Lossless rate per collector', value: '8,000 EPS', source: { label: 'THROUGHPUT.md', href: `${ULPF_AT}/docs/THROUGHPUT.md#L69` } },
      { measure: 'The measurement bug, written up', value: '70,000 flat', source: { label: 'THROUGHPUT.md', href: `${ULPF_AT}/docs/THROUGHPUT.md#L77-L89` } },
    ],
    links: [
      { label: 'Team repository', href: ULPF },
      { label: 'My commits', href: `${ULPF}/commits/main?author=TheBhardwajRohit` },
    ],
  },
  {
    id: 'vitalgrid',
    name: 'VitalGrid',
    kind: 'Emergency routing, research',
    meta: [
      { term: 'When', detail: 'Jun to Jul 2026' },
      { term: 'Role', detail: 'Research intern, Department of CSE, NIT Raipur, under Dr. Preeti Chandrakar' },
      { term: 'Stack', detail: 'Python, Flask, Socket.IO, React, OSRM, Web3.py, Playwright' },
    ],
    problem:
      'An emergency vehicle needs a clear route, and the vehicles around it need to hear early enough to give way.',
    approach:
      'VitalGrid is a decentralised routing system for emergency vehicles. I built its alert messaging and route prediction modules: road routing on OSRM with Dijkstra-based pathfinding, WebSocket alerts to vehicles inside a geofence around the active route, and routing clearances written to a local Ethereum contract.',
    result:
      'I also built the React control dashboard for roadside units, with its rendering checked by Playwright tests.',
    evidence: [],
    links: [],
    note: 'Code not public (research lab).',
  },
];

export interface LedgerRow {
  name: string;
  kind: string;
  year: string;
  href?: string;
  external?: boolean;
  preview?: 'linklens' | 'echelon' | 'ulpf';
}

export const ledger: LedgerRow[] = [
  { name: 'LinkLens', kind: 'Scam-link analyser', year: '2026', href: '#linklens', preview: 'linklens' },
  { name: 'Echelon', kind: 'Prompt-injection defense', year: '2026', href: '#echelon', preview: 'echelon' },
  { name: 'ULPF', kind: 'Log normalisation, team', year: '2026', href: '#ulpf', preview: 'ulpf' },
  { name: 'VitalGrid', kind: 'Emergency routing, research', year: '2026', href: '#vitalgrid' },
  { name: 'Institutional records platform', kind: 'Smart India Hackathon, code private', year: '2025' },
  { name: 'AI Document Parser', kind: 'OCR and skill matching', year: '2025', href: 'https://github.com/TheBhardwajRohit/AI_Doc_Parser', external: true },
];

export interface Recognition {
  year: string;
  event: string;
  organiser: string;
  result: string;
  href?: string;
}

export const recognition: Recognition[] = [
  { year: '2026', event: 'Fiercest Competitor 5.0, Cyber and Risk hackathon', organiser: 'PwC Acceleration Centres India', result: 'Top 5, team lead. One of 30 students invited to Bangalore' },
  { year: '2026', event: 'ApoorvCTF', organiser: 'IIIT Kottayam', result: '5th, Team DIGGAJ', href: 'https://ctftime.org/team/369743' },
  { year: '2026', event: 'Echelon Hackathon', organiser: 'SVNIT Surat', result: 'Top 8 finalist, through an online CTF round' },
  { year: '2026', event: 'Hacksplosion (GenW.AI)', organiser: 'Deloitte', result: 'Top 60 teams, two national rounds cleared' },
  { year: '2026', event: 'CTF season with Team DIGGAJ', organiser: 'CTFtime', result: '21 international CTFs', href: 'https://ctftime.org/team/369743' },
  { year: '2023', event: 'National Cyber Hygiene Initiative', organiser: 'AICTE and NCIIPC', result: 'Recognised by the Government of India' },
];

export interface RecordRow {
  name: string;
  detail?: string;
  value: string;
}

export interface RecordGroup {
  title: string;
  rows: RecordRow[];
}

export const record: RecordGroup[] = [
  {
    title: 'Experience',
    rows: [
      {
        name: 'Research intern, NIT Raipur',
        detail: 'Built the alert messaging and route prediction modules of VitalGrid, and its roadside-unit dashboard.',
        value: 'Jun to Jul 2026',
      },
      {
        name: 'Green Team member, NCIIPC and AICTE',
        detail: 'National cyber exercises on attacks against critical sectors. Vulnerability assessments and cyber hygiene work with ONGC, Adani and DERC.',
        value: 'Nov to Dec 2023',
      },
    ],
  },
  {
    title: 'Leadership',
    rows: [
      {
        name: 'Research Lead, The Cyber Alliance club',
        detail: 'Ran the Distinguished Speaker Series: four hybrid seminars with policymakers and industry speakers for 500+ students.',
        value: 'Apr 2025 to now',
      },
      {
        name: 'Student Campus Ambassador, Google for Developers',
        detail: 'Google Cloud and AI/ML workshops for 250+ students.',
        value: 'Jan 2025 to now',
      },
    ],
  },
  {
    title: 'Certifications',
    rows: [
      { name: 'Certified Network Security Practitioner (CNSP)', value: 'The SecOps Group' },
      { name: 'Certified Bug Bounty Professional', value: 'The SecOps Group' },
      { name: 'CCNA: ITN, SRWE and ENSA', value: 'Cisco Networking Academy' },
      { name: 'Python Essentials 1 and 2', value: 'Cisco Networking Academy' },
    ],
  },
  {
    title: 'Education',
    rows: [
      {
        name: 'B.Tech, Computer Science and Engineering (Cyber Security)',
        detail: 'Rashtriya Raksha University, an Institution of National Importance under the Ministry of Home Affairs.',
        value: '2023 to 2027',
      },
    ],
  },
];

// The record table in the first screen: the strongest proof, one line each.
export const highlights: { label: string; value: string; href: string }[] = [
  { label: 'LinkLens', value: '97.5% precision on 15,558 unseen pages', href: '#linklens' },
  { label: 'PwC Fiercest Competitor 5.0', value: 'Top 5, team lead', href: '#recognition' },
  { label: 'ApoorvCTF 2026', value: '5th, Team DIGGAJ', href: '#recognition' },
  { label: 'NCIIPC Green Team', value: 'Critical infrastructure, 2023', href: '#record' },
];
