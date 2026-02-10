interface StorySection {
  title: string
  content: string
}

interface StoryPageData {
  sections: StorySection[]
}

Page<StoryPageData>({
  data: {
    sections: [
      {
        title: '龙潭村的由来',
        content: '龙潭村位于福建省宁德市屏南县，是一个拥有深厚历史文化底蕴的古村落。村名"龙潭"源于村中的一口深潭，相传潭中有龙居住，因而得名。',
      },
      {
        title: '古厝与建筑',
        content: '龙潭村保存着大量明清时期的古建筑，这些古厝采用传统的闽东建筑风格，以木结构为主，雕梁画栋，精美绝伦。每一栋古厝都承载着家族的历史和文化记忆。',
      },
      {
        title: '乡村复兴之路',
        content: '近年来，龙潭村通过"老屋认租"等创新模式，吸引了众多艺术家、创业者和数字游民前来入驻。他们在保护古建筑的同时，注入了新的活力和创意，让这个古老的村落焕发出新的生机。',
      },
      {
        title: 'DAO龙潭的诞生',
        content: 'DAO龙潭是在乡村复兴实践中诞生的社区组织形式。它通过数字化手段连接村民、新村民、数字游民等多元群体，共同参与社区治理和发展，探索乡村振兴的新模式。',
      },
      {
        title: '社区文化',
        content: '龙潭村形成了独特的社区文化：传统与现代交融，本地与外来共生。在这里，你可以看到老村民与新村民一起庆祝传统节日，也可以参加各类创意工作坊和文化活动。',
      },
      {
        title: '未来愿景',
        content: 'DAO龙潭致力于打造一个可持续发展的乡村社区样本，让更多人看到乡村的可能性。我们相信，通过共同的努力，龙潭将成为一个真正的"理想社区"。',
      },
    ],
  },

  onLoad() {
    // 页面加载
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 龙潭故事',
      path: '/pages/about/story/index',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 龙潭故事',
    }
  },
})
