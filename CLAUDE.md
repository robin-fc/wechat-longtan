# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个微信小程序项目 "DAO龙潭"，使用 TypeScript + Less 开发，包含活动、民宿、用户等核心功能模块。

## 开发命令

此项目使用微信开发者工具进行开发和调试：
- 在微信开发者工具中打开项目目录
- 使用开发者工具的编译、预览和上传功能

## 代码架构

### 目录结构

- `api/` - API 接口封装层，按业务模块划分（activity、homestay、user 等）
- `model/` - TypeScript 类型定义，与 api 目录一一对应
- `utils/` - 工具函数库
  - `request.ts` - 统一的网络请求封装，包含 token 自动刷新机制
  - `navigation.ts` - 路由导航工具
  - `date.ts` / `isoTime.ts` - 日期时间处理
- `pages/` - 小程序页面，每个页面包含 .ts/.wxml/.less/.json 四个文件
- `components/` - 可复用组件（activity-card、homestay-card 等）
- `custom-tab-bar/` - 自定义底部导航栏

### 核心设计模式

**三层架构**:
1. **Model 层** (`model/`): 定义后端 API 返回的数据类型
2. **API 层** (`api/`): 封装网络请求，使用 `utils/request.ts` 中的 `getData`/`postData` 方法
3. **Page 层** (`pages/`): 页面逻辑，调用 API 层获取数据

示例:
```typescript
// model/activity.ts - 定义类型
export interface Activity { id: number; title: string; ... }

// api/activity.ts - 封装接口
import { getData } from '../utils/request'
export function getActivityList(params): Promise<Activity[]> {
  return getData('/app-api/daolongtan/activity/list', params)
}

// pages/activity/list/index.ts - 使用
import { getActivityList } from '../../../api/activity'
const data = await getActivityList({ pageNo: '1', pageSize: '10' })
```

### 网络请求机制

`utils/request.ts` 提供了完整的请求封装:
- **自动 Token 管理**: 自动添加 Bearer token，支持 token 过期前主动刷新
- **401/403 重试**: Token 失效时自动刷新并重试（最多 2 次）
- **统一错误处理**: 请求失败时抛出带错误信息的 Error
- **文件上传**: `uploadFile()` 方法处理图片等文件上传

## 编码规范

1. **遵循现有代码风格**: 命名、格式、注释保持一致
2. **严格遵循三层架构**: 新增功能时在 model、api、pages 对应目录创建文件
3. **优先使用后端类型**: 尽量使用 `model/` 中定义的类型，避免前端自定义类型
4. **使用 ES6+ 语法**:
   - 异步操作必须使用 `async/await`，禁止回调函数
   - 禁止空 `.catch(() => {})`，必须处理异常并抛出提示
5. **TypeScript 严格模式**: 配置了严格的类型检查，写完代码需复查并修复类型错误

## 项目配置

- **TypeScript**: 严格模式，target ES2020
- **小程序框架**: 微信小程序基础库 3.12.0
- **编译器**: 支持 TypeScript 和 Less
- **API 基地址**: `https://47.115.209.64` (存储在 `utils/request.ts`)
- **租户 ID**: 固定为 '1'

## 主要业务模块

- **活动系统**: 活动列表/详情/发布/报名/收藏
- **活动合集**: 活动集合管理
- **民宿系统**: 民宿列表/详情/房间/申请入住
- **用户系统**: 用户信息/关注/资料编辑
- **订单系统**: 活动订单确认和管理
- **搜索**: 全局搜索功能

## TabBar 页面

自定义 TabBar，包含 4 个主要页面:
- 首页 (`pages/home/index`)
- 活动 (`pages/activity/list`)
- 入住 (`pages/homestay/list`)
- 我的 (`pages/mine/index`)
