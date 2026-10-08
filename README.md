# 个人技术博客 & 知识库

工程师个人技术博客与永久知识库二合一静态站点。用纯 Markdown 驱动、纯静态托管，无数据库、无后端依赖。

**站点定位**：不是自媒体博客，而是工程师的终身学习资产、求职作品集与技术沉淀站。结构像教科书一样规整，只增不改。

## 技术栈

| 项 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | [VitePress](https://vitepress.dev/) 1.6.4 | 静态站点生成，纯 Markdown 驱动 |
| 内容 | Markdown + YAML frontmatter | 见[文章书写规范](docs/CONTRIBUTING.md) |
| 公式 | KaTeX（`@mdit/plugin-katex`） | 同步插件，**不可替换为 `markdown-it-mathjax3@4`**（详见下方注意事项） |
| 流程图 | Mermaid 11（`vitepress-plugin-mermaid`） | 主题 `neutral`，低饱和配色 |
| 搜索 | VitePress 本地搜索（MiniSearch） | 纯静态索引，无第三方服务 |
| 部署 | GitHub Actions → GitHub Pages | push 自动构建部署 |
| 包管理 | npm | Node 24 / npm 11 |

依赖刻意保持最小（5 个直接依赖），不引入 UI 库、动画库、统计脚本。

## 目录结构

```
.
├─ docs/                          # 所有文档（VitePress 根目录）
│  ├─ index.md                    # 首页：简介 / 定位 / 快速入口 / 最近更新
│  ├─ about.md                    # 关于我
│  ├─ CONTRIBUTING.md             # 文章书写规范
│  ├─ blog/                       # 技术博客（随笔与踩坑）
│  ├─ projects/                   # 项目实践
│  ├─ knowledge/                  # 知识库（核心）
│  │  ├─ 01-计算机基础/            #   计算机网络 / 操作系统 / 数据结构与算法
│  │  ├─ 02-Linux运维与底层/
│  │  ├─ 03-C与C++编程笔记/
│  │  ├─ 04-前端工程化/
│  │  ├─ 05-AI与LLM学习/           #   大模型基础 / Agent智能体 / Harness与沙箱与评测体系 / Prompt工程
│  │  ├─ 06-开源项目研读/
│  │  └─ 07-工具教程与踩坑记录/
│  ├─ public/                     # 静态资源（原样复制到站点根）
│  │  ├─ favicon.svg
│  │  └─ images/                  # 全站图片统一放这里
│  └─ .vitepress/
│     ├─ config.ts                # 站点配置（导航 / 侧边栏 / 搜索 / Markdown / Mermaid）
│     └─ theme/                   # 主题扩展
│        ├─ index.ts              #   入口：默认主题 + Mermaid + 自定义样式
│        ├─ Layout.vue            #   layout-bottom 插槽注入页脚
│        ├─ SiteFooter.vue        #   全站页脚（版权 / Git 最后提交时间）
│        └─ custom.css            #   极简黑白灰微调
├─ .github/workflows/deploy.yml   # GitHub Pages 自动部署
└─ task.md                        # 实施任务清单（含各阶段执行记录）
```

**目录命名规范**：知识库分类统一使用 `01-xxx` 数字前缀，顺序永久固定，便于长期递增而不打乱结构。

## 本地启动

前置：Node.js 24+。

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器（默认 http://localhost:5173/）
npm run docs:dev

# 3. 生产构建，产物输出到 docs/.vitepress/dist
npm run docs:build

# 4. 本地预览构建产物（默认 http://localhost:4173/）
npm run docs:preview
```

> **注意**：`docs:build` 之后如需用 `docs:preview` 验证，必须**重启**预览进程。VitePress 预览进程会缓存构建时的资源清单，重新构建会更换资源哈希，旧进程会返回 404，导致页面样式与脚本全部失效。

## 部署方式

### GitHub Pages（已配置，推荐）

工作流文件：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)

**首次启用**（只需在 GitHub 上操作一次）：

1. 推送代码到 GitHub 仓库的 `main` 分支。
2. 进入仓库 `Settings` → `Pages` → `Build and deployment`。
3. 将 `Source` 设为 **GitHub Actions**（不要选 "Deploy from a branch"）。

之后每次 push 到 `main`，或手动触发 workflow，都会自动构建并部署。

**关于 `base` 路径（最容易出错的地方）**

站点部署在子路径时，`base` 必须与之一致，否则 CSS、JS、图片、搜索索引全部 404。

本项目已让 `base` 由环境变量驱动，因此**无需改代码**：

| 部署场景 | 访问地址 | `base` 取值 |
| --- | --- | --- |
| 项目页（默认） | `https://<user>.github.io/<repo>/` | `/<repo>/` |
| 用户页 | `https://<user>.github.io/` | `/` |
| 自定义域名 / Vercel | `https://example.com/` | `/` |

- 工作流会按仓库名自动推导：仓库名形如 `<user>.github.io` 判为用户页（`/`），否则为项目页（`/<repo>/`）。
- 本地 `npm run docs:dev` 与 `docs:build` 不带该变量，固定使用 `/`，因此本地预览不需要输入子路径。
- **使用自定义域名时**，需在 `deploy.yml` 的 `Build site` 步骤手动把 `VITEPRESS_BASE` 改为 `'/'`。

### 其他静态托管（Vercel / Netlify / 任意静态服务器）

本项目是纯静态产物，无任何运行期依赖，可直接托管 `docs/.vitepress/dist`：

- **构建命令**：`npm run docs:build`
- **输出目录**：`docs/.vitepress/dist`
- **Node 版本**：24
- 部署在根路径时无需设置 `VITEPRESS_BASE`。

也可完全不依赖平台构建，本地构建后把 `docs/.vitepress/dist` 目录整体上传即可。

## 写文章

完整规范见 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)，要点：

1. **frontmatter 四项必填**：`title` / `date` / `tags` / `category`。
2. **标题层级不跳级**：`#` → `##` → `###`，一篇只有一个一级标题。
3. **代码块必须带语言标识**（如 ` ```python `），行号已全站开启。
4. **文末必须有「更新日志」** 小节（表格形式）。
5. **图片**放 `docs/public/images/`，以 `/images/xxx.png` 引用。

新增文章后，需在 `docs/.vitepress/config.ts` 的对应 `sidebar` 分组中登记条目，否则侧边栏无法进入。

## 注意事项（踩坑记录）

以下问题均为实际遇到并已修复，改动前请先读：

1. **公式插件不可换回 `markdown-it-mathjax3`**：该插件是异步插件，而 VitePress 1.6.4 的渲染链是同步的（不依赖 `markdown-it-async`）。异步插件的 Promise 不会被 await，**公式会被静默丢弃且构建仍报成功**。必须使用同步插件 `@mdit/plugin-katex`。
2. **中文搜索需要自定义分词**：MiniSearch 默认按空白/标点切词，中文无空格会使「三次握手」成为单个 token，查询「握手」命中 0 条。已在 `config.ts` 中配置 CJK 字符级分词 + `combineWith: 'AND'`，**不要删除该配置**。
3. **页脚必须走 `layout-bottom` 插槽**：默认主题的 `themeConfig.footer` 在侧边栏可见时**不渲染**，文章页底部会完全看不到版权与时间信息。默认页脚已由 `custom.css` 隐藏，改样式时注意保留。
4. **`themeConfig.footer` 仅为数据源**：它被 `SiteFooter.vue` 读取，删除会导致页脚文案丢失。
5. **CI 必须 `fetch-depth: 0`**：Git 最后提交时间依赖完整提交历史，浅克隆会让全站时间退化为同一个值。
6. **VitePress 1.6.4 无 zh-CN 内置语言包**：`lang: 'zh-CN'` 不会自动切换界面文案，`config.ts` 中已逐项覆盖为中文（本页目录 / 上一篇 / 下一篇 / 目录 / 外观 / 回到顶部 / 跳到正文）。唯一无法配置的是导航栏屏幕阅读器标签 `Main Navigation`（组件内硬编码），不影响可见文案。

## 其他文档

- [如何测试（新手操作手册）](如何测试.md)

## 更新日志

| 日期 | 说明 |
| --- | --- |
| 2026-10-07 | 初始化项目：VitePress 骨架、知识库分类目录、站点配置、示例文章、UI 与页脚、部署工作流 |
