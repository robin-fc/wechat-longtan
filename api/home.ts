import type { Activity, ActivityCollection } from "../model/activity";
import type { Homestay } from "../model/homestay";
import type { CompanionGroup, UserProfile } from "../model/user";
import type { ID, ImageResource, Price, TimeRange } from "../model/common";

export interface HomeEntryItem {
  id: ID;
  name: string;
  icon: ImageResource;
  type: "activityCategory" | "homestay" | "collection" | "space";
  value: string;
}

export interface HomeCarouselItem {
  id: ID;
  title: string;
  poster: ImageResource;
  slogan: string;
  companions: CompanionGroup;
  timeRange: TimeRange;
  price: Price;
}

export interface HomeAboutLink {
  id: ID;
  title: string;
  description?: string;
}

export interface HomePageData {
  currentUser?: UserProfile;
  carousel: HomeCarouselItem[];
  entries: HomeEntryItem[];
  hotActivities: Activity[];
  collections: ActivityCollection[];
  homestays: Homestay[];
  aboutLinks: HomeAboutLink[];
}

const avatar1: ImageResource = {
  id: "avatar-1",
  url: "/assets/images/card-placeholder.png",
};

const defaultCompanions: CompanionGroup = {
  companions: [
    { id: "c1", nickname: "伙伴一", avatar: avatar1 },
    { id: "c2", nickname: "伙伴二", avatar: avatar1 },
    { id: "c3", nickname: "伙伴三", avatar: avatar1 },
  ],
  totalCount: 12,
};

const baseTimeRange: TimeRange = {
  startTime: "2025-01-20 09:00",
  endTime: "2025-01-20 17:00",
};

const basePrice: Price = {
  amount: 199,
  currency: "CNY",
  unit: "人",
};

const carouselMock: HomeCarouselItem[] = [
  {
    id: "car-1",
    title: "龙潭剪纸体验",
    poster: {
      id: "car-img-1",
      url: "/assets/images/card-placeholder.png",
    },
    slogan: "一刀一剪间感受非遗魅力",
    companions: defaultCompanions,
    timeRange: baseTimeRange,
    price: basePrice,
  },
];

const entriesMock: HomeEntryItem[] = [
  {
    id: "entry-photo",
    name: "摄影漫游",
    icon: {
      id: "entry-photo-icon",
      url: "/assets/images/card-placeholder.png",
    },
    type: "activityCategory",
    value: "摄影",
  },
  {
    id: "entry-homestay",
    name: "龙潭民宿",
    icon: {
      id: "entry-homestay-icon",
      url: "/assets/images/card-placeholder.png",
    },
    type: "homestay",
    value: "all",
  },
];

const hotActivityMock: Activity[] = [
  {
    id: "act-1",
    title: "进山路徒步一日体验",
    poster: {
      id: "act-1-poster",
      url: "/assets/images/card-placeholder.png",
    },
    primaryCategory: "ruralCulture",
    secondaryTag: { id: "tag-hike", name: "徒步" },
    timeRange: baseTimeRange,
    price: basePrice,
    status: "ongoing",
    space: {
      id: "space-1",
      name: "龙潭山谷",
      address: "龙潭村入口集合",
    },
    companions: defaultCompanions,
  },
];

const collectionsMock: ActivityCollection[] = [
  {
    id: "col-1",
    name: "周末自然漫游系列",
    description: "围绕龙潭自然与乡村文化的周末精选活动",
    cover: {
      id: "col-1-cover",
      url: "/assets/images/card-placeholder.png",
    },
    activities: hotActivityMock,
  },
];

const homestayMock: Homestay[] = [
  {
    id: "home-1",
    name: "龙潭风铃小院",
    cover: {
      id: "home-1-cover",
      url: "/assets/images/card-placeholder.png",
    },
    address: "龙潭村口向里步行五分钟",
    featureTags: [
      { id: "tag-quiet", name: "安静庭院" },
      { id: "tag-view", name: "山景房" },
    ],
    referencePrice: {
      amount: 2999,
      currency: "CNY",
      unit: "周",
    },
  },
];

const aboutLinksMock: HomeAboutLink[] = [
  {
    id: "about-history",
    title: "龙潭史",
    description: "了解龙潭的历史与故事",
  },
  {
    id: "about-guide",
    title: "居住指南",
    description: "抵达与居住的实用信息",
  },
];

const homeMockData: HomePageData = {
  currentUser: {
    id: "user-1",
    nickname: "龙潭访客",
    avatar: avatar1,
  },
  carousel: carouselMock,
  entries: entriesMock,
  hotActivities: hotActivityMock,
  collections: collectionsMock,
  homestays: homestayMock,
  aboutLinks: aboutLinksMock,
};

export function fetchHomeData(): Promise<HomePageData> {
  return Promise.resolve(homeMockData);
}
