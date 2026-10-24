/** Ouvre un Blob dans un nouvel onglet à partir d'une URL objet (jeton requis). */
export function openBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  // On libère l'URL après un délai pour laisser l'onglet la charger.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Force le téléchargement d'un Blob sous son nom d'origine. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'attachment'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
