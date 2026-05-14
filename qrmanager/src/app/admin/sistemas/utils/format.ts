export function formatDate(str: string): string {
  if (!str || str === '—') return '—'
  const [date, time] = str.split('T')
  return time ? `${date}  ${time.slice(0, 5)}` : date
}

export function getColorLabel(hex: string): string {
  const map: Record<string, string> = {
    '#BE2D26': 'Rojo',
    '#1D4ED8': 'Azul',
    '#7C3AED': 'Violeta',
    '#D97706': 'Ámbar',
    '#059669': 'Verde',
    '#0F766E': 'Teal',
    '#DB2777': 'Rosa',
    '#EA580C': 'Naranja',
    '#0284C7': 'Celeste',
  }
  return map[hex] ?? hex
}