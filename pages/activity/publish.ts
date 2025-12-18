import { goBack } from '../../utils/navigation'

interface PublishFormState {
  title: string
  collectionId: string
  price: string
  free: boolean
  type: string
  limit: string
  startTime: string
  endTime: string
  space: string
  posterUrl: string
  description: string
}

interface PublishPageState {
  form: PublishFormState
  collectionOptions: { id: string; name: string }[]
  collectionIndex: number
  typeOptions: string[]
  typeIndex: number
  spaceOptions: string[]
  spaceIndex: number
}

Page<PublishPageState, WechatMiniprogram.IAnyObject>({
  data: {
    form: {
      title: '',
      collectionId: '',
      price: '',
      free: false,
      type: '摄影',
      limit: '',
      startTime: '',
      endTime: '',
      space: '空间A',
      posterUrl: '',
      description: '',
    },
    collectionOptions: [
      { id: '', name: '不关联合集' },
      { id: 'col-1', name: '周末自然漫游系列' },
    ],
    collectionIndex: 0,
    typeOptions: ['摄影', '插画', '木工', '陶艺', '雕刻'],
    typeIndex: 0,
    spaceOptions: ['空间A', '空间B', '空间C'],
    spaceIndex: 0,
  },
  onBackTap() {
    goBack()
  },
  onTitleChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.title': e.detail.value,
    })
  },
  onCollectionChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const index = Number(e.detail.value || 0)
    const options = (this.data as PublishPageState).collectionOptions
    const target = options[index]
    this.setData({
      collectionIndex: index,
      'form.collectionId': target ? target.id : '',
    })
  },
  onPriceChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.price': e.detail.value,
    })
  },
  onFreeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CheckboxGroupChange
  ) {
    const checked = e.detail.value.indexOf('free') !== -1
    this.setData({
      'form.free': checked,
    })
  },
  onTypeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const index = Number(e.detail.value || 0)
    const typeOptions = (this.data as PublishPageState).typeOptions
    this.setData({
      typeIndex: index,
      'form.type': typeOptions[index],
    })
  },
  onLimitChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.limit': e.detail.value,
    })
  },
  onStartTimeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      'form.startTime': e.detail.value,
    })
  },
  onEndTimeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      'form.endTime': e.detail.value,
    })
  },
  onSpaceChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const index = Number(e.detail.value || 0)
    const spaceOptions = (this.data as PublishPageState).spaceOptions
    this.setData({
      spaceIndex: index,
      'form.space': spaceOptions[index],
    })
  },
  onChoosePosterTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths[0]
        this.setData({
          'form.posterUrl': path,
        })
      },
    })
  },
  onDescriptionChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.TextareaInput
  ) {
    this.setData({
      'form.description': e.detail.value,
    })
  },
  onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const form = (this.data as PublishPageState).form
    if (!form.title.trim()) {
      wx.showToast({
        title: '请填写活动标题',
        icon: 'none',
      })
      return
    }
    if (!form.free && !form.price.trim()) {
      wx.showToast({
        title: '请填写报名费或选择免费',
        icon: 'none',
      })
      return
    }
    if (!form.limit.trim()) {
      wx.showToast({
        title: '请填写人数限制',
        icon: 'none',
      })
      return
    }
    if (!form.startTime || !form.endTime) {
      wx.showToast({
        title: '请选择活动时间',
        icon: 'none',
      })
      return
    }
    if (!form.posterUrl) {
      wx.showToast({
        title: '请上传活动海报',
        icon: 'none',
      })
      return
    }
    if (!form.description.trim()) {
      wx.showToast({
        title: '请填写活动介绍',
        icon: 'none',
      })
      return
    }
    wx.showToast({
      title: '已提交，待审核',
      icon: 'success',
    })
    setTimeout(() => {
      goBack()
    }, 800)
  },
})
