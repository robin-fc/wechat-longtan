import { formatMMDD, formatSmartTimeRange } from '../../utils/date'

Component({
  properties: {
    activity: {
      type: Object,
      value: {},
    },
    layout: {
      type: String,
      value: 'vertical',
    },
    compact: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    formattedDate: '',
    formattedTimeRange: '',
  },
  observers: {
    'activity.startTime, activity.endTime': function (startTime, endTime) {
      if (startTime) {
        this.setData({
          formattedDate: formatMMDD(startTime),
        })
      }
      this.setData({
        formattedTimeRange: formatSmartTimeRange(startTime, endTime)
      })
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('cardtap', { activity: this.data.activity })
    },
  },
})
