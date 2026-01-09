import { getData, postData, postDataWithRes, request } from '../utils/request'
import type {
  AppGeneratePayParamsReqVO,
  AppGeneratePayParamsRespVO,
  AppActivityOrderCreateReqVO,
  AppPayOrderCreateDataVO,
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

export async function createActivityOrder(
  data: AppActivityOrderCreateReqVO
): Promise<AppPayOrderCreateDataVO> {
  const res = await request<AppPayOrderCreateDataVO>({
    url: `${baseUrl}/create-activity`,
    method: 'POST',
    data,
  })
  if (res.code === 0 || res.code === 200) {
    return res.data
  }
  throw new Error(res.msg || '创建活动订单失败')
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

export function cancelOrder(data: {
  bizOrderNo: string
  reason: string
}): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/cancel`, data)
}
