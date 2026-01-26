import { request } from '../utils/request'
import type { CommonResult } from '../model/common'
import type { UserApplyReqVO } from '../model/user-apply'

const BASE_URL = '/app-api/daolongtan/user-apply'

export function submitUserApply(data: UserApplyReqVO): Promise<CommonResult<boolean>> {
    return request<boolean>({
        url: `${BASE_URL}/submit`,
        method: 'POST',
        data,
    })
}
