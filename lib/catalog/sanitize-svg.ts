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
  'fill-opacity',
  'stroke-opacity',
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

function sanitizeAttributes(attrs: string): string | null {
  const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g
  const kept: string[] = []
  let attrMatch: RegExpExecArray | null

  while ((attrMatch = attrRegex.exec(attrs)) !== null) {
    const originalName = attrMatch[1]
    const attrName = originalName.toLowerCase()
    const attrValue = attrMatch[2]

    if (EVENT_HANDLER.test(attrName)) {
      return null
    }

    // Namespaced attrs (xmlns:xlink, xml:space, data-*) se descartan;
    // solo se conservan atributos permitidos de forma explícita.
    if (!ALLOWED_ATTRS.has(attrName)) {
      continue
    }

    // Preservar casing original (viewBox, etc. son case-sensitive en SVG).
    kept.push(`${originalName}=${attrValue}`)
  }

  return kept.join(' ')
}

/**
 * Sanitiza markup SVG de emojis del CMS.
 * - Rechaza tags peligrosos o handlers de eventos.
 * - Elimina atributos no permitidos (p. ej. style, version, data-*)
 *   en lugar de fallar: los SVG exportados de bancos de íconos suelen traerlos.
 * - Normaliza fills a currentColor para tintado en el diseñador.
 */
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
  let result = ''
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(cleaned)) !== null) {
    result += cleaned.slice(lastIndex, match.index)
    lastIndex = tagRegex.lastIndex

    const rawTag = match[1]
    const tag = normalizeTagName(rawTag)
    const isClosing = match[0].startsWith('</')
    const isSelfClosing = /\/\s*>$/.test(match[0])

    if (!ALLOWED_TAGS.has(tag)) {
      return null
    }

    if (isClosing) {
      result += `</${tag}>`
      continue
    }

    const sanitizedAttrs = sanitizeAttributes(match[2] ?? '')
    if (sanitizedAttrs === null) {
      return null
    }

    const attrsPart = sanitizedAttrs.length > 0 ? ` ${sanitizedAttrs}` : ''
    result += isSelfClosing ? `<${tag}${attrsPart} />` : `<${tag}${attrsPart}>`
  }

  result += cleaned.slice(lastIndex)

  if (!/^<svg[\s>]/i.test(result.trim())) {
    return null
  }

  return result.replace(/\bfill=(["'])[^"']*\1/gi, 'fill="currentColor"')
}

export function isValidSvgMarkup(raw: string): boolean {
  return sanitizeSvgMarkup(raw) !== null
}
