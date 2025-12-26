import type { CommonResult } from '../model/common'

const BASE_URL: string =
  (wx.getStorageSync('apiBaseUrl') as string) || 'http://127.0.0.1'

const REFRESH_THRESHOLD_SEC = 300
const MAX_RETRY = 2
let refreshingPromise: Promise<boolean> | null = null

function nowMs(): number {
  return Date.now()
}

function getTokenInfo() {
  const accessToken = (wx.getStorageSync('accessToken') as string) || ''
  const refreshToken = (wx.getStorageSync('refreshToken') as string) || ''
  const expiresTimeStr = (wx.getStorageSync('expiresTime') as string) || ''
  const expiresMs = expiresTimeStr ? Date.parse(expiresTimeStr) : 0
  return { accessToken, refreshToken, expiresMs }
}

function setTokenInfo(data: {
  accessToken: string
  refreshToken: string
  expiresTime: string
}) {
  wx.setStorageSync('accessToken', data.accessToken)
  wx.setStorageSync('refreshToken', data.refreshToken)
  wx.setStorageSync('expiresTime', data.expiresTime)
}

function buildHeaders(extra?: Record<string, string>) {
  const token = (wx.getStorageSync('accessToken') as string) || ''
  const auth = token ? `Bearer ${token}` : 'Bearer test1'
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    Authorization: auth,
    'tenant-id': '1',
    ...extra,
  }
  return headers
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  headers?: Record<string, string>
}

function isTokenInvalid(res: WechatMiniprogram.RequestSuccessCallbackResult): boolean {
  const status = res.statusCode
  if (status === 401 || status === 403) {
    return true
  }
  const data = res.data as any
  if (data && typeof data === 'object' && typeof data.code === 'number') {
    // 约定 401 代表令牌失效
    if (data.code === 401) {
      return true
    }
  }
  return false
}

async function ensureValidToken(): Promise<void> {
  const { expiresMs, refreshToken } = getTokenInfo()
  if (!expiresMs) {
    return
  }
  const remainSec = Math.floor((expiresMs - nowMs()) / 1000)
  if (remainSec > REFRESH_THRESHOLD_SEC) {
    return
  }
  await refreshAccessToken(refreshToken)
}

function refreshAccessToken(refreshToken: string): Promise<boolean> {
  if (!refreshToken) {
    return Promise.resolve(false)
  }
  if (refreshingPromise) {
    return refreshingPromise
  }
  refreshingPromise = new Promise<boolean>((resolve) => {
    wx.request({
      url: BASE_URL + '/app-api/daolongtan/auth/refresh-token',
      method: 'POST',
      header: buildHeaders({ Authorization: 'Bearer test1' }),
      data: { refreshToken },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = (res.data || {}) as {
            code?: number
            msg?: string
            data?: {
              accessToken: string
              refreshToken: string
              expiresTime: string
            }
          }
          const payload =
            (body && body.data) ||
            (res.data as {
              accessToken: string
              refreshToken: string
              expiresTime: string
            })
          if (
            payload &&
            payload.accessToken &&
            payload.refreshToken &&
            payload.expiresTime
          ) {
            setTokenInfo(payload)
            refreshingPromise = null
            resolve(true)
            return
          }
        }
        refreshingPromise = null
        resolve(false)
      },
      fail: () => {
        refreshingPromise = null
        resolve(false)
      },
    })
  })
  return refreshingPromise
}

export function request<T>(options: RequestOptions): Promise<CommonResult<T>> {
  const url = BASE_URL + options.url
  return new Promise<CommonResult<T>>(async (resolve, reject) => {
    try {
      await ensureValidToken()
    } catch {
      // 忽略主动刷新失败，继续请求，必要时走被动刷新
    }
    let attempt = 0
    const exec = () => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header: buildHeaders(options.headers),
        success: async (res) => {
          const data = (res.data || {}) as CommonResult<T>
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
            return
          }
          if (isTokenInvalid(res) && attempt < MAX_RETRY) {
            attempt++
            const ok = await refreshAccessToken(getTokenInfo().refreshToken)
            if (ok) {
              exec()
              return
            }
          }
          reject(new Error(data.msg || `请求失败: ${res.statusCode}`))
        },
        fail: (err) => reject(err),
      })
    }
    exec()
  })
}

export function getData<T>(
  path: string,
  params?: Record<string, any>,
  extraHeaders?: Record<string, string>
): Promise<T> {
  return request<T>({
    url: path + buildQuery(params || {}),
    method: 'GET',
    headers: extraHeaders,
  }).then((res) => (res.data as T))
}

export function postData<T>(
  path: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  return request<T>({
    url: path,
    method: 'POST',
    headers: extraHeaders,
    data: body ?? {},
  }).then((res) => (res.data as T))
}

function buildQuery(params: Record<string, any>) {
  const keys = Object.keys(params).filter(
    (k) => params[k] !== undefined && params[k] !== null && params[k] !== ''
  )
  if (!keys.length) {
    return ''
  }
  const query = keys
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`
    )
    .join('&')
  return `?${query}`
}
