Component({
  properties: {
    value: {
      type: String,
      value: '',
      observer(val: string) {
        this.initFromValue(val)
      },
    },
    placeholderDate: {
      type: String,
      value: '日期',
    },
    placeholderTime: {
      type: String,
      value: '时间',
    },
  },
  data: {
    date: '',
    time: '',
    minDate: '',
  },
  lifetimes: {
    attached() {
      const v = (this.data as any).value as string
      this.initFromValue(v)

      // Calculate today's date for limiting the date picker
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      this.setData({ minDate: `${year}-${month}-${day}` })
    },
  },
  methods: {
    initFromValue(val?: string) {
      const v = (val || '').trim()
      if (!v) {
        this.setData({ date: '', time: '' })
        return
      }
      if (v.indexOf('T') > -1) {
        const parts = v.split('T')
        const date = parts[0]
        const hhmm = parts[1].split(':').slice(0, 2).join(':')
        this.setData({ date, time: hhmm })
        return
      }
      const m = v.split(' ')
      if (m.length >= 2) {
        const date = m[0]
        const hhmm = m[1].slice(0, 5)
        this.setData({ date, time: hhmm })
        return
      }
      // 尝试解析单一的日期或时间
      // 包含 - 且不含 : 视为日期
      if (v.indexOf('-') > -1 && v.indexOf(':') === -1) {
        this.setData({ date: v, time: '' })
        return
      }
      // 包含 : 且不含 - 视为时间
      if (v.indexOf(':') > -1 && v.indexOf('-') === -1) {
        const hhmm = v.slice(0, 5)
        this.setData({ date: '', time: hhmm })
        return
      }
      this.setData({ date: '', time: '' })
    },
    onDateChange(e: WechatMiniprogram.PickerChange) {
      const raw = e.detail.value
      const date = typeof raw === 'string' ? raw : ''
      const store = this.data as WechatMiniprogram.IAnyObject
      const time = typeof store.time === 'string' ? store.time : ''
      this.setData({ date })
      this.triggerEvent('change', { date, time })
    },
    onTimeChange(e: WechatMiniprogram.PickerChange) {
      const raw = e.detail.value
      const time = typeof raw === 'string' ? raw : ''
      const store = this.data as WechatMiniprogram.IAnyObject
      const date = typeof store.date === 'string' ? store.date : ''
      this.setData({ time })
      this.triggerEvent('change', { date, time })
    },
  },
})
