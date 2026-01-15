export interface UserTagView {
  label: string
  className: string
}

export function buildUserTagsView(
  memberLevel: string,
  memberTags: string[]
): UserTagView[] {
  const result: UserTagView[] = []
  const levelText = (memberLevel || '').trim()

  if (levelText) {
    let label = levelText
    let className = 'tag-normal'
    if (levelText === '0' || levelText.includes('老村民')) {
      label = '老村民'
      className = 'tag-normal'
    } else if (levelText === '1' || levelText.includes('新村民')) {
      label = '新村民'
      className = 'tag-new'
    } else if (levelText === '2' || levelText.includes('数字游民')) {
      label = '数字游民'
      className = 'tag-normal'
    } else if (levelText === '3' || levelText.includes('游客')) {
      label = '游客'
      className = 'tag-normal'
    }
    result.push({ label, className })
  }

  const tagMap: Record<string, { label: string; className: string }> = {
    '0': { label: '空间主理人', className: 'tag-host' },
    '1': { label: '活动发起人', className: 'tag-host' },
  }

  const tagsArray: string[] = (memberTags || [])
    .map((it) => String(it).trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean)

  tagsArray.forEach((codeOrLabel) => {
    const mapped =
      tagMap[codeOrLabel] ||
      (codeOrLabel.includes('主理')
        ? { label: codeOrLabel, className: 'tag-host' }
        : { label: codeOrLabel, className: 'tag-normal' })
    result.push(mapped)
  })

  const seen = new Set<string>()
  return result.filter((t) => {
    const key = `${t.label}-${t.className}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
