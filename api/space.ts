import { Space } from '../model/space'
import { PageResult } from '../model/common'
import { getData } from '../utils/request'

const baseUrl = '/app-api/daolongtan/space'

export function getSpaceList(): Promise<PageResult<Space>> {
    return getData<PageResult<Space>>(`${baseUrl}/list`, {})
}
