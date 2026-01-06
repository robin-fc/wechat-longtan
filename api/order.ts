import { getData, postData, postDataWithRes } from '../utils/request'
import type {
  AppGeneratePayParamsReqVO,
  AppGeneratePayParamsRespVO,
  AppOrderCreateReqVO,
  AppPayOrderCreateRespVO,
  AppOrderListRespVO,
  AppOrderDetailRespVO,
} from '../model/order'
import type { PageResult } from '../model/common'

const baseUrl = '/app-api/daolongtan/order'

export function generatePayParams(
  data: AppGeneratePayParamsReqVO
): Promise<AppGeneratePayParamsRespVO> {
  return postData<AppGeneratePayParamsRespVO>(
    `${baseUrl}/generate-pay-params`,
    data
  )
}

export async function createAccommodationOrder(
  data: AppOrderCreateReqVO
): Promise<AppPayOrderCreateRespVO> {
 const res = await postDataWithRes<AppPayOrderCreateRespVO>(
    `${baseUrl}/create-accommodation`,
    data
  )
  console.log('createAccommodationOrder resp=', res)
   return res;
}

export function getAccommodationOrderList(
  pageNo: string,
  pageSize: string
): Promise<PageResult<any>> {
  return getData<PageResult<any>>(
    `${baseUrl}/accommodation-list`,
    { pageNo, pageSize }
  )
}

export function getMyOrderList(
  type: string,
  pageNo: string,
  pageSize: string
): Promise<PageResult<AppOrderListRespVO>> {
  return getData<PageResult<AppOrderListRespVO>>(
    `${baseUrl}/my-list`,
    { type, pageNo, pageSize }
  )
}

export function getOrderDetail(
  bizOrderNo: string
): Promise<AppOrderDetailRespVO> {
  return getData<AppOrderDetailRespVO>(
    `${baseUrl}/detail`,
    { bizOrderNo }
  )
}
