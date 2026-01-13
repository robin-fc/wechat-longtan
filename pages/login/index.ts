import { login, postPhoneNumber } from '../../api/auth'
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
    phoneBound: false,
    profileCompleted: false,
  },
  /**
   * 页面加载：同步隐私勾选、登录与手机号绑定、资料完成状态
   */
  onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const logged = !!wx.getStorageSync('isLoggedIn')
    const phoneBound = !!wx.getStorageSync('phoneBound')
    const completed = !!wx.getStorageSync('profileCompleted')
    if (logged && completed) {
      wx.switchTab({ url: '/pages/home/index' })
      return
    }
    const accepted = !!wx.getStorageSync('privacyAccepted')
    this.setData({
      checked: accepted,
      isLoggedIn: logged,
      phoneBound,
      profileCompleted: completed,
    })
  },
  onCheckChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CheckboxGroupChange
  ) {
    const val = !!e.detail.value.length
    this.setData({ checked: val })
    wx.setStorageSync('privacyAccepted', val)
  },
  /**
   * 点击登录按钮（未同意隐私时提示）
   */
  onLoginTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
  },
  /**
   * 头像昵称授权入口：需已登录且已绑定手机号
   */
  onAuthorizeTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
    if (this.data.isLoggedIn && this.data.phoneBound && !this.data.profileCompleted) {
      this.setData({ showProfileModal: true })
      return
    }
  },
  /**
   * 发起微信登录：wx.login 获取 code，调用后端登录并缓存令牌
   */
  async onWeChatLoginTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
    try {
      const loginRes = await wx.login()
      const jsCode = loginRes.code || ''
      if (!jsCode) {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
        return
      }
      const data = await login({ code: jsCode })
      wx.setStorageSync('accessToken', data.accessToken)
      wx.setStorageSync('refreshToken', data.refreshToken)
      wx.setStorageSync('expiresTime', data.expiresTime)
      wx.setStorageSync('userId', data.userId)
      wx.setStorageSync('isLoggedIn', true)
      this.setData({ isLoggedIn: true })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      const msg = (error && (error as any).message) || '登录失败'
      wx.showToast({ title: msg, icon: 'none' })
      console.error(error)
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
  /**
   * 确认头像昵称并完成登录，更新后端资料并跳转首页
   */
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
  /**
   * 绑定手机号：处理 getPhoneNumber 授权码，调用后端换取手机号并缓存
   */
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
        const phone = await postPhoneNumber({ phoneCode })
        wx.setStorageSync('phoneNumber', phone.phoneNumber)
        wx.setStorageSync('purePhoneNumber', phone.purePhoneNumber)
        wx.setStorageSync('countryCode', phone.countryCode)
        wx.setStorageSync('phoneBound', true)
        this.setData({ phoneCode, phoneBound: true })
        wx.showToast({ title: '手机号绑定成功', icon: 'success' })
      } catch (error) {
        const msg = (error && (error as any).message) || '绑定失败'
        wx.showToast({ title: msg, icon: 'none' })
        console.error(error)
      }
    } else {
      // 用户取消了手机号授权，保持当前状态
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
  /**
   * 页面显示：刷新本地缓存驱动的页面状态
   */
  onShow(this: WechatMiniprogram.Page.TrivialInstance) {
    const accepted = !!wx.getStorageSync('privacyAccepted')
    const logged = !!wx.getStorageSync('isLoggedIn')
    const phoneBound = !!wx.getStorageSync('phoneBound')
    const completed = !!wx.getStorageSync('profileCompleted')
    this.setData({
      checked: accepted,
      isLoggedIn: logged,
      phoneBound,
      profileCompleted: completed,
    })
  },
})
