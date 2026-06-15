export function sanitizeBrandText(text = '') {
  if (!text) return text
  return text.replace(/\bCBS\b/gi, 'Aviora')
}
