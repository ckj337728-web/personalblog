import DefaultTheme from 'vitepress/theme'
import { withMermaid } from 'vitepress-plugin-mermaid'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import BlogList from './BlogList.vue'
// KaTeX 排版样式：本地依赖引入，不走 CDN，满足 spec 6.3 纯静态可迁移要求。
import 'katex/dist/katex.min.css'
import './custom.css'

// 自定义主题入口：继承默认主题，仅做必要扩展：
//   1. withMermaid —— spec 2 要求支持 Mermaid 流程图
//   2. Layout       —— layout-bottom 插槽注入全站页脚（spec 4.2）
//   3. BlogList     —— 博客文章列表，由 blog.data.ts 在构建期生成
//   4. custom.css   —— 极简黑白灰微调 + 隐藏默认页脚，避免与自定义页脚重复
// 不做额外组件改造（spec 4.3 禁止花哨组件）。
// 注意：vitepress 1.6.x 未导出 defineTheme（2.x 才有），主题直接导出普通对象即可。
const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 自定义主题下，theme 目录内的 .vue 不会被自动全局注册（自动注册只覆盖
    // 默认主题的内建组件），因此 Markdown 里写 <BlogList /> 会渲染成空节点。
    // 这里显式注册，供 docs/blog/index.md 直接使用。
    app.component('BlogList', BlogList)
  }
}

// withMermaid 包装后类型会丢失，这里断言回 Theme 以保留类型信息。
export default withMermaid(theme) as Theme
