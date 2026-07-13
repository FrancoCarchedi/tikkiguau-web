const ALLOWED_TAGS = new Set([
  'svg',
  'path',
  'circle',
  'rect',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'use',
])

const ALLOWED_ATTRS = new Set([
  'xmlns',
  'viewbox',
  'width',
  'height',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'd',
  'cx',
  'cy',
  'r',
  'x',
  'y',
  'rx',
  'ry',
  'points',
  'transform',
  'class',
  'opacity',
  'fill-rule',
  'clip-rule',
])

const EVENT_HANDLER = /^on[a-z]+$/i
const MAX_SVG_LENGTH = 100_000

function stripDangerousContent(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(on\w+|href|xlink:href)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
}

function normalizeTagName(tag: string): string {
  return tag.replace(/^\//, '').split(/\s/)[0]?.toLowerCase() ?? ''
}

export function sanitizeSvgMarkup(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > MAX_SVG_LENGTH) {
    return null
  }

  if (!/^<svg[\s>]/i.test(trimmed)) {
    return null
  }

  const cleaned = stripDangerousContent(trimmed)
  const tagRegex = /<\/?([a-zA-Z][\w:-]*)([^>]*)>/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const tag = normalizeTagName(match[1])
    if (!ALLOWED_TAGS.has(tag)) {
      return null
    }

    const attrs = match[2] ?? ''
    const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g
    let attrMatch: RegExpExecArray | null

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase()
      if (EVENT_HANDLER.test(attrName) || !ALLOWED_ATTRS.has(attrName)) {
        return null
      }
    }
  }

  return cleaned.replace(/fill="[^"]*"/gi, 'fill="currentColor"')
}

export function isValidSvgMarkup(raw: string): boolean {
  return sanitizeSvgMarkup(raw) !== null
}
