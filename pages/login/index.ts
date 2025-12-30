import { login } from '../../api/auth'
import { updateUserInfo } from '../../api/user'

Page({
  data: {
    checked: false,
    showModal: false,
    showProfileModal: false,
    previewAvatar: '',
    previewNickname: '',
    phoneCode: '',
    isLoggedIn: false,
    profileCompleted: false,
  },
  onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const logged = !!wx.getStorageSync('isLoggedIn')
    const completed = !!wx.getStorageSync('profileCompleted')
    if (logged && completed) {
      wx.switchTab({ url: '/pages/home/index' })
      return
    }
    const accepted = !!wx.getStorageSync('privacyAccepted')
    this.setData({
      checked: accepted,
      isLoggedIn: logged,
      profileCompleted: completed,
    })
  },
  onCheckChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CheckboxGroupChange
  ) {
    console.log('this', this)
    console.log('e', e)
    const val = !!e.detail.value.length
    this.setData({ checked: val })
    wx.setStorageSync('privacyAccepted', val)
  },
  onLoginTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
  },
  onAuthorizeTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
    if (this.data.isLoggedIn && !this.data.profileCompleted) {
      this.setData({ showProfileModal: true })
      return
    }
  },
  closeProfileModal(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showProfileModal: false })
  },
  onChooseAvatarProfile(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent<{ avatarUrl: string }>
  ) {
    const url = (e.detail && e.detail.avatarUrl) || ''
    this.setData({ previewAvatar: url })
  },
  onNicknameInputProfile(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    const nickname = String((e.detail && (e.detail as any).value) || '')
    this.setData({ previewNickname: nickname })
  },
  async confirmProfileAndLogin(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as any
    if (!state.previewAvatar) {
      wx.showToast({ title: '请选择头像', icon: 'none' })
      return
    }
    if (!state.previewNickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    try {
      await updateUserInfo({
        wxName: state.previewNickname,
        logo: state.previewAvatar,
      })
      wx.setStorageSync('profileCompleted', true)
      this.setData({ showProfileModal: false, profileCompleted: true })
      wx.switchTab({ url: '/pages/home/index' })
    } catch (error) {
      wx.showToast({ title: '登录失败', icon: 'none' })
      console.error(error)
    }
  },
  async onGetPhoneNumber(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.ButtonGetPhoneNumber
  ) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
    const detail = e.detail || {}
    if (detail.errMsg && detail.errMsg.indexOf('ok') !== -1 && detail.code) {
      const phoneCode = detail.code

      try {
        const data = await login({ code: phoneCode })
        wx.setStorageSync('accessToken', data.accessToken)
        wx.setStorageSync('refreshToken', data.refreshToken)
        wx.setStorageSync('expiresTime', data.expiresTime)
        wx.setStorageSync('userId', data.userId)
        wx.setStorageSync('isLoggedIn', true)

        this.setData({
          phoneCode,
          showProfileModal: true,
          isLoggedIn: true,
          profileCompleted: false,
        })
      } catch (error) {
        wx.showToast({ title: '登录失败', icon: 'none' })
        console.error(error)
      }
    } else {
      console.log('User denied phone number')
    }
  },
  onModalAgree(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ checked: true, showModal: false })
    wx.setStorageSync('privacyAccepted', true)
  },
  onModalDeny(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showModal: false })
    wx.setStorageSync('isLoggedIn', false)
  },
  goService(this: WechatMiniprogram.Page.TrivialInstance) {
    wx.navigateTo({ url: '/pages/agreement/service' })
  },
  goPrivacy(this: WechatMiniprogram.Page.TrivialInstance) {
    wx.navigateTo({ url: '/pages/agreement/privacy' })
  },
  onShow(this: WechatMiniprogram.Page.TrivialInstance) {
    const accepted = !!wx.getStorageSync('privacyAccepted')
    const logged = !!wx.getStorageSync('isLoggedIn')
    const completed = !!wx.getStorageSync('profileCompleted')
    this.setData({
      checked: accepted,
      isLoggedIn: logged,
      profileCompleted: completed,
    })
  },
})
