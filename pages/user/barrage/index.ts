import { uploadImage } from '../../../api/common'
import { getUserDetail } from '../../../api/user'
import { postData } from '../../../utils/request'

Page({
  data: {
    formData: {
      avatarUrl: '',
      nickname: '',
      content: ''
    },
    submitting: false
  },

  onLoad() {
    // 检查登录状态
    const isLoggedIn = !!wx.getStorageSync('isLoggedIn')
    if (!isLoggedIn) {
      // 未登录，跳转到登录页，并携带 returnUrl 以便登录后返回
      const currentUrl = encodeURIComponent('/pages/user/barrage/index')
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
    
    try {
      wx.showLoading({ title: '上传中...' })
      const url = await uploadImage(avatarUrl, 'user-barrage-avatar')
      this.setData({ 'formData.avatarUrl': url })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '头像上传失败', icon: 'none' })
      console.error('Upload failed', err)
    }
  },

  onInputContent(e: any) {
    this.setData({
      'formData.content': e.detail.value
    })
  },

  async onSubmit() {
    const { formData } = this.data

    if (!formData.avatarUrl || !formData.nickname) {
      wx.showToast({ title: '请完善昵称和头像', icon: 'none' })
      return
    }

    if (!formData.content.trim()) {
      wx.showToast({ title: '请输入弹幕内容', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    try {
      console.log('发送弹幕数据：', formData)
      await postData('/app-api/daolongtan/danmaku/send', { content: formData.content })
      wx.showToast({ title: '发送成功！', icon: 'success' })
      
      setTimeout(() => {
        // wx.navigateBack() 或者返回上一页/首页
        wx.navigateBack({
          fail: () => {
             wx.switchTab({ url: '/pages/home/index' })
          }
        })
      }, 1500)
    } catch (err) {
      wx.showToast({ title: '发送失败，请重试', icon: 'none' })
      console.error('Send danmaku error', err)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
