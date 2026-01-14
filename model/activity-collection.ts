export interface ActivityCollection {
  id: number
  name: string
  logo?: string
  coverUrl?: string
  listUrl?: string
  creatorId: number
  creatorName?: string
  creatorAvatar?: string
  description?: string
  createTime?: string
}

export interface CreateActivityCollectionPayload {
  name: string
  logo: string
  description: string
}
