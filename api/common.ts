import { postData } from '../utils/request'

export interface uploadImageRes {
  code: number
  msg: string
  data: { url: string }
}

export interface uploadImageParams {
  file: string
  businessType?: string
}

export async function uploadImage(
  filePath: string,
  businessType = ''
): Promise<uploadImageRes> {
  const fsm = wx.getFileSystemManager()
  const base64 = await new Promise<string>((resolve, reject) => {
    fsm.readFile({
      filePath,
      encoding: 'base64',
      success: (res) => resolve(res.data as string),
      fail: (err) => reject(err),
    })
  })
  const mime =
    filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
  const dataUrl = `data:${mime};base64,${base64}`
  const body: uploadImageParams = {
    file: dataUrl,
    businessType,
  }
  const res = await postData<uploadImageRes>(
    '/daolongtan/common/image/upload',
    body
  )
  return res
}
