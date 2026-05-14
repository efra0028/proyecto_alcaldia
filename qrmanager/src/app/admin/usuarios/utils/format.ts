import { AVATAR_PALETTE } from '../data/constants'

export function getInitiales(nombre: string): string {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function getAvatarColor(id: number): string {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length]
}

export function formatDate(str: string): string {
  if (!str || str === '—') return '—'
  const [date, time] = str.split(' ')
  return time ? `${date}  ${time}` : date
}
