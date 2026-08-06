/** Public Substack for updates, essays, and beta recruitment */
export const SUBSTACK_URL =
  'https://couplesgameplay.substack.com/?r=8v5x65&utm_campaign=pub-share-checklist'

export function getStartGamePath(): string {
  try {
    return window.localStorage.getItem('cg.disclaimerAccepted') === 'true'
      ? '/settings'
      : '/disclaimer'
  } catch {
    return '/disclaimer'
  }
}
