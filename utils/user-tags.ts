export interface UserTagView {
  label: string
  className: string
  action?: string
}

export function buildUserTagsView(
  memberLevel: string,
  memberTags: string[],
  nomadApplyStatus?: string
): { levelTags: UserTagView[]; roleTags: UserTagView[]; noMadTags: UserTagView[] } {
  const levelTags: UserTagView[] = []
  const roleTags: UserTagView[] = []
  const noMadTags: UserTagView[] = []
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
      className = 'tag-nomad-green'
    } else if (levelText === '3' || levelText.includes('游客')) {
      label = '游客'
      className = 'tag-nomad-green'
      // If user is a visitor, check application status
      if (nomadApplyStatus) {
        // Optionally add another tag or just logic here.
        // But the requirement says "add field". 
        // We will add a separate tag implementation below or push to result.
      }
    }
    levelTags.push({ label, className })

    if ((levelText === '3' || levelText.includes('游客')) && nomadApplyStatus) {
      if (['未申请', '审核中', '再次申请'].includes(nomadApplyStatus)) {
        let statusClass = 'tag-normal'
        let action = ''
        let label = nomadApplyStatus

        if (nomadApplyStatus === '未申请') {
          statusClass = 'tag-nomad-green big'
          action = 'goApply'
          label = '数字游民认证'
        } else if (nomadApplyStatus === '审核中') {
          statusClass = 'tag-nomad-green'
          // No click action for under review
        } else if (nomadApplyStatus === '再次申请') {
          statusClass = 'tag-nomad-red'
          action = 'goApply'
        }

        noMadTags.push({ label, className: statusClass, action })
      }
    }
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
    roleTags.push(mapped)
  })

  // Dedup logic if needed, applying to each list separately
  const uniqueTags = (tags: UserTagView[]) => {
    const seen = new Set<string>()
    return tags.filter((t) => {
      const key = `${t.label}-${t.className}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  return {
    levelTags: uniqueTags(levelTags),
    roleTags: uniqueTags(roleTags),
    noMadTags: uniqueTags(noMadTags),
  }
}
