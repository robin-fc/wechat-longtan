Page({
  data: {
    form: {
      name: '',
      coverUrl: '',
      listUrl: '',
      description: '',
    },
  },
  onNameChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.name': e.detail.value,
    })
  },
  onDescriptionChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.description': e.detail.value,
    })
  },
  onChooseCoverTap() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const url = (res.tempFilePaths || [])[0] || ''
        this.setData({
          'form.coverUrl': url,
        })
      },
    })
  },
  onChooseListTap() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const url = (res.tempFilePaths || [])[0] || ''
        this.setData({
          'form.listUrl': url,
        })
      },
    })
  },
  onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const form = (this.data as any).form as {
      name: string
      coverUrl: string
      listUrl: string
      description: string
    }
    if (!form.name.trim()) {
      wx.showToast({
        title: '请填写合集名称',
        icon: 'none',
      })
      return
    }
    if (!form.coverUrl) {
      wx.showToast({
        title: '请上传封面图',
        icon: 'none',
      })
      return
    }
    if (!form.listUrl) {
      wx.showToast({
        title: '请上传列表图',
        icon: 'none',
      })
      return
    }
    if (!form.description.trim()) {
      wx.showToast({
        title: '请填写合集介绍',
        icon: 'none',
      })
      return
    }
    wx.showToast({
      title: '合集已创建',
      icon: 'success',
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  },
})
