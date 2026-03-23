import { uploadImage } from '../../../api/common'
import { getUserDetail } from '../../../api/user'
import { postData } from '../../../utils/request'

Page({
  data: {
    formData: {
      avatarUrl: '',
      nickname: '',
      region: [] as string[],
      ageGroup: ''
    },
    skillsList: [
      { name: '技术开发', selected: false },
      { name: '创意设计', selected: false },
      { name: '文化传媒', selected: false },
      { name: '市场营销', selected: false },
      { name: '管理创业', selected: false },
      { name: '金融法务', selected: false },
      { name: '教育咨询', selected: false },
      { name: '身心康养', selected: false },
      { name: '生活艺术', selected: false },
      { name: '其他 / 跨界', selected: false },
      { name: 'GAP year', selected: false }
    ],
    ageGroups: ['70后', '80后', '90后', '00后', '10后'],
    ageIndex: -1,
    isOverseas: false,
    submitting: false
  },

  onLoad() {
    // 检查登录状态
    const isLoggedIn = !!wx.getStorageSync('isLoggedIn')
    if (!isLoggedIn) {
      // 未登录，跳转到登录页，并携带 returnUrl 以便登录后返回
      const currentUrl = encodeURIComponent('/pages/user/checkin/index')
      wx.redirectTo({ url: `/pages/login/index?returnUrl=${currentUrl}` })
      return
    }

    // 已登录，加载用户微信头像和昵称
    this._loadUserInfo()
  },

  async _loadUserInfo() {
    const userId = wx.getStorageSync('userId')
    if (!userId) return
    try {
      const userInfo = await getUserDetail(userId)
      this.setData({
        'formData.avatarUrl': userInfo.logo || '',
        'formData.nickname': userInfo.wxName || ''
      })
    } catch (err) {
      console.error('获取用户信息失败', err)
    }
  },

  onInputNickname(e: any) {
    this.setData({ 'formData.nickname': e.detail.value })
  },

  async onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({
      'formData.avatarUrl': avatarUrl
    })
    
    // 如果需要直接上传到服务器，目前仅在本地展示，如果要传云端则取消注释：
    try {
      wx.showLoading({ title: '上传中...' })
      const url = await uploadImage(avatarUrl, 'user-checkin-avatar')
      this.setData({ 'formData.avatarUrl': url })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '头像上传失败', icon: 'none' })
      console.error('Upload failed', err)
    }
  },

  onToggleSkill(e: any) {
    const index = e.currentTarget.dataset.index
    // 单选：清除其他，选中当前
    const updates: Record<string, boolean> = {}
    this.data.skillsList.forEach((_: any, i: number) => {
      updates[`skillsList[${i}].selected`] = i === index
    })
    this.setData(updates)
  },

  onRegionChange(e: any) {
    this.setData({
      'formData.region': e.detail.value
    })
  },

  onToggleOverseas() {
    const next = !this.data.isOverseas
    this.setData({
      isOverseas: next,
      'formData.region': next ? ['海外'] : []
    })
  },

  onAgeChange(e: any) {
    const index = e.detail.value
    this.setData({
      ageIndex: index,
      'formData.ageGroup': this.data.ageGroups[index]
    })
  },

  async onSubmit() {
    const { formData, skillsList, isOverseas } = this.data
    const selectedProfession = skillsList.find((s: any) => s.selected)?.name || ''

    if (!formData.avatarUrl) {
      wx.showToast({ title: '请选择头像', icon: 'none' })
      return
    }
    if (!selectedProfession) {
      wx.showToast({ title: '请选择职业方向', icon: 'none' })
      return
    }
    if (formData.region.length === 0) {
      wx.showToast({ title: '请选择来源地或勾选海外', icon: 'none' })
      return
    }
    if (!formData.ageGroup) {
      wx.showToast({ title: '请选择年龄段', icon: 'none' })
      return
    }

    const city = isOverseas ? '海外' : formData.region.join(', ')
    const skill = selectedProfession
    const age = formData.ageGroup
    
    const submitData = {
      city,
      skill,
      age
    }

    this.setData({ submitting: true })

    try {
      console.log('提交的数据：', submitData)
      await postData('/app-api/daolongtan/base-register/register', submitData)
      wx.showToast({ title: '提交成功！', icon: 'success' })
      
      setTimeout(() => {
        // wx.navigateBack() 或者返回首页
        wx.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } catch (err) {
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      console.error('Checkin error:', err)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
