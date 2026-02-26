interface GuideSection {
  title: string
  items: GuideItem[]
}

interface GuideItem {
  label: string
  content: GuideContentSegment[]
}

interface GuideContentSegment {
  type: 'text' | 'phone'
  text: string
  phoneNumber?: string
}

interface TravelGuidePageData {
  sections: GuideSection[]
}

Page<TravelGuidePageData, WechatMiniprogram.IAnyObject>({
  data: {
    sections: [
      {
        title: '住宿',
        items: [
          {
            label: '特惠合作',
            content: [
              { type: 'text', text: '为了支持数字游民村里的生活体验，我们联合在地民宿提供特惠房源。' }
            ],
          },
          {
            label: '预订说明',
            content: [
              { type: 'text', text: '数字游民申请审核通过后，可通过【DAO龙潭】小程序预订特惠合作民宿；\n每间房最多可住2人；\n屏南民宿多为老宅改造，即使价位相同，房间大小与设施可能有差异，请大家根据房间描述，选择适合自己的。' }
            ],
          },
        ],
      },
      {
        title: '出行',
        items: [
          {
            label: '抵达建议',
            content: [
              { type: 'text', text: '龙潭片区地处山区，县城班车每日一班，建议以高铁/飞机+拼车/包车方式进村。\n\n1）高铁站推荐：\n• 古田北站（约100km，1.5h车程，班次多）\n• 屏南站（约40km，1h车程，新开通【绿巨人动车】）\n• 福州站（约150km，2h车程）\n  绿巨人动车：福州⇌ 连江⇌ 宁德⇌ 周宁⇌ 屏南⇌ 政和⇌ 松溪⇌ 庆元⇌龙泉⇌ 松阳⇌ 遂昌⇌ 衢州\n\n2）机场推荐：\n  福州长乐国际机场（约200km，2.5h车程）' }
            ],
          },
          {
            label: '拼车建议',
            content: [
              { type: 'text', text: '建议使用微信里的“嘀嗒顺风车”小程序，价格不含高速过路费，可与司机平摊。\n\n【当地热门拼车司机】\n• 阿春 师傅 ｜ 路线：福州/古田北 ⇌ 龙潭\n  拼车热线：' },
              { type: 'phone', text: '13305032238', phoneNumber: '13305032238' },
              { type: 'text', text: '\n\n• 小陆 师傅 ｜ 路线：古田/宁德/屏南 ⇌ 龙潭\n  拼车热线：' },
              { type: 'phone', text: '17706939085', phoneNumber: '17706939085' },
              { type: 'text', text: '\n\n【参考费用预估】 (请提前联系司机确认)\n• 古田北站：拼车约60元 (包车200-300元)\n• 屏南站：拼车约35元 (包车100元)\n• 福州站：拼车约100元 (包车300-400元)\n• 福州机场：拼车约120元 (包车400-500元)' }
            ],
          },
          {
            label: '包车建议',
            content: [
              { type: 'text', text: '若行程不便同行拼车，龙潭当地司机也提供包车直达服务：\n\n【胡师傅】(7座车)\n电话：' },
              { type: 'phone', text: '18950550633', phoneNumber: '18950550633' },
              { type: 'text', text: '\n• 屏南市区/火车站 ⇌ 龙潭：120-150元\n• 古田北站 ⇌ 龙潭：300元\n• 宁德 ⇌ 龙潭：300-350元\n• 福州 ⇌ 龙潭：600元\n• 长乐机场 ⇌ 龙潭：800元\n• 龙潭周边游(如四坪)：30元起\n\n【小陆师傅】\n电话：' },
              { type: 'phone', text: '17706939085', phoneNumber: '17706939085' },
              { type: 'text', text: '\n• 屏南火车站 ⇌ 龙潭：120元' }
            ],
          },
          {
            label: '公共交通',
            content: [
              { type: 'text', text: '【A. 龙潭 ⇌ 宁德】\n预估耗时：2.5小时 ｜ 费用：30元\n• 龙潭出发：早上 7:00\n• 宁德北站出发：下午 13:30\n• 购票：微信搜索“闽运驾到”公众号，预定宁德站到“代溪”，上车后跟司机说明到龙潭，补齐后续路费。\n• 班车联系：' },
              { type: 'phone', text: '13850335887', phoneNumber: '13850335887' },
              { type: 'text', text: '\n\n【B. 龙潭 ⇌ 屏南】\n预估耗时：1小时 ｜ 费用以实际为准\n• 龙潭桥头出发：早上 7:00\n• 屏南旧车站出发：下午 14:30\n• 班车联系：' },
              { type: 'phone', text: '13959311020', phoneNumber: '13959311020' },
              { type: 'text', text: '\n\n【关于 屏南汽车站 ⇌ 屏南火车站】\n屏南只有一个火车站。若从汽车站换乘，推荐在公交站乘坐 8路公交 直达火车站。耗时稍长但性价比极高，适合行李不多或时间充裕的朋友。' }
            ],
          },
          {
            label: '停车场',
            content: [
              { type: 'text', text: '龙潭村有2个停车场，收费20元/24小时\n\n备注：山路弯多坡陡，请谨慎驾驶，建议有经验者驾驶进村。' }
            ],
          },
        ],
      },
      {
        title: '一日三餐',
        items: [
          {
            label: '餐饮',
            content: [
              { type: 'text', text: '龙潭村主街有小吃店、当地特色美食\nDAO龙潭数字游民基地提供共享厨房，大家可自主使用\n龙潭的部分餐馆和咖啡厅也将为数字游民提供餐饮优惠，详情见DAO龙潭数字游民交流群\n当然，如果你交到当地的朋友，蹭饭也是有趣的选择' }
            ],
          },
        ],
      },
      {
        title: '周边游玩',
        items: [
          {
            label: '推荐',
            content: [
              { type: 'text', text: '如果你想在活动之外探一探屏南山野，这些地方值得一去：\n\n• 白水洋景区：国家5A级，玩水胜地，平坦河床可冲浪漂流，约游玩半天\n• 双溪古镇：拥有千年历史，坐落屏南最大的公益艺术空间——薛府\n• 厦地村：800年古村落，先锋水田书店（稻田环绕）、森克民宿咖啡屋\n• 前汾溪村：坐落中国美术学院·宁德、乡野艺校和大梦书屋\n• 白玉村：坐拥百亩稻田，白玉不耕农场、稻田边边营地、小树林酒馆、稻田公社\n• 寿山茶盐古道：极佳徒步线路，前乾公鸡寨，奇石险峰、森林' }
            ],
          },
          {
            label: '备注',
            content: [
              { type: 'text', text: '村庄生活节奏较慢，请放下效率心态，多一些留白与探索；\n山区早晚雾气重、气温低，可多在9:00-17:00活动\n多和村民打招呼、多问一句，你会发现隐藏的在地故事和小确幸。' }
            ],
          },
        ],
      },
      {
        title: '必备物品',
        items: [
          {
            label: '衣物',
            content: [
              { type: 'text', text: '山区早晚温差大，建议多带一些保暖衣物。' }
            ],
          },
          {
            label: '鞋子',
            content: [
              { type: 'text', text: '防滑平底鞋或徒步鞋，村内多石板与坡道，雨天会滑。' }
            ],
          },
          {
            label: '防晒',
            content: [
              { type: 'text', text: '帽子、防晒霜、墨镜。' }
            ],
          },
          {
            label: '雨具',
            content: [
              { type: 'text', text: '轻便雨衣或雨伞（山区变天快）。' }
            ],
          },
          {
            label: '常用药',
            content: [
              { type: 'text', text: '感冒、肠胃、晕车药、过敏药等。' }
            ],
          },
        ],
      },
      {
        title: '联系我们',
        items: [
          {
            label: '官方账号',
            content: [
              { type: 'text', text: '更多资讯，请关注微信公众号/小红书【DAO龙潭】\n或添加活动小助手微信：DAOLT-nomad' }
            ],
          }
        ]
      }
    ],
  },

  onLoad() {
    // 页面加载
  },

  onPhoneTap(e: WechatMiniprogram.BaseEvent) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 龙潭村在地生活指南',
      path: '/pages/about/travel-guide/index',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 龙潭村在地生活指南',
    }
  },
})
