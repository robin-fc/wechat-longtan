import { submitUserApply } from '../../../api/user-apply'
import type { UserApplyReqVO } from '../../../model/user-apply'
import { fetchMyProfile } from '../../../api/mine'


Page({
    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        isIntroExpanded: false,
        genderOptions: [
            { label: '未知', value: '0' },
            { label: '男性', value: '1' },
            { label: '女性', value: '2' }
        ],
        activitiesOptions: [
            { label: '在地民俗', value: '0' },
            { label: '艺术创作', value: '1' },
            { label: '数字技能', value: '2' },
            { label: '自然体验', value: '3' },
            { label: '手工制作', value: '4' },
            { label: '生活美食', value: '5' },
            { label: '身心成长', value: '6' },
            { label: '兴趣爱好', value: '7' }
        ],
        sourceOptions: [
            { label: '小红书', value: '0' },
            { label: '朋友圈/群聊', value: '1' },
            { label: '公众号', value: '2' },
            { label: '其他', value: '3' }
        ],
        formData: {
            name: '',
            gender: '0',
            phone: '',
            wechat: '微信用户',
            age: '',
            activities: [] as string[],
            self_introduction: '',
            source: ''
        }
    },
    onLoad() {
        const sys = wx.getWindowInfo()
        this.setData({
            statusBarHeight: sys.statusBarHeight
        })
        this.initData()
    },
    async initData() {
        try {
            const profile = await fetchMyProfile()
            if (profile) {
                const { memberName, wxName, memberPhone, sex, desc } = profile

                this.setData({
                    'formData.name': memberName || wxName || '',
                    'formData.gender': String(sex || '0'),
                    'formData.phone': memberPhone || '',
                    'formData.self_introduction': desc || ''
                })
            }
        } catch (e) {
            console.error('Fetch profile failed', e)
        }
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
    onActivityToggle(e: WechatMiniprogram.BaseEvent) {
        const value = e.currentTarget.dataset.value
        const { activities } = this.data.formData
        const idx = activities.indexOf(value)
        if (idx > -1) {
            activities.splice(idx, 1)
        } else {
            activities.push(value)
        }
        this.setData({
            'formData.activities': activities
        })
    },
    async onSubmit() {
        console.log('Submit form:', this.data.formData)

        // Validate
        const { name, gender, phone, wechat, age, activities, self_introduction, source } = this.data.formData

        if (!name) {
            wx.showToast({ title: '请输入姓名', icon: 'none' })
            return
        }
        if (!phone) {
            wx.showToast({ title: '请输入手机号', icon: 'none' })
            return
        }
        if (!wechat) {
            wx.showToast({ title: '请输入微信号', icon: 'none' })
            return
        }
        if (!age) {
            wx.showToast({ title: '请输入年龄', icon: 'none' })
            return
        }

        const req: UserApplyReqVO = {
            answers: [
                { id: 'name', value: name },
                { id: 'gender', value: gender },
                { id: 'phone', value: phone },
                { id: 'wechat', value: wechat },
                { id: 'age', value: Number(age) }, // Ensure number if backend expects it, though UserApplyReqVO value can be string|number
                { id: 'activities', value: activities }, // Now sending values '0'-'7'
                { id: 'self_introduction', value: self_introduction },
                { id: 'source', value: source }
            ]
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
