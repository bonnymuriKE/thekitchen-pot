/**
 * rehypeProductBlocks
 *
 * Upgrades plain Markdown patterns in articles into styled blocks, so the
 * article files stay simple Markdown and every article gets the same look.
 *
 * Patterns it recognises (all written as normal Markdown):
 *
 * 1. Product spec card
 *    ## 1. Product Name: Best Overall
 *    - **Type:** ...
 *    - **What's in the box:** ...
 *    A numbered H2 followed straight away by a list where every item starts
 *    with "**Label:**" becomes a spec card with the award as a badge.
 *
 * 2. Pros and cons box
 *    **What we like:**      (or "Pros:")
 *    - ...
 *    **What to know before you buy:**   (or "Cons:", "What we don't like:")
 *    - ...
 *    Becomes a two-column box with green ticks and amber warnings.
 *
 * 3. "Who should buy it" callout
 *    A paragraph starting with **Who should buy it:** gets a highlighted box.
 *
 * 4. Buy buttons
 *    A paragraph that contains only "Check price" style links becomes a row of
 *    centered buttons. Amazon links get the Amazon style, AWIN / other retailer
 *    links get the site's brand style.
 *
 * 5. "Jump to review" links
 *    In a "Top Picks" / "At a Glance" list, each item gets a link down to the
 *    matching numbered product section.
 */

const isElement = (node, tag) =>
  node && node.type === 'element' && (!tag || node.tagName === tag);

const isBlank = (node) =>
  node && node.type === 'text' && /^\s*$/.test(node.value);

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

function el(tagName, properties = {}, children = []) {
  return { type: 'element', tagName, properties, children };
}

function txt(value) {
  return { type: 'text', value };
}

/** Meaningful (non-whitespace) children of a node. */
function realChildren(node) {
  return (node.children || []).filter((c) => !isBlank(c));
}

/** First non-blank child element of an <li>, unwrapping a single <p>. */
function liContent(li) {
  const kids = realChildren(li);
  if (kids.length === 1 && isElement(kids[0], 'p')) return realChildren(kids[0]);
  return kids;
}

/** "**Label:** rest" -> { label, rest } or null */
function splitLabeled(li) {
  const kids = liContent(li);
  if (!kids.length || !isElement(kids[0], 'strong')) return null;
  const label = textOf(kids[0]).trim();
  if (!label.endsWith(':')) return null;
  const rest = kids.slice(1);
  // trim leading space of first text node
  if (rest[0] && rest[0].type === 'text') {
    rest[0] = txt(rest[0].value.replace(/^\s+/, ''));
  }
  return { label: label.slice(0, -1).trim(), rest };
}

/** Paragraph that is only a bold label, e.g. <p><strong>What we like:</strong></p> */
function labelParagraph(node) {
  if (!isElement(node, 'p')) return null;
  const kids = realChildren(node);
  if (kids.length !== 1 || !isElement(kids[0], 'strong')) return null;
  return textOf(kids[0]).trim().replace(/:$/, '').trim();
}

const PROS_RE = /^(what we like|pros|what we love|why we picked it|the good)$/i;
const CONS_RE = /^(what to know before you buy|cons|what we don'?t like|downsides|the not so good|things to consider|keep in mind)$/i;
const CTA_TEXT_RE = /^(check|see|view|buy|shop|get)\b.*\b(price|amazon|deal|at\b)/i;
const PICKS_RE = /(top picks|at a glance|our picks|quick picks)/i;
const PRODUCT_H2_RE = /^\s*(\d+)\.\s+(.+?)\s*$/;

const CART_SVG = el(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ariaHidden: 'true',
    className: ['cta-icon'],
  },
  [
    el('circle', { cx: '9', cy: '21', r: '1' }),
    el('circle', { cx: '20', cy: '21', r: '1' }),
    el('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }),
  ]
);

function splitAward(title) {
  // "Cuisinart MultiClad Pro 12-Piece Set: Best Overall"
  const idx = title.lastIndexOf(':');
  if (idx > 0 && idx < title.length - 1) {
    return { name: title.slice(0, idx).trim(), award: title.slice(idx + 1).trim() };
  }
  return { name: title.trim(), award: '' };
}

function buildSpecCard(h2, ul) {
  const { name, award } = splitAward(textOf(h2).replace(PRODUCT_H2_RE, '$2'));
  const rows = [];
  for (const li of realChildren(ul)) {
    const s = splitLabeled(li);
    if (!s) continue;
    const wide = s.rest.map(textOf).join('').length > 48;
    rows.push(
      el('div', { className: wide ? ['spec-row', 'spec-row-wide'] : ['spec-row'] }, [
        el('dt', { className: ['spec-label'] }, [txt(s.label)]),
        el('dd', { className: ['spec-value'] }, s.rest),
      ])
    );
  }
  const header = [];
  if (award) header.push(el('span', { className: ['spec-badge'] }, [txt(award)]));
  header.push(el('span', { className: ['spec-name'] }, [txt(name)]));
  return el('div', { className: ['spec-card', 'not-prose'] }, [
    el('div', { className: ['spec-card-head'] }, header),
    el('dl', { className: ['spec-grid'] }, rows),
  ]);
}

function isSpecList(ul) {
  if (!isElement(ul, 'ul')) return false;
  const items = realChildren(ul).filter((c) => isElement(c, 'li'));
  return items.length >= 2 && items.every((li) => splitLabeled(li));
}

function ctaLinks(p) {
  if (!isElement(p, 'p')) return null;
  const kids = realChildren(p);
  if (!kids.length) return null;
  const links = [];
  for (const k of kids) {
    if (isElement(k, 'a')) {
      if (!CTA_TEXT_RE.test(textOf(k).trim())) return null;
      links.push(k);
    } else if (k.type === 'text' && /^[\s|·•\-–—]*$/.test(k.value)) {
      continue;
    } else {
      return null;
    }
  }
  return links.length ? links : null;
}

function styleCta(a) {
  const href = String(a.properties?.href || '');
  const isAmazon = /amazon\.|amzn\.to/i.test(href);
  const classes = ['cta-btn', isAmazon ? 'cta-amazon' : 'cta-retailer'];
  a.properties = {
    ...a.properties,
    className: classes,
    target: '_blank',
    rel: 'sponsored noopener noreferrer',
  };
  a.children = [CART_SVG, el('span', {}, a.children)];
  return a;
}

export default function rehypeProductBlocks() {
  return (tree) => {
    const nodes = tree.children;

    // Pass 1: collect numbered product headings (for jump links).
    const productHeads = [];
    for (const n of nodes) {
      if (isElement(n, 'h2') && PRODUCT_H2_RE.test(textOf(n)) && n.properties?.id) {
        productHeads.push({ id: n.properties.id, title: textOf(n).replace(PRODUCT_H2_RE, '$2') });
      }
    }

    const out = [];
    // index-based walk over meaningful nodes, keeping whitespace as-is
    const idxs = nodes.map((n, i) => (isBlank(n) ? -1 : i)).filter((i) => i >= 0);
    const consumed = new Set();

    const nextReal = (pos) => {
      const k = idxs.indexOf(pos);
      return k >= 0 && k + 1 < idxs.length ? idxs[k + 1] : -1;
    };

    for (let i = 0; i < nodes.length; i++) {
      if (consumed.has(i)) continue;
      const n = nodes[i];

      // 1. Product spec card (keep the H2, replace the list after it)
      if (isElement(n, 'h2') && PRODUCT_H2_RE.test(textOf(n))) {
        out.push(n);
        const j = nextReal(i);
        if (j >= 0 && isSpecList(nodes[j])) {
          out.push(txt('\n'), buildSpecCard(n, nodes[j]));
          for (let k = i + 1; k <= j; k++) consumed.add(k);
        }
        continue;
      }

      // 5. Jump-to-review links in the top picks list
      if (isElement(n, 'h2') && PICKS_RE.test(textOf(n))) {
        out.push(n);
        const j = nextReal(i);
        if (j >= 0 && isElement(nodes[j], 'ul') && productHeads.length) {
          const items = realChildren(nodes[j]).filter((c) => isElement(c, 'li'));
          items.forEach((li, idx) => {
            let target = null;
            const itemText = textOf(li).toLowerCase();
            // Prefer a name match, fall back to position.
            target =
              productHeads.find((h) => {
                const nm = splitAward(h.title).name.toLowerCase();
                const key = nm.split(/\s+/).slice(0, 3).join(' ');
                return key && itemText.includes(key);
              }) || (items.length === productHeads.length ? productHeads[idx] : null);
            if (target) {
              li.properties = { ...li.properties, className: ['pick-item'] };
              li.children = [
                el('span', { className: ['pick-text'] }, (() => {
                  const kids = realChildren(li);
                  const base = kids.length === 1 && isElement(kids[0], 'p') ? kids[0].children : li.children;
                  // keep a visible space after the bold label ("Best overall: Product")
                  const outKids = [];
                  base.forEach((c, ci) => {
                    const prev = base[ci - 1];
                    if (isBlank(c) && isElement(prev, 'strong')) return; // replaced below
                    outKids.push(c);
                    if (isElement(c, 'strong')) outKids.push(txt('\u00a0'));
                  });
                  return outKids;
                })()),
                el('a', { href: `#${target.id}`, className: ['jump-link'] }, [txt('Jump to review ↓')]),
              ];
            }
          });
          nodes[j].properties = { ...nodes[j].properties, className: ['picks-list'] };
        }
        continue;
      }

      // 2. Pros / cons box
      const lbl = labelParagraph(n);
      if (lbl && (PROS_RE.test(lbl) || CONS_RE.test(lbl))) {
        const j = nextReal(i);
        if (j >= 0 && isElement(nodes[j], 'ul')) {
          const cols = [];
          const addCol = (label, ul) => {
            const pro = PROS_RE.test(label);
            ul.properties = { ...ul.properties, className: [pro ? 'pc-list-pro' : 'pc-list-con'] };
            cols.push(
              el('div', { className: [pro ? 'pc-col-pro' : 'pc-col-con'] }, [
                el('p', { className: ['pc-title'] }, [txt(label)]),
                ul,
              ])
            );
          };
          addCol(lbl, nodes[j]);
          for (let k = i + 1; k <= j; k++) consumed.add(k);
          // Look for the partner block right after.
          const k1 = nextReal(j);
          const lbl2 = k1 >= 0 ? labelParagraph(nodes[k1]) : null;
          if (lbl2 && (PROS_RE.test(lbl2) || CONS_RE.test(lbl2)) && PROS_RE.test(lbl2) !== PROS_RE.test(lbl)) {
            const k2 = nextReal(k1);
            if (k2 >= 0 && isElement(nodes[k2], 'ul')) {
              addCol(lbl2, nodes[k2]);
              for (let k = j + 1; k <= k2; k++) consumed.add(k);
            }
          }
          out.push(el('div', { className: ['pros-cons', 'not-prose'] }, cols));
          continue;
        }
      }

      // 3. "Who should buy it" callout
      if (isElement(n, 'p')) {
        const kids = realChildren(n);
        if (kids.length && isElement(kids[0], 'strong') && /^who (should|is it for)/i.test(textOf(kids[0]).trim())) {
          n.properties = { ...n.properties, className: ['who-for'] };
          out.push(n);
          continue;
        }
      }

      // 4. Buy buttons
      const links = ctaLinks(n);
      if (links) {
        out.push(el('div', { className: ['cta-row', 'not-prose'] }, links.map(styleCta)));
        continue;
      }

      out.push(n);
    }

    tree.children = out;
  };
}
