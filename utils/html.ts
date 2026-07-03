/**
 * 解码后端返回的 HTML 内容（实体转义、箭头占位符等）
 */
export function decodeHtmlContent(raw: string | undefined | null): string {
  if (raw === undefined || raw === null) return ''
  let html = String(raw).trim()
  if (!html) return ''

  // 部分接口用箭头替代尖括号
  html = html.replace(/←/g, '<').replace(/→/g, '>')

  // 循环解码 HTML 实体，处理多重转义
  let prev = ''
  while (prev !== html) {
    prev = html
    html = html
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/&amp;/gi, '&')
  }

  return html
}

/** 规范化 img 标签，适配小程序 rich-text 组件 */
function normalizeRichTextImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!src) return ''
    const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? ''
    return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;" />`
  })
}

/**
 * 解码并处理为 rich-text 可用的 HTML
 */
export function prepareRichTextHtml(raw: string | undefined | null): string {
  const html = decodeHtmlContent(raw)
  if (!html) return ''
  return normalizeRichTextImages(html)
}

/**
 * 解析项目群图片字段（支持 JSON 数组、单个 URL、逗号分隔）
 */
export function parseGroupImages(raw: string | undefined | null): string[] {
  if (!raw) return []
  const trimmed = String(raw).trim()
  if (!trimmed) return []

  const isUrl = (s: string) => /^https?:\/\//i.test(s)

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(isUrl)
    }
    if (typeof parsed === 'string' && isUrl(parsed)) {
      return [parsed]
    }
  } catch {
    // 非 JSON，继续按字符串处理
  }

  if (isUrl(trimmed)) {
    return [trimmed]
  }

  return trimmed
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(isUrl)
}
