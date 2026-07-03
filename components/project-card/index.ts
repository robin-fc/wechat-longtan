import { formatYMD, parseToDate } from '../../utils/date'
import type { ProjectListItem } from '../../model/project'

interface InterestCompanion {
  id: number
  avatar: { url: string }
}

function calcRemainingLabel(deadline: string, isCompleted: boolean): string {
  if (isCompleted) return '已结束'
  const end = parseToDate(deadline)
  if (!end) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  if (diff <= 0) return '已结束'
  return `剩余${diff}天`
}

function buildInterestCompanions(project: ProjectListItem): {
  companions: InterestCompanion[]
  totalCount: number
} {
  const users = project.interestUsers || []
  const totalCount = project.interestCount ?? users.length
  return {
    companions: users.slice(0, 5).map((u, index) => ({
      id: u.id ?? index,
      avatar: { url: u.logo },
    })),
    totalCount,
  }
}

Component({
  properties: {
    project: {
      type: Object,
      value: {} as ProjectListItem,
    },
    isCompleted: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    formattedDeadline: '',
    remainingLabel: '',
    memberTag: '',
    interestCompanions: {
      companions: [] as InterestCompanion[],
      totalCount: 0,
    },
  },

  observers: {
    'project, isCompleted': function (project: ProjectListItem, isCompleted: boolean) {
      if (!project || !project.id) return
      const initiator = project.initiator || ({} as ProjectListItem['initiator'])
      const memberTag = initiator.memberTags?.[0] || initiator.memberLevel || ''
      this.setData({
        formattedDeadline: formatYMD(project.deadline),
        remainingLabel: calcRemainingLabel(project.deadline, isCompleted),
        memberTag,
        interestCompanions: buildInterestCompanions(project),
      })
    },
  },

  methods: {
    onCardTap() {
      this.triggerEvent('cardtap', { id: this.data.project.id })
    },

    onInterestTap() {
      if (this.data.isCompleted) return
      this.triggerEvent('interesttap', { id: this.data.project.id, interested: this.data.project.interested })
    },

    onInitiatorTap() {
      const userId = this.data.project?.initiator?.userId
      if (!userId) return
      this.triggerEvent('initiatortap', { userId })
    },
  },
})
