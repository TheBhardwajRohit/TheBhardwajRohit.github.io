// Punycode decoder (RFC 3492), enough to show what an "xn--" label really says.
// Browsers already encode Unicode host names to punycode; this turns them back.

const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((BASE - T_MIN) * T_MAX) >> 1) {
    d = Math.floor(d / (BASE - T_MIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - T_MIN + 1) * d) / (d + SKEW));
}

function digitValue(code: number): number {
  if (code >= 48 && code <= 57) return code - 22; // 0-9 -> 26-35
  if (code >= 65 && code <= 90) return code - 65; // A-Z
  if (code >= 97 && code <= 122) return code - 97; // a-z
  return BASE;
}

/** Decodes one punycode label body (without the "xn--" prefix). Throws on malformed input. */
export function decodeLabel(input: string): string {
  const output: number[] = [];
  const basicEnd = input.lastIndexOf('-');
  for (let j = 0; j < Math.max(basicEnd, 0); j++) {
    const code = input.charCodeAt(j);
    if (code >= 0x80) throw new RangeError('not a basic code point');
    output.push(code);
  }

  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let i = 0;
  for (let index = basicEnd > 0 ? basicEnd + 1 : 0; index < input.length; ) {
    const oldI = i;
    for (let w = 1, k = BASE; ; k += BASE) {
      if (index >= input.length) throw new RangeError('truncated punycode');
      const digit = digitValue(input.charCodeAt(index++));
      if (digit >= BASE) throw new RangeError('invalid punycode digit');
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }
    const length = output.length + 1;
    bias = adapt(i - oldI, length, oldI === 0);
    n += Math.floor(i / length);
    i %= length;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

/** Turns every "xn--" label of a host name back into Unicode; leaves the host as it is if any label is malformed. */
export function toUnicode(host: string): string {
  try {
    return host
      .split('.')
      .map((label) => (label.startsWith('xn--') ? decodeLabel(label.slice(4)) : label))
      .join('.');
  } catch {
    return host;
  }
}
