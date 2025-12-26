import { login } from '../../api/auth'
import { updateUserInfo } from '../../api/user'

Page({
  data: {
    checked: false,
    showModal: false,
    showProfileModal: false,
    previewAvatar: '',
    previewNickname: '',
  },
  onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const logged = !!wx.getStorageSync('isLoggedIn')
    if (logged) {
      wx.switchTab({ url: '/pages/home/index' })
      return
    }
    const accepted = !!wx.getStorageSync('privacyAccepted')
    this.setData({ checked: accepted })
  },
  onCheckChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CheckboxGroupChange
  ) {
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
    this.setData({ showProfileModal: true })
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
  confirmProfileAndLogin(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as any
    if (!state.previewNickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            const data = await login({ code: res.code })
            wx.setStorageSync('accessToken', data.accessToken)
            wx.setStorageSync('refreshToken', data.refreshToken)
            wx.setStorageSync('expiresTime', data.expiresTime)
            wx.setStorageSync('userId', data.userId)
            wx.setStorageSync('isLoggedIn', true)
            try {
              await updateUserInfo({
                wxName: state.previewNickname,
                logo: state.previewAvatar,
              })
            } catch (updateError) {
              console.error('Update user info failed', updateError)
            }
            this.setData({ showProfileModal: false })
            wx.switchTab({ url: '/pages/home/index' })
          } catch (error) {
            wx.showToast({ title: '登录失败', icon: 'none' })
            console.error(error)
          }
        } else {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('wx.login failed', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
      },
    })
  },
  async onGetPhoneNumber(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.ButtonGetPhoneNumber
  ) {
    const detail = e.detail || {}
    if (detail.errMsg && detail.errMsg.indexOf('ok') !== -1 && detail.code) {
      // const phoneCode = detail.code
      // Use wx.login to get login code
      wx.login({
        success: async (res) => {
          if (res.code) {
            try {
              const data = await login({ code: res.code })
              wx.setStorageSync('accessToken', data.accessToken)
              wx.setStorageSync('refreshToken', data.refreshToken)
              wx.setStorageSync('expiresTime', data.expiresTime)
              wx.setStorageSync('userId', data.userId)
              wx.setStorageSync('isLoggedIn', true)

              // Call updateUserInfo to bind phone number
              // try {
              //   await updateUserInfo({ memberPhone: phoneCode })
              // } catch (updateError) {
              //   console.error('Update user info failed', updateError)
              // }

              wx.switchTab({ url: '/pages/home/index' })
            } catch (error) {
              wx.showToast({ title: '登录失败', icon: 'none' })
              console.error(error)
            }
          } else {
            wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('wx.login failed', err)
          wx.showToast({ title: '登录失败', icon: 'none' })
        },
      })
    } else {
      console.log('User denied phone number')
    }
  },
  onModalAgree(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ checked: true, showModal: false, showProfileModal: true })
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
    this.setData({ checked: accepted })
  },
})
