import { formatMMDD } from '../../utils/date'

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
  },
  observers: {
    'activity.timeRange.startTime': function (startTime) {
      if (startTime) {
        this.setData({
          formattedDate: formatMMDD(startTime),
        })
      }
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('cardtap', { activity: this.data.activity })
    },
  },
})
