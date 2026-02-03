import { formatSmartTimeRange } from '../../utils/date'

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
                    updateData.formattedTimeRange = formatSmartTimeRange(activity.startTime, activity.endTime)
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
