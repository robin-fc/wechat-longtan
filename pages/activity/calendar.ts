import { getActivityCalendar } from '../../api/activity'

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    showHomeButton: false,
    monthStr: '', // YYYY-MM
    currentMonthText: '', // YYYY年M月
    flatList: [] as any[],
    loading: true,
    navOpacity: 0,
    navTitleColor: '#ffffff',
    iconFilter: 'none',
    isNavDark: false
  },

  onLoad() {
    const sys = wx.getWindowInfo()
    this.setData({
      statusBarHeight: sys.statusBarHeight
    })
    const pages = getCurrentPages()
    const showHomeButton = pages.length === 1
    this.setData({ showHomeButton })

    this.initCurrentMonth()
  },

  onBack() {
    if (this.data.showHomeButton) {
      wx.switchTab({ url: '/pages/home/index' })
    } else {
      wx.navigateBack()
    }
  },

  initCurrentMonth() {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const monthStr = `${year}-${month}`
    const currentMonthText = `${year}年${now.getMonth() + 1}月`

    this.setData({
      monthStr,
      currentMonthText
    })

    this.fetchData(monthStr)
  },

  async fetchData(month: string) {
    this.setData({ loading: true })
    try {
      const res = await getActivityCalendar(month)
      const flatList: any[] = []
      ;(res || []).forEach(day => {
        const formattedDate = this.formatDateStr(day.date)
        ;(day.activities || []).forEach(act => {
          flatList.push({
            ...act,
            formattedDate
          })
        })
      })

      this.setData({
        flatList,
        loading: false
      })
    } catch (e) {
      console.error('Failed to fetch calendar:', e)
      wx.showToast({
        title: '获取日历失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  formatDateStr(dateStr: string) {
    // dateStr form is generally '2024-12-01'
    const date = new Date(dateStr.replace(/-/g, '/')) // Replace hyphens for mobile Safari compatibility
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const week = weekDays[date.getDay()]
    return `${month}/${day} ${week}`
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({
        url: `/pages/activity/detail?id=${id}`
      })
    }
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop
    let opacity = scrollTop / 100
    if (opacity > 1) opacity = 1
    if (opacity < 0) opacity = 0
    opacity = Number(opacity.toFixed(2))

    const isDark = opacity > 0.5

    if (this.data.navOpacity !== opacity) {
      this.setData({ navOpacity: opacity })
    }

    if (this.data.isNavDark !== isDark) {
      this.setData({
        isNavDark: isDark,
        navTitleColor: isDark ? '#000000' : '#ffffff',
        iconFilter: isDark ? 'invert(1)' : 'none'
      })
      wx.setNavigationBarColor({
        frontColor: isDark ? '#000000' : '#ffffff',
        backgroundColor: '#ffffff'
      })
    }
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 活动日历',
      path: '/pages/activity/calendar',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 活动日历',
    }
  }
})
