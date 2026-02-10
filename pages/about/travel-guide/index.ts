interface GuideSection {
  title: string
  items: GuideItem[]
}

interface GuideItem {
  label: string
  content: string
}

interface TravelGuidePageData {
  sections: GuideSection[]
}

Page<TravelGuidePageData>({
  data: {
    sections: [
      {
        title: '如何抵达龙潭',
        items: [
          {
            label: '飞机',
            content: '最近的机场是福州长乐国际机场，从机场可乘坐大巴或打车前往宁德市，再转乘至屏南县龙潭村。',
          },
          {
            label: '高铁',
            content: '乘坐高铁至宁德站，然后转乘巴士或拼车前往屏南县龙潭村，车程约2小时。',
          },
          {
            label: '自驾',
            content: '导航至"屏南县龙潭村"，沿途风景优美，建议提前规划路线。',
          },
        ],
      },
      {
        title: '住宿选择',
        items: [
          {
            label: '民宿',
            content: '村内有多家经过改造的传统古厝民宿，提供舒适的住宿体验。可在DAO龙潭小程序的"入住"板块查看并预订。',
          },
          {
            label: '长租',
            content: '如需长期居住，可咨询老屋认租项目，与村委会或空间主理人联系。',
          },
        ],
      },
      {
        title: '生活设施',
        items: [
          {
            label: '餐饮',
            content: '村内有多家特色餐厅和咖啡馆，提供本地菜肴和创意料理。',
          },
          {
            label: '购物',
            content: '村内有小卖部和农产品集市，日常用品和新鲜食材均可购买。',
          },
          {
            label: '网络',
            content: '大部分民宿和公共空间提供稳定的WiFi，适合远程工作。',
          },
          {
            label: '医疗',
            content: '村内有卫生所，屏南县城有综合医院，距离约30分钟车程。',
          },
        ],
      },
      {
        title: '活动参与',
        items: [
          {
            label: '社区活动',
            content: '通过DAO龙潭小程序查看最新活动，包括文化工作坊、音乐会、市集等。',
          },
          {
            label: '志愿服务',
            content: '欢迎参与社区志愿活动，为龙潭的发展贡献力量。',
          },
        ],
      },
      {
        title: '注意事项',
        items: [
          {
            label: '环保',
            content: '请爱护古村环境，垃圾分类处理，保护历史建筑。',
          },
          {
            label: '尊重',
            content: '尊重当地村民的生活习惯和文化传统，和谐共处。',
          },
          {
            label: '安全',
            content: '注意人身和财产安全，夜间出行建议结伴而行。',
          },
        ],
      },
    ],
  },

  onLoad() {
    // 页面加载
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 出行指南',
      path: '/pages/about/travel-guide/index',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 出行指南',
    }
  },
})
