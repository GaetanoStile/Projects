export function getStartGamePath(): string {
  try {
    return window.localStorage.getItem('cg.disclaimerAccepted') === 'true'
      ? '/settings'
      : '/disclaimer'
  } catch {
    return '/disclaimer'
  }
}
