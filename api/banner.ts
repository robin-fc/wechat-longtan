import { getData } from '../utils/request'
import { Banner } from '../model/banner'

export function getBannerList(
): Promise<Banner[]> {
    return getData(
        '/app-api/daolongtan/banner/list',
    )
}

