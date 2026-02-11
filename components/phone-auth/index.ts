import { postPhoneNumber } from '../../api/auth'

Component({
    externalClasses: ['className'],
    properties: {
        checked: {
            type: Boolean,
            value: false,
        },
    },
    methods: {
        onTap() {
            if (!this.properties.checked) {
                this.triggerEvent('denied')
                return
            }
        },
        async onGetPhoneNumber(e: WechatMiniprogram.ButtonGetPhoneNumber) {
            if (!this.properties.checked) {
                this.triggerEvent('denied')
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
                    // 触发成功事件，传递 phoneCode 和 phone info
                    this.triggerEvent('success', { phoneCode, phone })
                } catch (error) {
                    const msg = (error && (error as any).message) || '绑定失败'
                    wx.showToast({ title: msg, icon: 'none' })
                    console.error(error)
                    this.triggerEvent('fail', { error })
                }
            } else {
                // 用户取消了手机号授权
                this.triggerEvent('cancel')
            }
        },
    }
})
