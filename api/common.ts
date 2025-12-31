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

export function uploadImage(filePath: string, businessType: string = ''): Promise<string> {
  return uploadFile<string>(
    '/daolongtan/common/image/upload',
    filePath,
    'file',
    { businessType }
  )
}
// export async function uploadImage(
//   filePath: string,
//   businessType = ''
// ): Promise<uploadImageRes> {
//   const fsm = wx.getFileSystemManager()
//   const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
//     fsm.readFile({
//       filePath,
//       success: (res) => resolve(res.data as ArrayBuffer),
//       fail: (err) => reject(err),
//     })
//   })
//   const lower = filePath.toLowerCase()
//   const isPng = lower.endsWith('.png')
//   const mime = isPng ? 'image/png' : 'image/jpeg'
//   const fileName = filePath.split('/').pop() || (isPng ? 'image.png' : 'image.jpg')
//   const formData = businessType ? { businessType } : undefined
//   const res = await postImageData<uploadImageRes>(
//     '/daolongtan/common/image/upload',
//     buffer,
//     {
//       fileName,
//       fieldName: 'file',
//       contentType: mime,
//       formData,
//     }
//   )
//   return res
// }
