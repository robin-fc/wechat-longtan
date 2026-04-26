import { getData } from '../utils/request'
import { PageResult } from '../model/common'

export interface AppMpArticleRecommendRespVO {
  title: string
  coverUrl: string
  articleUrl: string
  summary?: string  // 文章摘要/简介
}

export function getArticleRecommendPage(
  pageNo: string | number,
  pageSize: string | number
): Promise<PageResult<AppMpArticleRecommendRespVO>> {
  return getData<PageResult<AppMpArticleRecommendRespVO>>('/app-api/daolongtan/mp-article-recommend/page', {
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  })
}
