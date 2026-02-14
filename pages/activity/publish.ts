import { createActivity, getActivityTypeList } from '../../api/activity'
import { getActivityCollections } from '../../api/activity-collection'
import { uploadImage } from '../../api/common'
import { fetchMyProfile } from '../../api/mine'
import { getSpaceList } from '../../api/space'
import type { ActivityType as ActivityTypeItem } from '../../model/activity'
import { toISO8601 } from '../../utils/isoTime'
import { goBack, smartNavigateTo } from '../../utils/navigation'

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
  spaceId: string
  logo: string
  description: string
}

interface PublishPageState {
  form: PublishFormState
  collectionOptions: { id: string; name: string }[]
  collectionIndex: number
  types: ActivityTypeItem[]
  typeIndex: number
  spaceOptions: { id: number; name: string }[]
  spaceIndex: number
  showPermissionPopup: boolean
}

function validatePublishForm(
  form: PublishFormState
): { startISO: string; endISO: string } | null {
  if (!form.title.trim()) {
    wx.showToast({
      title: '请填写活动标题',
      icon: 'none',
    })
    return null
  }
  if (!form.free && !form.price.trim()) {
    wx.showToast({
      title: '请填写报名费或选择免费',
      icon: 'none',
    })
    return null
  }
  if (!form.limit.trim()) {
    wx.showToast({
      title: '请填写人数限制',
      icon: 'none',
    })
    return null
  }
  if (!form.startDate || !form.startClock || !form.endDate || !form.endClock) {
    wx.showToast({
      title: '请选择活动时间',
      icon: 'none',
    })
    return null
  }
  const startISO = toISO8601(form.startDate || '', form.startClock || '')
  const endISO = toISO8601(form.endDate || '', form.endClock || '')
  if (!startISO || !endISO) {
    wx.showToast({
      title: '时间格式错误',
      icon: 'none',
    })
    return null
  }
  if (!form.logo) {
    wx.showToast({
      title: '请上传活动海报',
      icon: 'none',
    })
    return null
  }
  if (!form.description.trim()) {
    wx.showToast({
      title: '请填写活动介绍',
      icon: 'none',
    })
    return null
  }
  return { startISO, endISO }
}

Page<PublishPageState, WechatMiniprogram.IAnyObject>({
  data: {
    form: {
      title: '',
      collectionId: '',
      price: '',
      free: false,
      type: '',
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
    collectionOptions: [],
    collectionIndex: 0,
    types: [],
    typeIndex: 0,
    spaceOptions: [],
    spaceIndex: 0,
    showPermissionPopup: false,
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.checkDigitalNomadStatus()
  },
  async checkDigitalNomadStatus(this: WechatMiniprogram.Page.TrivialInstance) {
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      this.setData({ showPermissionPopup: true })
      return
    }

    try {
      const profile = await fetchMyProfile()
      if (profile) {
        const levelStr = String(profile.memberLevel)
        const isDigitalNomad = levelStr === '2' || levelStr.includes('数字游民') || levelStr.includes('新村民') || levelStr.includes('老村民')

        if (!isDigitalNomad) {
          this.setData({ showPermissionPopup: true })
          return
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile', e)
    }

    // 权限检查通过，加载初始数据
    await this.loadInitialData()
  },
  onPermissionApply(this: WechatMiniprogram.Page.TrivialInstance) {
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onPermissionSkip(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showPermissionPopup: false })
    goBack()
  },
  async loadInitialData(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const page = await getActivityCollections('1', '100')
      console.log('page', page)
      const options = (page.list || []).map((it) => ({
        id: String(it.id),
        name: it.name || '',
      }))
      this.setData({
        collectionOptions: options,
        collectionIndex: 0,
        'form.collectionId': '',
      })
    } catch { }

    try {
      const spaces = await getSpaceList()
      const spaceOptions = (spaces.list || []).map((it) => ({
        id: it.id,
        name: it.name,
      }))
      if (spaceOptions.length > 0) {
        this.setData({
          spaceOptions,
          spaceIndex: 0,
          'form.space': spaceOptions[0].name,
          'form.spaceId': String(spaceOptions[0].id),
        })
      } else {
        this.setData({ spaceOptions: [] })
      }
    } catch (e) {
      console.error('Fetch spaces failed', e)
    }

    try {
      const types = await getActivityTypeList('false')
      this.setData({
        types: (types || []) as ActivityTypeItem[],
        typeIndex: 0,
        'form.type': ((types || [])[0]?.label || ''),
      })
    } catch { }
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
    this.setData({
      typeIndex: index,
      'form.type': (((this.data as PublishPageState).types[index]?.label) || ''),
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
          const res = await uploadImage(filePath)
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
    const result = validatePublishForm(form)
    if (!result) {
      return
    }
    const { startISO, endISO } = result
    const typeValue = (state.types[state.typeIndex]?.value || '')
    const startTimeStr = startISO
    const endTimeStr = endISO
    const selectedSpace = state.spaceOptions[state.spaceIndex]
    const payload = {
      title: form.title.trim(),
      fee: form.free ? 0 : Number(form.price) || 0,
      isFree: form.free,
      startTime: startTimeStr,
      endTime: endTimeStr,
      logo: form.logo,
      spaceId: selectedSpace ? selectedSpace.id : form.spaceId,
      collectionId: form.collectionId ? Number(form.collectionId) || form.collectionId : undefined,
      activityType: typeValue || undefined,
      maxParticipants: Number(form.limit),
      detail: form.description.trim(),
      isLimitParticipants: !!Number(form.limit),
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
            type: ((this.data as PublishPageState).types[0]?.label || ''),
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
