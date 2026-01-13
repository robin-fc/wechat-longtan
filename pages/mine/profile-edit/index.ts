import { fetchMyProfile } from '../../../api/mine'
import { updateUserInfo } from '../../../api/user'

Page({
  data: {
    logo: '',
    wxName: '',
    sex: 2, // 1男 2女 0其他
    desc: '',
    loading: false,
  },
  async onLoad() {
    const profile = await fetchMyProfile()
    if (profile) {
      this.setData(profile)
    }
  },
  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({ logo: avatarUrl })
  },
  onNicknameInput(e: any) {
    this.setData({ wxName: e.detail.value })
  },
  onBioInput(e: any) {
    this.setData({ desc: e.detail.value })
  },
  onGenderChange(e: any) {
    this.setData({ sex: Number(e.currentTarget.dataset.value) })
  },
  async onSave() {
    const data = { ...this.data }
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
