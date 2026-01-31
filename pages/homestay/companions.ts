import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'
import { goBack } from '../../utils/navigation'

interface CompanionItemView {
    id: string
    avatarUrl: string
    nickname: string
    bio: string
    follow: boolean
}

interface CompanionsPageState {
    companions: CompanionItemView[]
}

Page<CompanionsPageState, WechatMiniprogram.IAnyObject>({
    data: {
        companions: [],
    },
    async onLoad(
        this: WechatMiniprogram.Page.TrivialInstance,
        options: WechatMiniprogram.Page.InstanceProperties['options']
    ) {
        // 尝试从 EventChannel 获取数据
        const eventChannel = this.getOpenerEventChannel()
        if (eventChannel) {
            eventChannel.on('acceptDataFromOpenerPage', (res) => {
                const userList = res.data || []
                const companions: CompanionItemView[] = userList.map((u: any) => ({
                    id: String(u.userId),
                    avatarUrl: u.logo || '',
                    nickname: u.memberName || u.wxName || `User ${u.userId}`,
                    bio: u.introduction || '',
                    follow: u.follow || false,
                }))
                this.setData({ companions })
            })
        }


    },
    onBackTap() {
        goBack()
    },
    onFollowTap(
        this: WechatMiniprogram.Page.TrivialInstance,
        e: any
    ) {
        const id = (e.detail?.user?.id || e.currentTarget.dataset.id) as string
        const list = (this.data as CompanionsPageState).companions.slice()
        const index = list.findIndex((item) => item.id === id)
        if (index === -1) {
            return
        }
        const target = list[index]
        const followed = !!target.follow
        const reqBody = { followeeId: Number(id) }
        const doReq = followed
            ? AppUserUnfollow(reqBody)
            : AppUserFollow(reqBody)
        doReq
            .then(() => {
                list[index] = {
                    ...target,
                    follow: !followed,
                }
                this.setData({ companions: list })
            })
            .catch(() => {
                wx.showToast({ title: '操作失败', icon: 'none' })
            })
    },
})
