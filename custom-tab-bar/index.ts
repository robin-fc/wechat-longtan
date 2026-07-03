Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#333333",
    list: [{
      pagePath: "/pages/home/index",
      text: "首页"
    }, {
      pagePath: "/pages/project/index",
      text: "项目"
    }, {
      pagePath: "/pages/activity/list",
      text: "活动"
    }, {
      pagePath: "/pages/homestay/list",
      text: "入住"
    }, {
      pagePath: "/pages/mine/index",
      text: "我的"
    }]
  },
  methods: {
    switchTab(e: any) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
    }
  }
})
