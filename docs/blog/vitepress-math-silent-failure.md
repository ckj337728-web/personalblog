---
title: 记一次隐性故障：VitePress 1.6.4 里 LaTeX 公式被静默丢弃
date: 2026-10-07
tags:
  - VitePress
  - 踩坑记录
  - KaTeX
category: 技术博客
---

# 记一次隐性故障：VitePress 1.6.4 里 LaTeX 公式被静默丢弃

构建退出码 0、没有任何报错、页面正常打开 —— 但公式**凭空消失了**，连纯文本回退都没留下。记录完整的定位与修复过程。

## 现象

按 VitePress 声明的可选依赖装上数学插件后，文章里的公式全部消失。产物 HTML 中既没有渲染结果，也没有原始 LaTeX 文本：

```text
# 期望在产物中看到(mjx-container 或 katex)
$ grep -c "mjx-container" dist/article.html
0

# 实际连公式源码都不在产物里
$ grep -c "ISN = M" dist/article.html
0
```

同时构建日志毫无异常：

```bash
$ npm run docs:build
✓ building client + server bundles...
✓ rendering pages...
build complete in 23.07s.
$ echo $?
0
```

::: warning 这类故障最危险的地方
构建成功 + 页面能打开，会让人误以为功能正常。只有对比产物内容才能发现，靠"跑通构建"无法验收。
:::

## 隔离变量定位

先排除"插件本身坏了"的可能 —— 写一个最小脚本，脱离 VitePress 直接用 markdown-it 渲染：

```javascript
import { createMarkdownRenderer } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

const src = '行内 $a^2+b^2=c^2$ 与块级：\n\n$$\nE = mc^2\n$$\n'

const md = await createMarkdownRenderer(process.cwd())
md.use(mathjax3)

// 关键：检查返回的是同步还是异步渲染器
console.log('renderAsync 可用:', typeof md.renderAsync === 'function')
const out = md.render(src, {})
console.log('输出长度:', out.length)
console.log('含 mjx-container:', out.includes('mjx-container'))
```

结果**插件是好的**：

```text
renderAsync 可用: false
输出长度: 9260
含 mjx-container: true
```

`renderAsync 可用: false` 这一行是关键线索。它说明 `vitepress@1.6.4` 的渲染器是**同步**的 —— 而 `markdown-it-mathjax3@4` 是**异步**插件。

## 根因

异步插件返回 Promise，同步渲染链不会 await 它，插件对渲染结果的写入发生在渲染完成之后，于是内容被丢弃。查依赖可以印证：VitePress 1.6.4 的 `dependencies` 里**没有** `markdown-it-async`（那是 2.x 才引入的）：

```bash
$ node -e "const p=require('./node_modules/vitepress/package.json'); console.log(Object.keys(p.dependencies).filter(d=>d.includes('markdown')))"
[ '@types/markdown-it' ]
```

更值得注意的是版本声明本身具有误导性 —— VitePress 把这个插件列进了 `peerOptional`：

```json
"peerDependenciesMeta": {
  "markdown-it-mathjax3": { "optional": true }
},
"peerDependencies": {
  "markdown-it-mathjax3": "^4"
}
```

按 `peerDependencies` 装依赖是常规做法，但这里"官方声明支持"的版本组合实际不可用。

## 修复

改用同步插件。选择 `@mdit/plugin-katex` 的依据是它的 peer 范围与 VitePress 内置的 markdown-it 一致：

```bash
npm install -D @mdit/plugin-katex
```

```typescript
// docs/.vitepress/config.ts
import { katex } from '@mdit/plugin-katex'

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(katex)
    }
  }
})
```

KaTeX 不内联样式，必须额外引入样式表，否则公式排版会错乱：

```typescript
// docs/.vitepress/theme/index.ts
import 'katex/dist/katex.min.css'
```

修复后产物中确认渲染结果：

```bash
$ grep -c 'class="katex"' dist/article.html
12
```

## 经验小结

- **异步插件不能用在同步渲染链上**，且失败方式是静默丢弃而非报错。
- 判断渲染器是否支持异步，最快的办法是检查 `typeof md.renderAsync`。
- `peerDependencies` 声明不等于可用组合，必要时用最小脚本独立验证。
- 验收静态站点不能只看构建退出码，**必须断言产物内容**。
- 同类隐性故障还有一例：全文搜索在中文下失效，也是构建通过但功能不可用。

## 更新日志

| 日期 | 说明 |
| --- | --- |
| 2026-10-07 | 初稿：现象、隔离定位、根因与修复 |
