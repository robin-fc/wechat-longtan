export function toISO8601(date: string, time: string): string {
  const dd = (date || '').trim()
  const tt = (time || '').trim()
  if (!dd) return ''
  const [y, m, d] = dd.split('-').map((x) => Number(x))
  const parts = tt ? tt.split(':') : []
  const hh = Number(parts[0] || 0)
  const mm = Number(parts[1] || 0)
  const ss = Number(parts[2] || 0)
  const dt = new Date(y || 0, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0, 0)
  const yyyy = dt.getUTCFullYear()
  const MM = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const DD = String(dt.getUTCDate()).padStart(2, '0')
  const HH = String(dt.getUTCHours()).padStart(2, '0')
  const Min = String(dt.getUTCMinutes()).padStart(2, '0')
  const SS = String(dt.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}-${MM}-${DD}T${HH}:${Min}:${SS}Z`
}

export function toISO8601FromLocal(local: string): string {
  const v = (local || '').trim()
  if (!v) return ''
  if (v.indexOf('T') > -1) return v
  const seg = v.split(' ')
  const date = seg[0] || ''
  const time = (seg[1] || '').slice(0, 8)
  return toISO8601(date, time)
}
