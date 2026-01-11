import { fetchMyProfile } from '../../../api/mine'
import { updateUserInfo } from '../../../api/user'

Page({
  data: {
    avatar: '',
    nickname: '',
    gender: 2, // 1男 2女 0其他
    bio: '',
    loading: false
  },
  async onLoad() {
    try {
      const profile = await fetchMyProfile()
      if (profile) {
        this.setData({
          avatar: profile.logo || '',
          nickname: profile.wxName || '',
          gender: profile.sex || 2,
          bio: profile.desc || ''
        })
      }
    } catch (e) {
      console.error(e)
    }
  },
  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({ avatar: avatarUrl })
  },
  onNicknameInput(e: any) {
    this.setData({ nickname: e.detail.value })
  },
  onBioInput(e: any) {
    this.setData({ bio: e.detail.value })
  },
  onGenderChange(e: any) {
    this.setData({ gender: Number(e.currentTarget.dataset.value) })
  },
  async onSave() {
    const { avatar, nickname, gender, bio } = this.data
    
    const data = {
      logo: avatar,
      wxName: nickname,
      sex: gender,
      desc: bio
    }
    
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
  }
})
