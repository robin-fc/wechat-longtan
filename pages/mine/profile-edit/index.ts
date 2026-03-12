import { fetchMyProfile } from '../../../api/mine'
import { updateUserInfo } from '../../../api/user'
import { uploadImage } from '../../../api/common'

Page({
  data: {
    profile: {
      logo: '',
      wxName: '',
      sex: 2, // 1男 2女 0其TA
      desc: '',
      memberName: '',
    },
    loading: false,
  },
  async onLoad() {
    const profile = await fetchMyProfile()
    if (profile) {
      // Ensure profile has necessary fields or defaults
      this.setData({
        profile: {
          logo: profile.logo || '',
          wxName: profile.wxName || '',
          sex: profile.sex ?? 2,
          desc: profile.desc || '',
          memberName: profile.memberName || ''
        }
      })
    }
  },
  async onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    // Show temporary local image immediately if desired, or wait for upload
    // this.setData({ 'profile.logo': avatarUrl })

    try {
      wx.showLoading({ title: '上传中...' })
      const url = await uploadImage(avatarUrl, 'user-avatar')
      this.setData({ 'profile.logo': url })
      wx.hideLoading()
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: '头像上传失败', icon: 'none' })
      console.error('Upload failed', err)
    }
  },
  onNicknameInput(e: any) {
    const value = e.detail.value || ''
    let weight = 0
    let newValue = ''
    
    for (let i = 0; i < value.length; i++) {
      const char = value[i]
      // 汉字的 charCode 大于 255
      const charWeight = char.charCodeAt(0) > 255 ? 5 : 3
      if (weight + charWeight > 60) {
        break
      }
      weight += charWeight
      newValue += char
    }
    
    this.setData({ 'profile.memberName': newValue })
    
    // 如果发生了截断，强制返回截断后的值给输入框
    if (value !== newValue) {
      return newValue
    }
    
    // 满足 ts 要求：Not all code paths return a value
    return value
  },
  onBioInput(e: any) {
    this.setData({ 'profile.desc': e.detail.value })
  },
  onGenderChange(e: any) {
    this.setData({ 'profile.sex': Number(e.currentTarget.dataset.value) })
  },
  async onSave() {
    const data = this.data.profile
    this.setData({ loading: true })
    try {
      await updateUserInfo(data)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
})
