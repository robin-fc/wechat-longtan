import { goBack } from '../../utils/navigation'
import { toISO8601 } from '../../utils/isoTime'
import { createActivity } from '../../api/activity'
import { ActivityType, ActivityTypeLabel } from '../../model/activity'
import { uploadImage } from '../../api/common'

interface PublishFormState {
  title: string
  collectionId: string
  price: string
  free: boolean
  type: string
  limit: string
  startTime: string
  endTime: string
  startDate?: string
  startClock?: string
  endDate?: string
  endClock?: string
  space: string
  spaceId?: string
  logo: string
  description: string
}

interface PublishPageState {
  form: PublishFormState
  collectionOptions: { id: string; name: string }[]
  collectionIndex: number
  typeOptions: string[]
  typeValues: number[]
  typeIndex: number
  spaceOptions: { id: number; name: string }[]
  spaceIndex: number
}

// 构造活动类型选项和对应的值
const typeKeys = Object.keys(ActivityTypeLabel)
  .map(k => Number(k))
  .filter(k => !isNaN(k))
  .sort((a, b) => a - b)
const typeOptions = typeKeys.map(k => ActivityTypeLabel[k as ActivityType])
const typeValues = typeKeys

Page<PublishPageState, WechatMiniprogram.IAnyObject>({
  data: {
    form: {
      title: '',
      collectionId: '',
      price: '',
      free: false,
      type: typeOptions[0],
      limit: '',
      startTime: '',
      endTime: '',
      startDate: '',
      startClock: '',
      endDate: '',
      endClock: '',
      space: '空间A',
      spaceId: '1',
      logo: '',
      description: '',
    },
    collectionOptions: [
      { id: '0', name: '不关联合集' },
      { id: '1', name: '周末自然漫游系列' },
    ],
    collectionIndex: 0,
    typeOptions: typeOptions,
    typeValues: typeValues,
    typeIndex: 0,
    spaceOptions: [
      { id: 1, name: '空间A' },
      { id: 2, name: '空间B' },
      { id: 3, name: '空间C' },
    ],
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
    let value = e.detail.value
    // 只允许输入数字
    value = value.replace(/[^\d]/g, '')
    this.setData({
      'form.limit': value,
    })
    return value
  },
  onStartTimeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      'form.startTime': e.detail.value,
    })
  },
  onStartISOChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const detail = (e.detail || {}) as any
    const date = (detail.date || '').trim()
    const time = (detail.time || '').trim()
    const combined = date && time ? `${date} ${time}` : date || time
    this.setData({
      'form.startDate': date,
      'form.startClock': time,
      'form.startTime': combined,
    })
  },
  onStartDateChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    const time = ((this.data as PublishPageState).form.startClock || '').trim()
    const hhmm = time ? time : '00:00'
    const combined = `${date} ${hhmm}:00`
    this.setData({
      'form.startDate': date,
      'form.startTime': combined,
    })
  },
  onStartClockChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const clock = e.detail.value
    const date = ((this.data as PublishPageState).form.startDate || '').trim()
    const dd = date ? date : ''
    const combined = dd ? `${dd} ${clock}:00` : `${clock}:00`
    this.setData({
      'form.startClock': clock,
      'form.startTime': combined,
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
  onEndISOChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const detail = (e.detail || {}) as any
    const date = (detail.date || '').trim()
    const time = (detail.time || '').trim()
    const combined = date && time ? `${date} ${time}` : date || time
    this.setData({
      'form.endDate': date,
      'form.endClock': time,
      'form.endTime': combined,
    })
  },
  onEndDateChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    const time = ((this.data as PublishPageState).form.endClock || '').trim()
    const hhmm = time ? time : '00:00'
    const combined = `${date} ${hhmm}:00`
    this.setData({
      'form.endDate': date,
      'form.endTime': combined,
    })
  },
  onEndClockChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const clock = e.detail.value
    const date = ((this.data as PublishPageState).form.endDate || '').trim()
    const dd = date ? date : ''
    const combined = dd ? `${dd} ${clock}:00` : `${clock}:00`
    this.setData({
      'form.endClock': clock,
      'form.endTime': combined,
    })
  },
  onSpaceChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const index = Number(e.detail.value || 0)
    const spaceOptions = (this.data as PublishPageState).spaceOptions
    const target = spaceOptions[index]
    this.setData({
      spaceIndex: index,
      'form.space': target ? target.name : '',
      'form.spaceId': target ? String(target.id) : '',
    })
  },
  onChoosePosterTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = (res.tempFilePaths || [])[0]
        if (!filePath) return
        try {
          wx.showLoading({ title: '上传中...' })
          const res = await uploadImage(filePath,'')
          console.log('uploadImage', res)
          const url = res || ''
          this.setData({
            'form.logo': url,
          })
          wx.hideLoading()
        } catch (e: any) {
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon: 'none',
          })
        }
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
  async onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const state = this.data as PublishPageState
    const form = state.form
    console.log('form', form)
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
    if (!form.startDate || !form.startClock || !form.endDate || !form.endClock) {
      wx.showToast({
        title: '请选择活动时间',
        icon: 'none',
      })
      return
    }
    const startISO = toISO8601(form.startDate || '', form.startClock || '')
    const endISO = toISO8601(form.endDate || '', form.endClock || '')
    if (!startISO || !endISO) {
      wx.showToast({
        title: '时间格式错误',
        icon: 'none',
      })
      return
    }
    if (!form.logo) {
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
    const typeValue = state.typeValues[state.typeIndex]
    const startTimeStr = startISO
    const endTimeStr = endISO
    const selectedSpace = state.spaceOptions[state.spaceIndex]
    const payload = {
      title: form.title.trim(),
      collectionId: form.collectionId ? Number(form.collectionId) || form.collectionId : undefined,
      fee: form.free ? 0 : Number(form.price) || 0,
      isFree: form.free,
      activityType: typeValue,
      startTime: startTimeStr,
      endTime: endTimeStr,
      spaceName: form.space,
      spaceId: selectedSpace ? selectedSpace.id : undefined,
      detail: form.description.trim(),
      logo: form.logo,
      limit: Number(form.limit) || undefined,
    }
    try {
      wx.showLoading({ title: '提交中...', mask: true })
      const ok = await createActivity(payload)
      wx.hideLoading()
      if (ok) {
        // 清空表单
        this.setData({
          form: {
            title: '',
            collectionId: '',
            price: '',
            free: false,
            type: typeOptions[0],
            limit: '',
            startTime: '',
            endTime: '',
            startDate: '',
            startClock: '',
            endDate: '',
            endClock: '',
            space: '空间A',
            logo: '',
            description: '',
          },
          collectionIndex: 0,
          typeIndex: 0,
          spaceIndex: 0,
        })
        wx.showToast({
          title: '已提交，待审核',
          icon: 'success',
        })
        // 返回并刷新列表页
        const pages = getCurrentPages()
        if (pages.length > 1) {
          const prePage = pages[pages.length - 2] as any
          if (prePage) {
            if (typeof prePage.loadActivities === 'function') {
              prePage.loadActivities()
            } else if (typeof prePage.refreshData === 'function') {
              prePage.refreshData()
            }
          }
        }
        setTimeout(() => {
          wx.navigateBack()
        }, 600)
      } else {
        wx.showToast({
          title: '提交失败',
          icon: 'none',
        })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({
        title: '网络错误',
        icon: 'none',
      })
    }
  },
})
