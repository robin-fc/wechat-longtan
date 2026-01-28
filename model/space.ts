export interface Space {
    id: number
    name: string
    intro?: string
    description?: string // 富文本介绍
    logo?: string
    images?: string[]
    banner?: string
    address?: string
    mapImages?: string[]
    manager?: {
        userId: number
        logo: string
        wxName: string
        memberName?: string
        introduction?: string
        memberLevel?: string
        memberTags?: string[]
        followed?: boolean
    }
}
