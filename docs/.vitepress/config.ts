import { defineConfig } from 'vitepress'

// 站点基础配置：仅包含可通过构建验证的最小项。
// 搜索、暗色模式、Markdown 能力、Mermaid、lastUpdated 等在「阶段三：VitePress 核心配置」中补齐。
export default defineConfig({
  lang: 'zh-CN',
  title: '个人技术博客 & 知识库',
  description: '工程师个人技术博客与永久知识库：学习存档、求职展示、公开查阅。'
})
