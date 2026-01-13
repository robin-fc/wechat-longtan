export interface AppUserInfoRespVO {
  /*用户编号 */
  userId: number

  /*用户头像 */
  logo: string

  /*用户微信名 */
  wxName: string

  /*成员名称 */
  memberName: string

  /*用户简介 */
  introduction: string

  /*成员等级（字典键值：0=老村民，1=新村民，2=数字游民，3=游客） */
  memberLevel: string

  /*组织者标签（逗号分隔的字典键值：0=空间主理人，1=活动发起人） */
  memberTags: string[]
}
