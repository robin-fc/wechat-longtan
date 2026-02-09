import { fetchUserApplyForm, submitUserApply } from '../../../api/user-apply'
import type { AppUserApplyFormQuestion, UserApplyReqVO } from '../../../model/user-apply'
import { fetchMyProfile } from '../../../api/mine'

type FormValue = string | string[]

function normalizeCheckboxValue(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map(String).filter(Boolean)
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return []
        }
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed)
                if (Array.isArray(parsed)) {
                    return parsed.map(String).filter(Boolean)
                }
            } catch {
                // Ignore JSON parse error and fallback to splitting
            }
        }
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
}

function normalizeQuestionValue(question: AppUserApplyFormQuestion): FormValue {
    if (question.valueType === 'checkbox_group') {
        return normalizeCheckboxValue(question.value)
    }
    if (question.value === undefined || question.value === null) {
        return ''
    }
    return String(question.value)
}

function buildInitialFormData(questionList: AppUserApplyFormQuestion[]) {
    const formData: Record<string, FormValue> = {}
    questionList.forEach((question) => {
        if (!question || !question.id) {
            return
        }
        formData[question.id] = normalizeQuestionValue(question)
    })
    return formData
}

Page({
    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        isIntroExpanded: false,
        formTitle: '',
        formDesc: '',
        questionList: [] as AppUserApplyFormQuestion[],
        formData: {} as Record<string, FormValue>
    },
    onLoad() {
        const sys = wx.getWindowInfo()
        this.setData({
            statusBarHeight: sys.statusBarHeight
        })
        this.initData()
    },
    async initData() {
        await this.loadApplyForm()
        await this.prefillProfile()
    },
    async loadApplyForm() {
        try {
            const form = await fetchUserApplyForm(1) // type=1 表示志愿者申请
            const questionList = (form?.questionList || []).map((question) => ({
                ...question,
                options: question.options || []
            }))
            const formData = buildInitialFormData(questionList)
            this.setData({
                formTitle: form?.title || '志愿者申请表',
                formDesc: form?.desc || '',
                questionList,
                formData
            })
        } catch (e) {
            console.error('Fetch apply form failed', e)
            wx.showToast({ title: '表单加载失败', icon: 'none' })
        }
    },
    async prefillProfile() {
        try {
            const profile = await fetchMyProfile()
            if (profile) {
                const { memberName, wxName, memberPhone, sex, desc } = profile
                const updates: Record<string, any> = {}
                const formData = (this.data as any).formData || {}
                if (formData.name !== undefined) {
                    updates['formData.name'] = memberName || wxName || ''
                }
                if (formData.gender !== undefined) {
                    updates['formData.gender'] = String(sex || '0')
                }
                if (formData.phone !== undefined) {
                    updates['formData.phone'] = memberPhone || ''
                }
                if (formData.self_introduction !== undefined) {
                    updates['formData.self_introduction'] = desc || ''
                }
                if (Object.keys(updates).length) {
                    this.setData(updates)
                }
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
    onCheckboxToggle(e: WechatMiniprogram.BaseEvent) {
        const field = e.currentTarget.dataset.field
        const value = String(e.currentTarget.dataset.value || '')

        const state = this.data as any
        const current = Array.isArray(state.formData?.[field]) ? [...state.formData[field]] : []
        const idx = current.indexOf(value)
        if (idx > -1) {
            current.splice(idx, 1)
        } else if (value) {
            current.push(value)
        }
        this.setData({
            [`formData.${field}`]: current
        })
    },
    async onSubmit() {
        const state = this.data as any
        const questionList: AppUserApplyFormQuestion[] = state.questionList || []
        const formData: Record<string, FormValue> = state.formData || {}
        if (!questionList.length) {
            wx.showToast({ title: '表单加载失败', icon: 'none' })
            return
        }
        const req: UserApplyReqVO = {
            formType: 1, // 志愿者申请
            answers: questionList
                .filter((question) => question.valueType !== 'info_text')
                .map((question) => {
                    const value = formData[question.id]
                    if (question.valueType === 'number') {
                        if (typeof value === 'string') {
                            const trimmed = value.trim()
                            if (!trimmed) {
                                return { id: question.id, value: '' }
                            }
                            const numValue = Number(trimmed)
                            return {
                                id: question.id,
                                value: Number.isNaN(numValue) ? trimmed : numValue
                            }
                        }
                        return { id: question.id, value: value ?? '' }
                    }
                    if (question.valueType === 'checkbox_group') {
                        return {
                            id: question.id,
                            value: Array.isArray(value) ? value : []
                        }
                    }
                    return {
                        id: question.id,
                        value: value === undefined || value === null ? '' : String(value)
                    }
                })
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
