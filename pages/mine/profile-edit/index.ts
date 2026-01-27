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
    this.setData({ 'profile.memberName': e.detail.value })
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
