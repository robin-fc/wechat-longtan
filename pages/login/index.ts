Page({
  data: {
    checked: false,
    showModal: false,
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
    const val = !!e.detail.value.length;
    this.setData({ checked: val });
    wx.setStorageSync("privacyAccepted", val);
  },
  onLoginTap(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.checked) {
      this.setData({ showModal: true });
      return;
    }
  },
  onGetPhoneNumber(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.ButtonGetPhoneNumber
  ) {
    const detail = e.detail || {};
    if (detail.errMsg && detail.errMsg.indexOf("ok") !== -1 && detail.code) {
      const code = detail.code || "";
      wx.setStorageSync("phoneAuth", {
        code,
        time: Date.now(),
      });
      wx.setStorageSync("isLoggedIn", true);
      wx.switchTab({ url: "/pages/home/index" });
    }
  },
  onModalAgree(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.ButtonGetPhoneNumber
  ) {
    const detail = e.detail || {};
    this.setData({ checked: true, showModal: false });
    if (detail.errMsg && detail.errMsg.indexOf("ok") !== -1) {
      const code = (detail as { code?: string }).code || "";
      wx.setStorageSync("phoneAuth", {
        code,
        time: Date.now(),
      });
      wx.setStorageSync("isLoggedIn", true);
      wx.switchTab({ url: "/pages/home/index" });
    }
  },
  onModalDeny(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showModal: false });
    wx.setStorageSync("isLoggedIn", false);
    wx.switchTab({ url: "/pages/home/index" });
  },
  goService(this: WechatMiniprogram.Page.TrivialInstance) {
    wx.navigateTo({ url: "/pages/agreement/service" });
  },
  goPrivacy(this: WechatMiniprogram.Page.TrivialInstance) {
    wx.navigateTo({ url: "/pages/agreement/privacy" });
  },
  onShow(this: WechatMiniprogram.Page.TrivialInstance) {
    const accepted = !!wx.getStorageSync("privacyAccepted");
    this.setData({ checked: accepted });
  },
});
