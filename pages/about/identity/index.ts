interface IdentityItem {
  title: string
  subtitle: string
  description: string
  value: string
}

interface IdentityPageData {
  identities: IdentityItem[]
  footer: string
}

Page<IdentityPageData, WechatMiniprogram.IAnyObject>({
  data: {
    identities: [
      {
        title: '数字游民',
        subtitle: '核心定义',
        description: '通过DAO龙潭认证，旅居于龙潭，依托互联网技术实现地理自由、远程工作或创业的人群；或是处于Gap Year人生探索阶段的旅者；又或者是对DAO龙潭社区抱有极大探索兴趣的各类朋友。',
        value: '为乡村带来新技术、新视角与跨地域资源，是社区活力的重要来源和创意连接器。',
      },
      {
        title: '新村民',
        subtitle: '核心定义',
        description: '通过老屋认租入驻龙潭，或是长期旅居生活工作于龙潭，参与社区共建的非原住居民。',
        value: '直接推动古厝新生、业态升级与文化融合，是社区结构优化和可持续发展的关键力量。',
      },
      {
        title: '老村民',
        subtitle: '核心定义',
        description: '龙潭村原住居民，乡村文化与记忆的承载者。熟知本地历史、习俗与自然生态，拥有传统生计经验。',
        value: '是社区文脉的“活地图”与稳定基石，其知识、经验与包容为新旧融合提供土壤。',
      },
      {
        title: '空间主理人',
        subtitle: '核心定义',
        description: '负责特定物理空间（如民宿、工作室、咖啡馆）运营与氛围营造的负责人。',
        value: '将静态空间转化为活跃的社区节点，通过日常运营与活动组织，塑造龙潭的独特体验场。',
      },
      {
        title: '活动发起人',
        subtitle: '核心定义',
        description: '通过DAO龙潭认证，在社区内主动策划并组织文化、社交或公益活动的个体。',
        value: '通过持续策划高质量活动，激发社区互动，保持龙潭的吸引力与凝聚力。',
      },
    ],
    footer: 'PS：一个人在DAO龙潭这个数字空间里可以同时拥有多重身份。',
  },

  onLoad() {
    // 页面加载
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 身份说明',
      path: '/pages/about/identity/index',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 身份说明',
    }
  },
})
