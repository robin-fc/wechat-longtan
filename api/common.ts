import { uploadFile } from '../utils/request'

export function uploadImage(filePath: string): Promise<string> {
  return uploadFile<string>('/daolongtan/common/image/upload', filePath)
}
