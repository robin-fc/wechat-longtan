import { request } from '../utils/request'
import type { AppUpdateWeixinUserInfoReqVO } from '../model/user'
import type { CommonResult } from '../model/common'

export function updateUserInfo(data: AppUpdateWeixinUserInfoReqVO): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: '/app-api/daolongtan/user/update-info',
    method: 'PUT',
    data,
  })
}

export interface MockUserItem {
  userId: string
  nickname: string
  avatar: string
  tags: string[]
  bio: string
  isFollowed: boolean
}

export function fetchMockUserList(type: string, id?: string): Promise<MockUserItem[]> {
  // 模拟网络延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          userId: '101',
          nickname: 'Yumi',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['新村民', '主理人'],
          bio: '你的意中人是个盖世英雄，他每天...',
          isFollowed: false
        },
        {
          userId: '102',
          nickname: 'hero',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['游客'],
          bio: '遇到喜欢的人就勇敢追求，这样你...',
          isFollowed: false
        },
        {
          userId: '103',
          nickname: '七七',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['数字游民'],
          bio: '穷不要紧，抬头挺胸让大家看看，...',
          isFollowed: true
        },
        {
          userId: '104',
          nickname: '惊鸿',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['数字游民'],
          bio: '爱笑的姑娘，总是比别人更容易长...',
          isFollowed: false
        },
        {
          userId: '105',
          nickname: '十一月的萧邦',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['数字游民'],
          bio: '长的丑没好处吗，不，你可以凭长...',
          isFollowed: false
        },
        {
          userId: '106',
          nickname: '莫莫',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
          tags: ['数字游民'],
          bio: '人生就像一个茶几，上面摆满了杯...',
          isFollowed: false
        }
      ])
    }, 500)
  })
}
