export interface Banner {
    /*Banner编号 */
    id: number;
    /*Banner图片地址 */
    logo: string;
    /*跳转链接地址 */
    url: string;
    /*标题 */
    title?: string;
    /*描述 */
    description?: string;
    /*分类 */
    category?: string;
}