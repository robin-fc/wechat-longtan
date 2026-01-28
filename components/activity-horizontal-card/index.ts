import { formatYMDHM } from '../../utils/date'

Component({
    properties: {
        activity: {
            type: Object,
            value: {},
        },
    },
    data: {
        formattedTimeRange: '',
    },
    observers: {
        'activity': function (activity) {
            if (activity) {
                const updateData: any = {};
                if (activity.startTime && activity.endTime) {
                    const startStr = formatYMDHM(activity.startTime)
                    const endStr = formatYMDHM(activity.endTime)

                    const startDate = startStr.split(' ')[0]
                    const endDate = endStr.split(' ')[0]

                    if (startDate === endDate) {
                        // Same date, show YYYY/MM/DD HH:mm-HH:mm
                        const startTime = startStr.split(' ')[1]
                        const endTime = endStr.split(' ')[1]
                        updateData.formattedTimeRange = `${startDate} ${startTime}-${endTime}`
                    } else {
                        // Different date, show full range
                        updateData.formattedTimeRange = `${startStr}-${endStr}`
                    }
                }

                // Map registeredUsers to companions if companions is missing
                if (!activity.companions && activity.registeredUsers) {
                    updateData.localCompanions = {
                        companions: activity.registeredUsers.map((u: any) => ({
                            avatar: { url: u.logo }
                        })).slice(0, 5), // Limit to 5
                        totalCount: activity.registeredCount || activity.registeredUsers.length
                    }
                } else if (activity.companions) {
                    updateData.localCompanions = activity.companions
                }

                // Calculate remaining slots
                if (activity.isLimitParticipants && activity.maxParticipants) {
                    updateData.remainingSlots = Math.max(0, activity.maxParticipants - (activity.registeredCount || 0));
                }

                this.setData(updateData);
            }
        }
    },
    methods: {
        onTap(this: WechatMiniprogram.Component.TrivialInstance) {
            this.triggerEvent('cardtap', { activity: this.data.activity })
        },
    },
})
