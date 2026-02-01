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

// 使用指定的分隔符格式化日期， 默认为YYYY/MM/DD ，可指定分为隔符为其他格式,如YYYY-MM-DD
export function formatYMD1(v: any, sep: string = '/'): string {
  const d = parseToDate(v)
  if (!d) return String(v ?? '')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${sep}${m}${sep}${day}`
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

export function formatSmartTimeRange(start: any, end: any): string {
  const d1 = parseToDate(start)
  const d2 = parseToDate(end)
  if (!d1) return ''

  const m1 = String(d1.getMonth() + 1).padStart(2, '0')
  const day1 = String(d1.getDate()).padStart(2, '0')
  const h1 = String(d1.getHours()).padStart(2, '0')
  const min1 = String(d1.getMinutes()).padStart(2, '0')
  const part1 = `${m1}/${day1} ${h1}:${min1}`

  if (!d2) return part1

  const h2 = String(d2.getHours()).padStart(2, '0')
  const min2 = String(d2.getMinutes()).padStart(2, '0')

  // Check if same day
  if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()) {
    return `${part1}-${h2}:${min2}`
  }

  const m2 = String(d2.getMonth() + 1).padStart(2, '0')
  const day2 = String(d2.getDate()).padStart(2, '0')
  return `${part1}-${m2}/${day2} ${h2}:${min2}`
}
