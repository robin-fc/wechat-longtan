import { uploadFile } from "../utils/request"

export interface uploadImageRes {
  code: number
  msg: string
  data: { url: string }
}

export interface uploadImageParams {
  file: string
  businessType?: string
}

export function uploadImage(filePath: string, businessType?: string): Promise<string> {
  const formData: Record<string, any> = {}
  if (businessType) {
    formData.businessType = businessType
  }
  return uploadFile<string>(
    '/daolongtan/common/image/upload',
    filePath,
    'file',
    formData
  )
}
