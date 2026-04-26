import { createActivity, updateActivity, getActivityDetail, getActivityTypeList, previewActivity } from '../../api/activity'
import { getActivityCollections } from '../../api/activity-collection'
import { uploadImage } from '../../api/common'
import { fetchMyProfile } from '../../api/mine'
import { getSpaceList } from '../../api/space'
import type { ActivityType as ActivityTypeItem, UpdateActivityPayload } from '../../model/activity'
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
  showExitConfirm: boolean
  isEdit: boolean
  editId: number
  menuTop: number
  menuHeight: number
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
    showExitConfirm: false,
    isEdit: false,
    editId: 0,
    menuTop: 0,
    menuHeight: 44,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    // 实例标记：合法离开（提交/预览跳转）时置 true，onUnload 据此决定是否清草稿
    ;(this as any)._allowLeave = false
    // 获取菜单按钒位置，与项目其他页面一致
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
    })
    if (options.id) {
      this.setData({
        isEdit: true,
        editId: Number(options.id),
      })
    }
    await this.checkDigitalNomadStatus()
  },
  onUnload(this: WechatMiniprogram.Page.TrivialInstance) {
    // 新建模式下，若非合法离开（提交/预览），清除草稿
    if (!(this.data as PublishPageState).isEdit && !(this as any)._allowLeave) {
      try {
        const draft = wx.getStorageSync('ACTIVITY_PUBLISH_DRAFT')
        if (draft && draft.form) {
          wx.removeStorageSync('ACTIVITY_PUBLISH_DRAFT')
        }
      } catch (e) {
        console.warn('Remove draft on unload failed', e)
      }
    }
  },
  async checkDigitalNomadStatus(this: WechatMiniprogram.Page.TrivialInstance) {
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      wx.setStorageSync('isLoggedIn', false)
      wx.setStorageSync('profileCompleted', false)
      const returnUrl = '/pages/activity/publish'
      smartNavigateTo(`/pages/login/index?returnUrl=${encodeURIComponent(returnUrl)}`)
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

    if (this.data.isEdit && this.data.editId) {
      await this.loadActivityDetail(this.data.editId)
    } else {
      // 新建模式：尝试从草稿恢复上次填写的内容
      try {
        const draft = wx.getStorageSync('ACTIVITY_PUBLISH_DRAFT')
        if (draft && draft.form) {
          const state = this.data as PublishPageState
          // 校验选择索引合法性，防止数组越界
          const collectionIndex = (draft.collectionIndex >= 0 && draft.collectionIndex < state.collectionOptions.length)
            ? draft.collectionIndex : 0
          const typeIndex = (draft.typeIndex >= 0 && draft.typeIndex < state.types.length)
            ? draft.typeIndex : 0
          const spaceIndex = (draft.spaceIndex >= 0 && draft.spaceIndex < state.spaceOptions.length)
            ? draft.spaceIndex : 0
          this.setData({
            form: draft.form,
            collectionIndex,
            typeIndex,
            spaceIndex,
          })
        }
      } catch (e) {
        console.warn('Restore draft failed', e)
      }
    }
  },

  async loadActivityDetail(this: WechatMiniprogram.Page.TrivialInstance, id: number) {
    try {
      wx.showLoading({ title: '加载中...' })
      const detail = await getActivityDetail(id)

      const form: PublishFormState = { ...this.data.form }

      form.title = detail.title || ''
      form.price = detail.fee ? String(detail.fee) : ''
      form.free = detail.isFree || false
      form.limit = detail.maxParticipants ? String(detail.maxParticipants) : ''
      form.logo = detail.logo || ''
      form.description = detail.detail || ''

      // 时间处理
      if (detail.startTime) {
        const parts = detail.startTime.split(/[ T]/)
        form.startDate = parts[0] || ''
        form.startClock = parts[1] ? parts[1].substring(0, 5) : ''
        form.startTime = `${form.startDate} ${form.startClock}:00`
      }
      if (detail.endTime) {
        const parts = detail.endTime.split(/[ T]/)
        form.endDate = parts[0] || ''
        form.endClock = parts[1] ? parts[1].substring(0, 5) : ''
        form.endTime = `${form.endDate} ${form.endClock}:00`
      }

      let collectionIndex = 0
      if (detail.collectionId) {
        form.collectionId = String(detail.collectionId)
        const idx = this.data.collectionOptions.findIndex((c: any) => String(c.id) === String(detail.collectionId))
        if (idx !== -1) collectionIndex = idx
      }

      let spaceIndex = 0
      if (detail.space && detail.space.id) {
        form.spaceId = String(detail.space.id)
        form.space = detail.space.name || ''
        const idx = this.data.spaceOptions.findIndex((s: any) => String(s.id) === String(detail.space.id))
        if (idx !== -1) spaceIndex = idx
      }

      let typeIndex = 0
      if (detail.activityType) {
        form.type = detail.activityType
        const idx = this.data.types.findIndex((t: any) => t.value === detail.activityType || t.label === detail.activityType)
        if (idx !== -1) typeIndex = idx
      }

      this.setData({
        form,
        collectionIndex,
        spaceIndex,
        typeIndex
      })

      wx.setNavigationBarTitle({
        title: '编辑活动'
      })

      wx.hideLoading()
    } catch (e) {
      wx.hideLoading()
      wx.showToast({
        title: '获取活动信息失败',
        icon: 'none'
      })
    }
  },

  onBackTap(this: WechatMiniprogram.Page.TrivialInstance) {
    // 仅新建模式下检测草稿（此方法供 WXML 自定义返回按钮使用）
    if (!(this.data as PublishPageState).isEdit) {
      try {
        const draft = wx.getStorageSync('ACTIVITY_PUBLISH_DRAFT')
        if (draft && draft.form) {
          this.setData({ showExitConfirm: true })
          return
        }
      } catch (e) {
        console.warn('Check draft failed', e)
      }
    }
    goBack()
  },
  // 确认退出：清除草稿并返回
  onConfirmExit(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      wx.removeStorageSync('ACTIVITY_PUBLISH_DRAFT')
    } catch (e) {
      console.warn('Remove draft failed', e)
    }
    // 标记合法离开，onUnload 不再重复清除
    ;(this as any)._allowLeave = true
    this.setData({ showExitConfirm: false })
    goBack()
  },
  // 取消退出：关闭弹窗，返回编辑
  onCancelExit(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showExitConfirm: false })
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
    const updateData: any = {
      'form.free': checked,
    }
    if (checked) {
      updateData['form.price'] = ''
    }
    this.setData(updateData)
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
    // 限制最大值为 999
    if (value && Number(value) > 999) {
      value = '999'
    }
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
  async onPreviewTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as PublishPageState
    const form = state.form
    const result = validatePublishForm(form)
    if (!result) {
      return
    }

    wx.showLoading({ title: '准备预览...' })

    // 并发：调用预览接口 + 拉取用户信息
    const typeValue = (state.types[state.typeIndex]?.label) || ''
    const typeValueRaw = (state.types[state.typeIndex]?.value) || ''
    const selectedSpace = state.spaceOptions[state.spaceIndex]

    const previewPayload = {
      title: form.title.trim(),
      logo: form.logo || undefined,
      collectionId: form.collectionId ? Number(form.collectionId) : undefined,
      fee: form.free ? 0 : Number(form.price) || 0,
      isFree: form.free,
      activityType: typeValueRaw || undefined,
      startTime: result.startISO,
      endTime: result.endISO,
      spaceId: selectedSpace ? selectedSpace.id : (Number(form.spaceId) || form.spaceId),
      detail: form.description.trim() || undefined,
      maxParticipants: Number(form.limit) || undefined,
      isLimitParticipants: !!Number(form.limit),
    }

    let finalLogo = form.logo
    let finalMapImages: string[] = []
    let finalAddress = '预览地址（暂无）'
    let userProfile = null

    try {
      const [previewResp, profile] = await Promise.all([
        previewActivity(previewPayload),
        fetchMyProfile().catch((e) => { console.warn('fetch profile failed', e); return null }),
      ])
      // 使用服务端返回的 logo（可能是系统默认海报）
      if (previewResp && previewResp.logo) {
        finalLogo = previewResp.logo
      }
      if (previewResp && previewResp.mapImages) {
        finalMapImages = previewResp.mapImages
      }
      if (previewResp && previewResp.address) {
        finalAddress = previewResp.address
      }
      userProfile = profile
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '预览失败，请重试', icon: 'none' })
      return
    }

    const mockDetail: any = {
      id: 999999,
      title: form.title.trim(),
      logo: finalLogo,
      startTime: result.startISO,
      endTime: result.endISO,
      fee: form.free ? 0 : Number(form.price) || 0,
      isFree: form.free,
      detail: form.description.trim(),
      favoriteCount: 0,
      favoriteUsers: [],
      isFavorited: false,
      maxParticipants: Number(form.limit),
      registeredCount: 0,
      isLimitParticipants: !!Number(form.limit),
      activityStatus: '报名中',
      activityType: typeValue,
      auditStatus: '审核通过',
      isRegistered: false,
      space: {
        id: selectedSpace ? selectedSpace.id : Number(form.spaceId),
        name: selectedSpace ? selectedSpace.name : form.space,
        address: finalAddress,
        mapImages: finalMapImages
      },
      organizer: {
        userId: userProfile ? userProfile.id : 0,
        wxName: userProfile ? userProfile.wxName : '暂无',
        memberName: userProfile ? userProfile.memberName : '暂无',
        logo: userProfile ? userProfile.logo : '',
        introduction: userProfile ? userProfile.introduction : '',
        memberLevel: userProfile ? userProfile.memberLevel : '',
        memberTags: [],
        follow: false,
        followed: false
      }
    }

    // 持久化表单草稿（含服务端返回的 logo），供预览返回后恢复
    wx.setStorageSync('ACTIVITY_PUBLISH_DRAFT', {
      form: { ...form, logo: finalLogo, activityTypeValue: typeValueRaw },
      collectionIndex: state.collectionIndex,
      typeIndex: state.typeIndex,
      spaceIndex: state.spaceIndex,
    })

    wx.setStorageSync('ACTIVITY_PREVIEW_DATA', mockDetail)
    wx.hideLoading()
    // 标记为合法离开（导航到预览页，不清草稿）
    ;(this as any)._allowLeave = true
    smartNavigateTo('/pages/activity/detail?isPreview=true')
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
    const payload: UpdateActivityPayload = {
      id: state.editId,
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

      let ok = false
      if (state.isEdit) {
        ok = await updateActivity(payload)
      } else {
        ok = await createActivity(payload)
      }

      wx.hideLoading()
      if (ok) {
        // 标记合法离开，onUnload 不再重复清除
        ;(this as any)._allowLeave = true
        // 清空表单草稿
        wx.removeStorageSync('ACTIVITY_PUBLISH_DRAFT')
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
            spaceId: '1',
            logo: '',
            description: '',
          },
          collectionIndex: 0,
          typeIndex: 0,
          spaceIndex: 0,
        })
        wx.showToast({
          title: state.isEdit ? '已修改并提交' : '已提交，待审核',
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
            } else if (typeof prePage.onLoad === 'function' && prePage.options) {
              // Detail page reload
              prePage.onLoad(prePage.options)
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
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({
        title: e.message || '网络错误',
        icon: 'none',
      })
    }
  },
})
