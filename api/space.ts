import { Space } from '../model/space'
import { PageResult } from '../model/common'
import { getData } from '../utils/request'

const baseUrl = '/app-api/daolongtan/space'

export function getSpaceList(): Promise<PageResult<Space>> {
    return getData<PageResult<Space>>(`${baseUrl}/list`, {})
}

export function getSpaceDetail(id: number): Promise<Space> {
    return getData<Space>(`${baseUrl}/detail`, { id: String(id) })
}
