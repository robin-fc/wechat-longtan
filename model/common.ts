export type ID = string | number

export interface TimeRange {
  startTime: string
  endTime: string
}

export interface Price {
  amount: number
  currency: string
  unit?: string
}

export interface PaginatedResult<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
}

export interface ImageResource {
  id: ID
  url: string
  width?: number
  height?: number
}

export interface CommonResult<T> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  total: number
  list: T[]
}
