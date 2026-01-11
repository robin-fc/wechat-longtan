const app = getApp();

Page({
  data: {
    menuTop: 0,
    menuHeight: 0,
    userInfo: null,
    currentTab: 0, // 0: 参与的活动, 1: 发布的活动, 2: 收藏的活动
    currentList: [],
    
    // 模拟数据
    mockUserInfo: {
      userId: '000001',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80',
      nickname: '乐悠悠',
      gender: 0, // 0: female, 1: male
      tags: ['新村民', '主理人'],
      joinTime: '2025年04月22日',
      bio: '领导开会的时候，我们应该保持肃静，打扰别人睡觉是很不礼貌的。',
      followingCount: 88,
      followerCount: 8,
      isFollowed: false
    },
    
    mockActivities: [
      {
        id: '1',
        title: '屏南数字游民生活周-探访龙潭本地自学家庭',
        poster: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        type: '生态观察',
        organizer: {
          name: 'angell ╭(╯ε╰)╮ 微风',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          tag: '数字游民'
        },
        time: '2025/11/25 11:00-16:30',
        location: '数字游民活动中心',
        statusText: '剩余20个名额',
        joinedUsers: [
           'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
           'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
           'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
        ],
        joinedCount: 45,
        price: '99.5'
      },
      {
        id: '2',
        title: '周五晚上一起吃火锅',
        poster: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        type: '聚餐',
        organizer: {
          name: '乐悠悠',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
          tag: '主理人'
        },
        time: '2025/11/28 18:00-20:00',
        location: '四库书屋',
        statusText: '剩余5个名额',
        joinedUsers: [],
        joinedCount: 8,
        price: '50'
      }
    ]
  },

  onLoad(options) {
    const { userId } = options;
    console.log('Viewing profile for user:', userId);
    
    // Get menu button info for custom navigation bar
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuTop: menuButtonInfo.top,
      menuHeight: menuButtonInfo.height
    });

    this.loadUserInfo(userId);
    this.loadActivities(0);
  },

  /**
   * 加载用户信息
   * @param {string} userId 用户ID
   */
  loadUserInfo(userId) {
    // 模拟接口调用
    setTimeout(() => {
      this.setData({
        userInfo: this.data.mockUserInfo
      });
    }, 300);
  },

  /**
   * 切换 Tab
   */
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentTab: index
    });
    this.loadActivities(index);
  },

  /**
   * 加载活动列表
   * @param {number} type 0:参与, 1:发布, 2:收藏
   */
  loadActivities(type) {
    // 模拟根据不同 Tab 加载不同数据
    let list = [];
    if (type === 0) {
      // 参与的活动
      list = [this.data.mockActivities[0]];
    } else if (type === 1) {
      // 发布的活动
      list = [this.data.mockActivities[1]];
    } else {
      // 收藏的活动
      list = this.data.mockActivities;
    }
    
    this.setData({
      currentList: list
    });
  },

  /**
   * 返回上一页
   */
  onBackTap() {
    wx.navigateBack();
  },

  /**
   * 关注/取消关注
   */
  onFollowTap() {
    const isFollowed = !this.data.userInfo.isFollowed;
    this.setData({
      'userInfo.isFollowed': isFollowed,
      'userInfo.followerCount': isFollowed ? this.data.userInfo.followerCount + 1 : this.data.userInfo.followerCount - 1
    });
    
    wx.showToast({
      title: isFollowed ? '已关注' : '已取消关注',
      icon: 'none'
    });
  },

  /**
   * 点击活动跳转
   */
  onActivityTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/detail?id=${id}`,
    });
  },

  onFollowingTap() {
    const userId = this.data.userInfo.userId
    wx.navigateTo({
      url: `/pages/user/list/index?title=关注&type=following&id=${userId}`
    })
  },

  onFollowersTap() {
    const userId = this.data.userInfo.userId
    wx.navigateTo({
      url: `/pages/user/list/index?title=粉丝&type=followers&id=${userId}`
    })
  }
});
