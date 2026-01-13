import type { CommonResult } from '../model/common'

const BASE_URL: string =
  (wx.getStorageSync('apiBaseUrl') as string) || 'https://47.115.209.64'

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
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'tenant-id': '1',
    ...extra,
  }
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  headers?: Record<string, string>
}

function isTokenInvalid(
  res: WechatMiniprogram.RequestSuccessCallbackResult
): boolean {
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
  }).then((res) => {
    if (res.code === 0) {
      return res.data as T
    }
    throw new Error(res.msg || `请求失败: ${res.code}-${res.msg}`)
  })
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
  }).then((res) => {
    if (res.code === 0) {
      return res.data as T
    }
    throw new Error(res.msg || `请求失败: ${res.code}-${res.msg}`)
  })
}

export function postDataWithRes<T>(
  path: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  return request<T>({
    url: path,
    method: 'POST',
    headers: extraHeaders,
    data: body ?? {},
  }).then((res) => res as T)
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
      (k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`
    )
    .join('&')
  return `?${query}`
}

export function uploadFile<T>(
  path: string,
  filePath: string,
  name: string = 'file',
  formData?: Record<string, any>,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = BASE_URL + path
  return new Promise<T>(async (resolve, reject) => {
    try {
      await ensureValidToken()
    } catch {
      // Ignore token refresh failure
    }

    let attempt = 0
    const exec = () => {
      const headers = buildHeaders(extraHeaders)
      // 必须删除 content-type，让 wx.uploadFile 自动生成带 boundary 的 multipart/form-data
      delete headers['content-type']

      wx.uploadFile({
        url,
        filePath,
        name,
        formData,
        timeout: 60000,
        header: headers,
        success: async (res) => {
          console.log('上传文件', res)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const rawData = res.data
              // 如果返回的是纯字符串URL（非JSON格式），直接返回
              if (typeof rawData === 'string' && rawData.startsWith('http')) {
                if (
                  !rawData.trim().startsWith('{') &&
                  !rawData.trim().startsWith('"')
                ) {
                  console.log('图片上传成功(raw)', rawData)
                  resolve(rawData as unknown as T)
                  return
                }
              }

              const data = JSON.parse(res.data)
              if (typeof data === 'string' && data.startsWith('http')) {
                console.log('图片上传成功(string)', data)
                resolve(data as unknown as T)
                return
              }

              const result = data as CommonResult<T>
              if (result.code === 0 || result.code === 200) {
                console.log('图片上传成功', result)
                let payload: any = result.data as any
                try {
                  if (typeof payload === 'string') {
                    const s = payload.trim()
                    if (s.startsWith('{')) {
                      payload = JSON.parse(s)
                    }
                  }
                } catch {}
                if (typeof payload === 'string' && payload.startsWith('http')) {
                  console.log('图片上传成功(string)', payload)
                  resolve(payload as unknown as T)
                } else if (
                  payload &&
                  typeof payload === 'object' &&
                  typeof payload.url === 'string'
                ) {
                  console.log('图片上传成功(object)', payload.url)
                  resolve(payload.url as unknown as T)
                } else {
                  reject(new Error('上传响应缺少url'))
                }
              } else {
                console.error('上传业务失败', result)
                reject(new Error(result.msg || `上传失败: ${result.code}`))
              }
            } catch (e) {
              console.error('解析响应失败', res.data, e)
              if (typeof res.data === 'string' && res.data.startsWith('http')) {
                resolve(res.data as unknown as T)
              } else {
                reject(
                  new Error(
                    `解析响应失败: ${JSON.stringify(res.data).slice(0, 100)}`
                  )
                )
              }
            }
            return
          }

          if (res.statusCode === 401 && attempt < MAX_RETRY) {
            attempt++
            const ok = await refreshAccessToken(getTokenInfo().refreshToken)
            if (ok) {
              exec()
              return
            }
          }
          console.error('上传HTTP失败', res)
          reject(new Error(`上传失败: ${res.statusCode} ${res.errMsg || ''}`))
        },
        fail: (err) => reject(err),
      })
    }
    exec()
  })
}

function buildMultipartBody(
  fileBuffer: ArrayBuffer,
  fileName: string,
  fieldName: string,
  fileContentType: string,
  fields?: Record<string, string>
): ArrayBuffer {
  const boundary = `----wx-e2e-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
  function utf8Encode(str: string): Uint8Array {
    const bytes: number[] = []
    let i = 0
    while (i < str.length) {
      let code = str.charCodeAt(i++)
      if (code >= 0xd800 && code <= 0xdbff && i < str.length) {
        const next = str.charCodeAt(i)
        if (next >= 0xdc00 && next <= 0xdfff) {
          i++
          code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00)
        }
      }
      if (code <= 0x7f) {
        bytes.push(code)
      } else if (code <= 0x7ff) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
      } else if (code <= 0xffff) {
        bytes.push(
          0xe0 | (code >> 12),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        )
      } else {
        bytes.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        )
      }
    }
    return new Uint8Array(bytes)
  }
  const parts: Uint8Array[] = []
  if (fields) {
    Object.keys(fields).forEach((k) => {
      const v = fields[k] ?? ''
      const s =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${k}"\r\n\r\n` +
        `${v}\r\n`
      parts.push(utf8Encode(s))
    })
  }
  const header =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
    `Content-Type: ${fileContentType}\r\n\r\n`
  parts.push(utf8Encode(header))
  parts.push(new Uint8Array(fileBuffer))
  parts.push(utf8Encode(`\r\n--${boundary}--\r\n`))
  const totalLen = parts.reduce((sum, p) => sum + p.byteLength, 0)
  const out = new Uint8Array(totalLen)
  let offset = 0
  parts.forEach((p) => {
    out.set(p, offset)
    offset += p.byteLength
  })
  ;(out as any).boundary = boundary
  return out.buffer
}

export function postImageData<T>(
  path: string,
  imageBuffer: ArrayBuffer,
  options?: {
    fileName?: string
    fieldName?: string
    contentType?: string
    formData?: Record<string, string>
  },
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = BASE_URL + path
  const fileName = (options && options.fileName) || 'image.jpg'
  const fieldName = (options && options.fieldName) || 'file'
  const contentType =
    (options && options.contentType) || 'application/octet-stream'
  const body = buildMultipartBody(
    imageBuffer,
    fileName,
    fieldName,
    contentType,
    options?.formData
  ) as any
  const boundary = (body as any).boundary as string
  return new Promise<T>(async (resolve, reject) => {
    try {
      await ensureValidToken()
    } catch {}
    let attempt = 0
    const exec = () => {
      const headers = buildHeaders({
        ...(extraHeaders || {}),
        'content-type': `multipart/form-data; boundary=${boundary}`,
      })
      wx.request({
        url,
        method: 'POST',
        data: body,
        header: headers,
        success: async (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const raw = res.data as any
            if (typeof raw === 'string') {
              try {
                const parsed = JSON.parse(raw)
                if (parsed && typeof parsed === 'object') {
                  const d = (parsed.data ?? parsed) as T
                  resolve(d as T)
                  return
                }
              } catch {
                if (raw.startsWith('http')) {
                  resolve(raw as unknown as T)
                  return
                }
              }
              resolve(raw as unknown as T)
              return
            }
            const obj = raw as CommonResult<T>
            if (obj && typeof obj === 'object' && 'data' in obj) {
              resolve((obj.data as T) ?? (raw as T))
              return
            }
            resolve(raw as T)
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
          reject(new Error(`上传失败: ${res.statusCode}`))
        },
        fail: (err) => reject(err),
      })
    }
    exec()
  })
}
