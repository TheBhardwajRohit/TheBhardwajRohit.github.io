// Splits text with [label](https://...) links into plain and link segments, so data strings
// can carry a source link without holding HTML.

export interface Segment {
  text: string;
  href?: string;
}

const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
