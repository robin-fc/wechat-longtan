import { goBack } from '../../utils/navigation'

type SpaceTab = 'activity' | 'homestay' | 'space'

interface SpaceDetailState {
  activeTab: SpaceTab
}

Page<SpaceDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activeTab: 'activity',
  },
  onBackTap() {
    goBack()
  },
  onTabTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const tab = e.currentTarget.dataset.tab as SpaceTab
    this.setData({
      activeTab: tab,
    })
  },
})
