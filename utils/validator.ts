// 校验是否为中国大陆手机号
export function isValidCnPhone(phone: string): boolean {
    if (!phone) return false
    return /^1[3-9]\d{9}$/.test(phone)
}
