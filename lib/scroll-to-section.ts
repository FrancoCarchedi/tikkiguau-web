const DEFAULT_NAV_OFFSET_PX = 64

/**
 * Smooth-scrolls to a section by id without updating the URL hash.
 * Accounts for the fixed navbar height by default.
 */
export function scrollToSection(
  sectionId: string,
  options?: { offsetPx?: number }
): void {
  const element = document.getElementById(sectionId)
  if (!element) return

  const offsetPx = options?.offsetPx ?? DEFAULT_NAV_OFFSET_PX
  const top = element.getBoundingClientRect().top + window.scrollY - offsetPx

  window.scrollTo({ top, behavior: 'smooth' })
}
