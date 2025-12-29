import { createActivityCollection } from '../../api/activity'
import { uploadImage } from '../../api/common'

Page({
  data: {
    form: {
      name: '',
      coverUrl: '',
      listUrl: '',
      description: '',
    },
  },
  onNameChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.name': e.detail.value,
    })
  },
  onDescriptionChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.description': e.detail.value,
    })
  },
  onChooseCoverTap() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = (res.tempFilePaths || [])[0]
        if (!filePath) return
        
        try {
          wx.showLoading({ title: '上传中...' })
          const url = await uploadImage(filePath)
          this.setData({
            'form.coverUrl': url,
          })
          wx.hideLoading()
        } catch (e: any) {
          wx.hideLoading()
          console.error('上传失败', e)
          wx.showModal({
            title: '上传失败',
            content: e.message || '未知错误',
            showCancel: false
          })
        }
      },
    })
  },
  onChooseListTap() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = (res.tempFilePaths || [])[0]
        if (!filePath) return
        
        try {
          wx.showLoading({ title: '上传中...' })
          const url = await uploadImage(filePath)
          this.setData({
            'form.listUrl': url,
          })
          wx.hideLoading()
        } catch (e: any) {
          wx.hideLoading()
          console.error('上传失败', e)
          wx.showModal({
            title: '上传失败',
            content: e.message || '未知错误',
            showCancel: false
          })
        }
      },
    })
  },
  async onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const form = (this.data as any).form as {
      name: string
      coverUrl: string
      listUrl: string
      description: string
    }
    if (!form.name.trim()) {
      wx.showToast({
        title: '请填写合集名称',
        icon: 'none',
      })
      return
    }
    if (!form.coverUrl) {
      wx.showToast({
        title: '请上传封面图',
        icon: 'none',
      })
      return
    }
    if (!form.description.trim()) {
      wx.showToast({
        title: '请填写合集介绍',
        icon: 'none',
      })
      return
    }

    try {
      wx.showLoading({ title: '提交中...', mask: true })
      const ok = await createActivityCollection({
        name: form.name.trim(),
        coverUrl: form.coverUrl,
        listUrl: form.listUrl,
        description: form.description.trim(),
      })
      wx.hideLoading()
      if (ok) {
        wx.showToast({
          title: '合集已创建',
          icon: 'success',
        })
        const pages = getCurrentPages()
        if (pages.length > 1) {
          const prePage = pages[pages.length - 2]
          if (prePage && typeof (prePage as any).refreshData === 'function') {
            ;(prePage as any).refreshData()
          }
        }
        setTimeout(() => {
          wx.navigateBack()
        }, 800)
      } else {
        wx.showToast({
          title: '创建失败',
          icon: 'none',
        })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({
        title: '网络错误',
        icon: 'none',
      })
    }
  },
})
