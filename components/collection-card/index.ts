Component({
  properties: {
    collection: {
      type: Object,
      value: {},
      observer(this: WechatMiniprogram.Component.TrivialInstance, v: any) {
        const logo =
          (v && (v.logo || v.coverUrl || v.listUrl)) || ''
        const isInvalid =
          /^\/components\/collection-card\//.test(String(logo)) ||
          !/\.(png|jpg|jpeg|gif|webp)$/i.test(String(logo))
        const displayLogo = isInvalid
          ? '/assets/images/activity.jpg'
          : logo
        this.setData({ displayLogo })
      },
    },
  },
  data: {
    displayLogo: '/assets/images/activity.jpg',
  },
  lifetimes: {
    attached(this: WechatMiniprogram.Component.TrivialInstance) {
      const v = (this.data as any).collection || {}
      const logo =
        (v && (v.logo || v.coverUrl || v.listUrl)) || ''
      const isInvalid =
        /^\/components\/collection-card\//.test(String(logo)) ||
        !/\.(png|jpg|jpeg|gif|webp)$/i.test(String(logo))
      const displayLogo = isInvalid
        ? '/assets/images/activity.jpg'
        : logo
      this.setData({ displayLogo })
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { collection: this.data.collection })
    },
  },
})
