import { request, getData } from '../utils/request'
import type { CommonResult } from '../model/common'
import type { AppUserApplyFormRespVO, UserApplyReqVO } from '../model/user-apply'

export function submitUserApply(data: UserApplyReqVO): Promise<CommonResult<boolean>> {
    return request<boolean>({
        url: '/app-api/daolongtan/form/submit',
        method: 'POST',
        data,
    })
}

export function fetchUserApplyForm(type: number): Promise<AppUserApplyFormRespVO> {
    return getData<AppUserApplyFormRespVO>('/app-api/daolongtan/form/get', { type })
}
