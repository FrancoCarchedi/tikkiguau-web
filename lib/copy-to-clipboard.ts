/** Copia texto al portapapeles. Devuelve false si el navegador lo impide. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithSelectionFallback(text)
  }
}

function copyWithSelectionFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const wasCopied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return wasCopied
  } catch {
    return false
  }
}
