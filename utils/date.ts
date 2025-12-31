export function parseToDate(v: any): Date | null {
  if (v === undefined || v === null) return null
  const s = String(v)
  const isNum = typeof v === 'number' || /^\d+$/.test(s)
  if (isNum) {
    return new Date(Number(v))
  }
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  return d
}

export function formatYMD(v: any): string {
  const d = parseToDate(v)
  if (!d) return String(v ?? '')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

export function formatYMDHM(v: any): string {
  const d = parseToDate(v)
  if (!d) return String(v ?? '')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${hh}:${mm}`
}

export function formatMMDD(v: any): string {
  const d = parseToDate(v)
  if (!d) return String(v ?? '')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}/${day}`
}
