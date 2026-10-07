import DefaultTheme from 'vitepress/theme'
import { withMermaid } from 'vitepress-plugin-mermaid'
import Layout from './Layout.vue'
// KaTeX 排版样式：本地依赖引入，不走 CDN，满足 spec 6.3 纯静态可迁移要求。
import 'katex/dist/katex.min.css'
import './custom.css'

// 自定义主题入口：继承默认主题，仅做三处必要扩展：
//   1. withMermaid —— spec 2 要求支持 Mermaid 流程图
//   2. Layout       —— layout-bottom 插槽注入全站页脚（spec 4.2）
//   3. custom.css   —— 极简黑白灰微调 + 隐藏默认页脚，避免与自定义页脚重复
// 不做额外组件改造（spec 4.3 禁止花哨组件）。
// 注意：vitepress 1.6.x 未导出 defineTheme（2.x 才有），主题直接导出普通对象即可。
export default withMermaid({
  extends: DefaultTheme,
  Layout
})
