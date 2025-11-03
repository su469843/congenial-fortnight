# 英语学习应用

基于Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind CSS构建的英语学习应用，类似多邻国的功能。

## 功能特点

- **间隔重复记忆系统(SRS)** - 基于SM-2算法智能安排复习
- **多样化练习模式** - 单词卡片、拼写练习、选择题等
- **分级词书** - 小学、初中、高中、四级词汇
- **进度追踪** - 学习统计和图表展示
- **PWA支持** - 可安装为桌面/移动应用
- **成就系统** - 徽章和等级激励
- **响应式设计** - 支持移动端和桌面端

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **PWA**: VitePWA
- **数据存储**: 本地存储 (可扩展为PostgreSQL/Neon)

## 项目结构

```
src/
├──components/     # 可复用组件
│  └──learning/   # 学习相关组件
├──views/         # 页面组件
├──stores/        # Pinia状态管理
├──router/        # 路由配置
├──utils/         # 工具函数(SRS算法等)
├──assets/        # 静态资源
└──types/         # TypeScript类型定义
```

## 快速开始

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

### 构建生产版本

```sh
npm run build
```

### 预览生产版本

```sh
npm run preview
```

## 部署

### Vercel部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量 (可选)
4. 自动部署完成

### 环境变量

创建`.env`文件并配置以下变量：

```env
# 数据库连接字符串 (Neon PostgreSQL)
VITE_DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# API基础URL
VITE_API_BASE_URL=https://your-api.vercel.app

# 应用标题
VITE_APP_TITLE=英语学习应用
```

## 开发指南

### 添加新的练习模式

1. 在`src/components/learning/`中创建新组件
2. 在`src/views/LearnView.vue`中注册组件
3. 在`src/types/index.ts`中添加相关类型定义

### 扩展词库

1. 在`src/utils/database.ts`中的`getMockWords`函数添加更多单词
2. 或者实现从API/数据库加载单词的功能

### 自定义SRS算法

在`src/utils/srs.ts`中修改SM2算法参数或实现其他算法

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
