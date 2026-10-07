import DefaultTheme from 'vitepress/theme'
import { withMermaid } from 'vitepress-plugin-mermaid'
// KaTeX 排版样式：本地依赖引入，不走 CDN，满足 spec 6.3 纯静态可迁移要求。
import 'katex/dist/katex.min.css'

// 自定义主题入口：目前仅用于接入 Mermaid 插件（spec 2 要求支持 Mermaid 流程图）。
// 其余能力沿用 VitePress 默认主题，不做额外改造（spec 4.3 禁止花哨组件）。
// 注意：vitepress 1.6.x 未导出 defineTheme（2.x 才有），主题直接导出普通对象即可。
export default withMermaid({
  extends: DefaultTheme
})
