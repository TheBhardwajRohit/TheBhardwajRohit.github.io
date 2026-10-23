import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BLOCKED_REASON as BLOCKED, checkLink, damerauLevenshtein, type LinkCheck } from '../src/lib/linkcheck.ts';
import { toUnicode } from '../src/lib/punycode.ts';

interface OracleCase {
  url: string;
  reasons: [string, number][];
  good: [string, number][];
}

// What LinkLens's own Python code says about each link (see _source in the file).
const oracle: { cases: OracleCase[] } = JSON.parse(readFileSync(new URL('./fixtures/linklens-oracle.json', import.meta.url), 'utf8'));

function ok(input: string): LinkCheck {
  const result = checkLink(input);
  assert.equal(result.ok, true, `expected a result for ${input}`);
  return result as LinkCheck;
}

for (const c of oracle.cases) {
  test(`matches LinkLens on ${c.url}`, () => {
    const r = ok(c.url);
    // The blocked-address reason comes from LinkLens's sandbox guard, not its link rules.
    const reasons = r.reasons.filter((x) => x.text !== BLOCKED).map((x) => [x.text, x.points]);
    assert.deepEqual(reasons, c.reasons);
    assert.deepEqual(r.goodSigns.map((x) => [x.text, x.points]), c.good);
  });
}

test('a private address is refused and kept out of Safe, as the sandbox guard does', () => {
  const r = ok('http://192.168.1.1/login');
  assert.ok(r.reasons.some((x) => x.text === BLOCKED));
  assert.ok(r.score >= 40);
  assert.equal(r.verdict, 'suspicious');
  assert.equal(ok('http://198.51.100.7/').reasons.some((x) => x.text === BLOCKED), false);
});

test('scores are clamped and banded like LinkLens', () => {
  assert.equal(ok('https://www.onlinesbi.sbi/').score, 0);
  assert.equal(ok('https://www.onlinesbi.sbi/').verdict, 'safe');
  assert.equal(ok('http://login.microsoftonline.com.verify-account.info/').score, 58);
  assert.equal(ok('http://login.microsoftonline.com.verify-account.info/').verdict, 'suspicious');
});

test('Unicode typed into the box is read as the browser encodes it', () => {
  const r = ok('https://аpple.com/signin');
  assert.equal(r.host, 'xn--pple-43d.com');
  assert.equal(r.unicodeHost, 'аpple.com');
  assert.equal(r.reasons[0].points, 45);
});

test('links are defanged for display', () => {
  assert.equal(ok('http://malware.testing.google.test/testing/malware/').defanged, 'hxxp://malware[.]testing[.]google[.]test/testing/malware/');
  assert.equal(ok('https://example.com:8443/a?b=c').defanged, 'hxxps://example[.]com:8443/a?b=c');
});

test('a scheme is added when missing, and only web links are accepted', () => {
  assert.equal(ok('example.com/login').url, 'http://example.com/login');
  assert.equal(ok('example.com:3000').host, 'example.com');
  assert.equal(checkLink('javascript:alert(1)').ok, false);
  assert.equal(checkLink('mailto:someone@example.com').ok, false);
  assert.equal(checkLink('   ').ok, false);
  assert.equal(checkLink('x'.repeat(3000)).ok, false);
  assert.equal(checkLink('http://').ok, false);
});

test('text that is not a single web address is refused, outside the LinkLens rules', () => {
  assert.equal(checkLink('not a link at all').ok, false);
  assert.equal(checkLink('hello').ok, false);
  assert.equal(checkLink('localhost:3000').ok, false);
  assert.equal(checkLink('https://example.com/a b').ok, false);
  assert.equal(ok('http://[::1]/').verdict, 'suspicious');
});

test('helpers', () => {
  assert.equal(damerauLevenshtein('flipkart', 'flipkrat'), 1);
  assert.equal(damerauLevenshtein('paypal', 'paypal'), 0);
  assert.equal(damerauLevenshtein('ca', 'abc'), 2);
  assert.equal(toUnicode('xn--mnchen-3ya.de'), 'münchen.de');
  assert.equal(toUnicode('xn--80ak6aa92e.com'), 'аррӏе.com');
});
