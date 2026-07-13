import { readFileSync } from 'fs'
import { join } from 'path'

const EMOJI_COMPONENT_FILES: Record<string, string> = {
  patitas: 'Patitas.tsx',
  corazon: 'Corazon.tsx',
  estrella: 'Estrella.tsx',
  calavera: 'Calavera.tsx',
  energia: 'Energia.tsx',
  flor: 'Flor.tsx',
  luna: 'Luna.tsx',
  pez: 'Pez.tsx',
}

export function extractSvgMarkupFromComponent(componentFileName: string): string {
  const filePath = join(
    process.cwd(),
    'components/designer/custom-emojis',
    componentFileName
  )
  const content = readFileSync(filePath, 'utf8')
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/)
  const widthMatch = content.match(/width="(\d+)"/)
  const heightMatch = content.match(/height="(\d+)"/)
  const pathMatch = content.match(/d="([^"]+)"/)

  if (!viewBoxMatch || !pathMatch) {
    throw new Error(`No se pudo extraer SVG de ${componentFileName}`)
  }

  const viewBox = viewBoxMatch[1]
  const width = widthMatch?.[1] ?? '512'
  const height = heightMatch?.[1] ?? '512'
  const pathD = pathMatch[1]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}"><path fill="currentColor" d="${pathD}"/></svg>`
}

export function getSeedEmojiSvgMarkup(key: string): string {
  const fileName = EMOJI_COMPONENT_FILES[key]
  if (!fileName) {
    throw new Error(`Emoji seed no configurado para key: ${key}`)
  }
  return extractSvgMarkupFromComponent(fileName)
}
