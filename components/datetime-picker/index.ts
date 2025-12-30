Component({
  properties: {
    value: {
      type: String,
      value: '',
      observer(val: string) {
        this.initFromValue(val)
      },
    },
    placeholder: {
      type: String,
      value: '选择日期时间',
    },
  },
  data: {
    date: '',
    time: '',
    isoText: '',
    placeholderDate: '选择日期',
    placeholderTime: '选择时间',
    showPanel: false,
    tempDate: '',
    tempTime: '',
    previewISO: '',
  },
  lifetimes: {
    attached() {
      const v = (this.data as any).value as string
      this.initFromValue(v)
    },
  },
  methods: {
    initFromValue(val?: string) {
      const v = (val || '').trim()
      if (!v) {
        this.setData({ isoText: '' })
        return
      }
      const parts = v.split('T')
      if (parts.length >= 2) {
        const date = parts[0]
        const timePart = parts[1]
        const hhmm = timePart.split(':').slice(0, 2).join(':')
        this.setData({
          date,
          time: hhmm,
          isoText: v,
          tempDate: date,
          tempTime: hhmm,
          previewISO: v,
        })
      } else {
        // fallback: try to parse "YYYY-MM-DD HH:mm"
        const m = v.split(' ')
        if (m.length >= 2) {
          const date = m[0]
          const hhmm = m[1].slice(0, 5)
          const iso = this.buildISO(date, hhmm)
          this.setData({ date, time: hhmm, isoText: iso, tempDate: date, tempTime: hhmm, previewISO: iso })
        } else {
          this.setData({ isoText: v, previewISO: v })
        }
      }
    },
    openPanel() {
      const d = (this.data as any).date || this.today()
      const t = (this.data as any).time || '00:00'
      const iso = this.buildISO(d, t)
      this.setData({
        showPanel: true,
        tempDate: d,
        tempTime: t,
        previewISO: iso,
      })
    },
    onCancel() {
      this.setData({ showPanel: false })
    },
    onConfirm() {
      const date = (this.data as any).tempDate || this.today()
      const time = (this.data as any).tempTime || '00:00'
      const iso = this.buildISO(date, time)
      this.setData({
        showPanel: false,
        date,
        time,
        isoText: iso,
      })
      this.triggerEvent('change', { value: iso, date, time })
    },
    onDateChange(e: WechatMiniprogram.PickerChange) {
      const date = e.detail.value
      const time = (this.data as any).tempTime || '00:00'
      const iso = this.buildISO(date, time)
      this.setData({ tempDate: date, previewISO: iso })
    },
    onTimeChange(e: WechatMiniprogram.PickerChange) {
      const time = e.detail.value
      const date = (this.data as any).tempDate || this.today()
      const iso = this.buildISO(date, time)
      this.setData({ tempTime: time, previewISO: iso })
    },
    today(): string {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    buildISO(date: string, hhmm: string): string {
      const [y, m, d] = date.split('-').map((x) => Number(x))
      const [hh, mm] = hhmm.split(':').map((x) => Number(x))
      const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
      const yyyy = dt.getUTCFullYear()
      const MM = String(dt.getUTCMonth() + 1).padStart(2, '0')
      const DD = String(dt.getUTCDate()).padStart(2, '0')
      const HH = String(dt.getUTCHours()).padStart(2, '0')
      const Min = String(dt.getUTCMinutes()).padStart(2, '0')
      const SS = String(dt.getUTCSeconds()).padStart(2, '0')
      return `${yyyy}-${MM}-${DD}T${HH}:${Min}:${SS}Z`
    },
    noop() {},
  },
})
