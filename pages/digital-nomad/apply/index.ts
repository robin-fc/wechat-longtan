import { submitUserApply } from '../../../api/user-apply'
import type { UserApplyReqVO } from '../../../model/user-apply'

Page({
    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        isIntroExpanded: false,
        genderOptions: [
            { label: '男性', value: '1' },
            { label: '女性', value: '2' },
            { label: '其TA', value: '0' },
        ],
        interestOptions: [
            '在地民俗', '艺术文创', '数字技能', '自然体验',
            '手工制作', '生活美食', '身心成长', '兴趣爱好'
        ],
        sourceOptions: [
            { label: '小红书', value: 'xiaohongshu' },
            { label: '朋友圈/群聊', value: 'wechat_moments_group' },
            { label: '公众号', value: 'official_account' },
            { label: '其TA', value: 'other' },
        ],
        formData: {
            name: '刘莉莉',
            gender: '2',
            age: '',
            phone: '13190063973',
            wechat: '',
            interests: [] as string[],
            bio: '',
            source: 'wechat_moments_group'
        }
    },
    onLoad() {
        const sys = wx.getWindowInfo()
        this.setData({
            statusBarHeight: sys.statusBarHeight
        })
    },
    onBack() {
        wx.navigateBack()
    },
    toggleIntro() {
        this.setData({
            isIntroExpanded: !this.data.isIntroExpanded
        })
    },
    onInput(e: WechatMiniprogram.Input) {
        const field = e.currentTarget.dataset.field
        const value = e.detail.value
        this.setData({
            [`formData.${field}`]: value
        })
    },
    onRadioChange(e: WechatMiniprogram.RadioGroupChange) {
        const field = e.currentTarget.dataset.field
        const value = e.detail.value
        this.setData({
            [`formData.${field}`]: value
        })
    },
    onInterestToggle(e: WechatMiniprogram.BaseEvent) {
        const value = e.currentTarget.dataset.value
        const { interests } = this.data.formData
        const idx = interests.indexOf(value)
        if (idx > -1) {
            interests.splice(idx, 1)
        } else {
            interests.push(value)
        }
        this.setData({
            'formData.interests': interests
        })
    },
    async onSubmit() {
        console.log('Submit form:', this.data.formData)

        // Validate
        const { name, age, phone, wechat, gender, interests, bio, source } = this.data.formData
        if (!name || !age || !phone || !wechat) {
            wx.showToast({ title: '请完善信息', icon: 'none' })
            return
        }

        const req: UserApplyReqVO = {
            name,
            age: Number(age),
            mobile: phone,
            wechatId: wechat,
            sex: Number(gender),
            interests: interests,
            introduction: bio,
            source: source
        }

        wx.showLoading({ title: '提交中' })
        try {
            await submitUserApply(req)
            wx.hideLoading()
            wx.showToast({ title: '提交成功，请等待审核', icon: 'success' })
            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        } catch (e: any) {
            wx.hideLoading()
            wx.showToast({ title: e.message || '提交失败', icon: 'none' })
        }
    }
})
