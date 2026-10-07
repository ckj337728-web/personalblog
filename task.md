# 个人技术博客 & 知识库系统 — 可执行任务清单（task.md）

> 依据：`个人技术博客 & 知识库系统 Vibe Coding Spec.md.md`（下称 spec）
> 本清单只覆盖 spec 中明确要求的内容，不新增功能、不做无关重构。
> 状态标记：`[ ]` 未完成 / `[×]` 已完成。每个任务的完成标准均可机械校验。

---

## 0. 当前项目基线

### 0.0 执行进度

| 阶段 | 状态 | 完成时间 |
| --- | --- | --- |
| 阶段一 基础准备（T1.1–T1.7） | ✅ 已完成 | 提交 `d192e04` |
| 阶段二 目录骨架（T2.1–T2.8） | ✅ 已完成 | 16 个内容目录 + 19 个页面全部可访问 |
| 阶段三 核心配置（T3.1–T3.8） | ⬜ 未开始 | — |
| 阶段四 导航/侧边栏/首页（T4.1–T4.7） | ⬜ 未开始 | — |
| 阶段五 示例文章（T5.1–T5.6） | ⬜ 未开始 | — |
| 阶段六 UI 与交互（T6.1–T6.5） | ⬜ 未开始 | — |
| 阶段七 CI/CD 与部署（T7.1–T7.6） | ⬜ 未开始 | — |
| 阶段八 测试验收（T8.1–T8.8） | ⬜ 未开始 | — |

### 0.1 初始基线（搭建前）

| 项 | 现状 |
| --- | --- |
| 工作目录 | `C:\Users\86155\Downloads\ckj_blog` |
| 已有文件 | 仅 `个人技术博客 & 知识库系统 Vibe Coding Spec.md.md` |
| `docs/` 目录 | 不存在 |
| `package.json` | 不存在（非既有项目，需从零搭建） |
| Git 仓库 | 未初始化 |
| Node / npm | v24.14.1 / 11.11.0（满足 VitePress 要求） |
| pnpm | 未安装 → 统一使用 **npm**，不引入额外包管理器 |

### 0.2 阶段一完成后的实际状态

| 项 | 结果 |
| --- | --- |
| Git 仓库 | 已初始化，默认分支 `main`，首次提交 `d192e04`，工作区干净 |
| 已安装依赖 | `vitepress@1.6.4`、`vitepress-plugin-mermaid@2.0.17`、`mermaid@11.17.2`、`markdown-it-mathjax3@4.3.2`（共 281 packages） |
| 配置文件 | `docs/.vitepress/config.ts`（站点元信息；其余配置留待阶段三） |
| 首页 | `docs/index.md`（占位，完整首页留待 T4.6） |
| 验证结果 | `docs:dev` HTTP 200；`docs:build` 退出码 0（2.75s）；`docs:preview` HTTP 200 |

### 0.1 技术决策与版本锁定（spec 第 2 节约束下的落地口径）

1. **框架**：VitePress `1.6.4`（当前 latest 稳定版），不使用 2.0.0-alpha。
2. **包管理器**：npm（本机无 pnpm）；生成并提交 `package-lock.json`。
3. **Mermaid（spec 2 节要求）**：VitePress 原生不支持，需加 `vitepress-plugin-mermaid@2.0.17`（其 peer 要求 `mermaid: 10 || 11`）→ 必须锁 **mermaid 11.x**（最新 11.17.2），**不得装 mermaid 12**。
4. **LaTeX（spec 2 节要求）**：使用 `markdown-it-mathjax3` 通过 `markdown.config` 接入。**注意版本**：`vitepress@1.6.4` 的 `peerOptional` 声明为 `markdown-it-mathjax3@^4`，装 5.x 会触发 npm `ERESOLVE` 冲突 → 必须用 **4.x（4.3.2）**。
5. **搜索（spec 4.2 要求）**：`themeConfig.search.provider: 'local'` + 中文 UI 文案，纯静态、无第三方服务。
6. **页脚（spec 4.2 要求）**：VitePress 默认主题的 `themeConfig.footer` **在侧边栏可见时不渲染**，无法满足"文章页底部有版权/更新时间" → 必须用 `layout-bottom` 插槽自定义，这是需求必需，不算额外功能。
7. **Git 最后提交时间（spec 4.2 要求）**：由 `lastUpdated: true` 提供，依赖 git 提交历史，故 CI 必须 `fetch-depth: 0`。
8. **无后端**：仅 `docs/public/` 静态资源，不引入数据库、不做 SSR 服务。

### 0.3 阶段二完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 内容目录 | `docs/knowledge/`（7 个一级分类 + 7 个子分类）、`docs/blog/`、`docs/projects/`，共 16 个内容目录 |
| 页面文件 | `docs/index.md`、`docs/about.md` + 16 个目录 `index.md` = 18 个 Markdown |
| 静态资源目录 | `docs/public/images/`（含 `.gitkeep`） |
| 验证结果 | `docs:build` 退出码 0、无 dead link；14 个关键页面产出；`docs:preview` 下 19 个 URL 全部 HTTP 200 且含 `<h1>` |
| 目录命名 | 全部无空格、无 `&`、无 `/`；7 个一级分类均带 `01-`～`07-` 数字前缀 |
| 命名与 spec 差异 | 仅 2 处规范化：`02-Linux 运维 & 底层` → `02-Linux运维与底层`、`03-C/C++ 编程笔记` → `03-C与C++编程笔记`（去空格与路径分隔符，保留原语义，URL 编码已实测安全） |

---

## 阶段一：基础准备（工程初始化）

- [×] **T1.1 初始化 Git 仓库**
  - 在 `C:\Users\86155\Downloads\ckj_blog` 执行 `git init`，默认分支设为 `main`。
  - 完成标准：`git rev-parse --is-inside-work-tree` 输出 `true`；`git branch --show-current` 输出 `main`。
  - 执行记录：`git init -b main` 成功；全局身份已配置（`ckj337728-web` / `ckj337728@gmail.com`）。

- [×] **T1.2 创建 `.gitignore`**
  - 忽略 `node_modules/`、`docs/.vitepress/dist/`、`docs/.vitepress/cache/`、`.DS_Store`、`*.log`、编辑器目录（`.vscode/`、`.idea/` 视需要）。
  - 完成标准：文件存在；`git status` 中不出现 `node_modules`。
  - 执行记录：另加 `/.vitepress/cache/`（根级兜底）与 `.env*`；`git check-ignore` 验证 `docs/.vitepress/dist/index.html` 与 `node_modules` 均被忽略。

- [×] **T1.3 创建根 `package.json`**
  - `name`: `ckj-blog`；`private: true`；`type`: `module`。
  - scripts：`docs:dev` = `vitepress dev docs`、`docs:build` = `vitepress build docs`、`docs:preview` = `vitepress preview docs`（spec 6.1：文档在 `docs/`）。
  - 完成标准：`package.json` 存在且三个 script 可被 `npm run` 列出（`npm run` 输出含三者）。
  - 执行记录：附加 `version: 0.0.0` 与 `description`；`npm run` 已列出三个脚本。

- [×] **T1.4 安装并锁定依赖**
  - devDependencies：`vitepress@1.6.4`、`vitepress-plugin-mermaid@2.0.17`、`mermaid@^11.17.2`、`markdown-it-mathjax3@^4.3.2`。
  - 完成标准：`node_modules` 与 `package-lock.json` 生成；`vitepress` 版本为 `1.6.4`；`npm ls mermaid` 显示主版本为 11（非 12）。
  - 执行记录：实际安装 `vitepress@1.6.4 / vitepress-plugin-mermaid@2.0.17 / mermaid@11.17.2 / markdown-it-mathjax3@4.3.2`，验证通过。
  - 注意：`npx vitepress --version` 在该版本会**直接拉起 dev server**（不会只打印版本号），校验版本请改用 `node_modules/vitepress/package.json` 的 `version` 字段或 `npm ls`。

- [×] **T1.5 验证可启动的空站点**
  - 创建最小 `docs/index.md` 与 `docs/.vitepress/config.ts`，运行 `npm run docs:dev`，确认本地服务可访问并返回 200。
  - 完成标准：命令输出本地 URL，页面能正常打开且无报错。
  - 执行记录：`http://localhost:5173/` 返回 HTTP 200；dev 模式为 SPA 外壳（无 SSR），故正文校验改由 T1.6 的生产构建产物承担。
  - 注意：必须在仓库根运行脚本；若在根目录误跑 `vitepress dev`，会生成根级 `.vitepress/cache/` 临时目录（已在 `.gitignore` 中加 `/.vitepress/cache/` 兜底）。

- [×] **T1.6 验证生产构建通过**
  - 执行 `npm run docs:build`，并 `npm run docs:preview` 冒烟验证。
  - 完成标准：构建退出码 0，`docs/.vitepress/dist/index.html` 存在。
  - 执行记录：`docs:build` 退出码 0（2.75s）；`docs/.vitepress/dist/index.html` 存在（6861 字节），SSR 产物中命中站点标题、首页正文、`lang="zh-CN"`；`docs:preview` 于 `http://localhost:4173/` 返回 HTTP 200。

- [×] **T1.7 首次提交作为 lastUpdated 基线**
  - 提交现有文件，使 git 有提交历史（否则"Git 最后提交时间"与 `lastUpdated` 无数据可显示）。
  - 完成标准：`git log --oneline` 至少 1 条记录。
  - 执行记录：根提交 `d192e04`「chore: 初始化 VitePress 项目骨架与依赖」，7 files changed；提交后 `git status --short` 为空。

---

## 阶段二：目录骨架与工程化规范（spec 3.2 / 6.1）

- [×] **T2.1 建立 `docs/` 根文件骨架**
  - `docs/index.md`（首页）、`docs/about.md`（关于我）。
  - 完成标准：两文件存在。
  - 执行记录：`docs/index.md` 已存在（T1.5 创建，本次补充了 4 个栏目入口占位链接）；`docs/about.md` 新建。完整内容分别留待 T4.6 与 T4.x。

- [×] **T2.2 建立顶部导航的三大内容目录**
  - 目录：`docs/knowledge/`（知识库）、`docs/blog/`（技术博客）、`docs/projects/`（项目实践）。
  - 每个目录下建 `index.md` 作为该栏目的落地页（VitePress 会把 `index.md` 映射为目录根 URL）。
  - 完成标准：3 个目录 + 3 个 `index.md` 存在。
  - 执行记录：3 目录 3 文件已建；实测 `/knowledge/`、`/blog/`、`/projects/` 均返回 HTTP 200。

- [×] **T2.3 建立知识库 7 个一级分类目录（spec 3.2 固定命名）**
  - `docs/knowledge/01-计算机基础/`
  - `docs/knowledge/02-Linux运维与底层/`（对应 spec「02-Linux 运维 & 底层」；目录名不含空格与 `&`，避免 URL/路径问题）
  - `docs/knowledge/03-C与C++编程笔记/`
  - `docs/knowledge/04-前端工程化/`
  - `docs/knowledge/05-AI与LLM学习/`
  - `docs/knowledge/06-开源项目研读/`
  - `docs/knowledge/07-工具教程与踩坑记录/`
  - 完成标准：7 个目录存在，名称带 `01-`～`07-` 数字前缀且可排序。
  - 执行记录：7 个目录 + 7 个 `index.md` 已建；数字前缀检查 7/7 通过。

- [×] **T2.4 建立 01 的三个子分类目录**
  - `docs/knowledge/01-计算机基础/计算机网络/`、`操作系统/`、`数据结构与算法/`。
  - 完成标准：3 个子目录存在。
  - 执行记录：3 个子目录 + 3 个 `index.md` 已建，实测 URL 均 200。

- [×] **T2.5 建立 05 的四个子分类目录**
  - `docs/knowledge/05-AI与LLM学习/大模型基础/`、`Agent智能体/`、`Harness与沙箱与评测体系/`、`Prompt工程/`。
  - 完成标准：4 个子目录存在。
  - 执行记录：4 个子目录 + 4 个 `index.md` 已建，实测 URL 均 200。

- [×] **T2.6 为每个目录补 `index.md` 占位页**
  - 每个分类（含子分类）目录下建 `index.md`，一级标题与目录名一致，暂不加正文。
  - 完成标准：逐个数出"内容目录"后，每个内容目录内均有 `index.md`；侧边栏链接点开无 404。
  - 执行记录：16 个内容目录全部具备 `index.md`，一级标题与目录名逐一一致；`docs/public/` 与 `docs/public/images/` 属 VitePress 静态资源目录、不参与页面路由，按设计无需 `index.md`。
  - 验证方式：`docs:build` 通过（VitePress 默认 dead link 检查为开，`ignoreDeadLinks` 未放宽）；`docs:preview` 下 19 个 URL 全部 HTTP 200 且含 `<h1>`。
  - 修订：初版目录页链接写作 `./子目录/` 相对形式，构建后被原样输出为相对 href，改为站内绝对路径（`/knowledge/...`）以消除相对解析歧义。

- [×] **T2.7 建立图片统一目录（spec 6.1）**
  - `docs/public/images/`，并放一个 `.gitkeep` 以便占位（替代品：README 说明亦可）。
  - 完成标准：目录存在且已被 git 跟踪；构建后 `images/` 出现在 dist 根。
  - 执行记录：`docs/public/images/.gitkeep` 已建；构建产物 dist 根目录中出现 `images/`。

- [×] **T2.8 目录命名规范自检**
  - 逐目录核对：全部使用数字前缀、无中文空格、无英文分类名残留。
  - 完成标准：输出一次目录树（`docs/` 两层内）并确认与 spec 3.2 清单逐条一致。
  - 执行记录：目录树已输出并逐条比对 spec 3.2 —— 01（含 3 子类）、02、03、04、05（含 4 子类）、06、07 全部齐备、无缺失无多余；正则检查 `[ &/]` 结果为空，即所有目录名不含空格、`&`、`/`。

---

## 阶段三：VitePress 核心配置（spec 2 / 4 / 6）

- [ ] **T3.1 站点基础元信息**
  - `lang: 'zh-CN'`、`title`、`description`、`base`（默认 `'/'`，若部署到 `用户名.github.io/仓库名/` 则改为 `'/仓库名/'`）、`head` 中 favicon。
  - 完成标准：`docs/.vitepress/config.mts` 含上述字段且构建无警告。

- [ ] **T3.2 开启全文搜索（spec 4.2 核心必备）**
  - `themeConfig.search = { provider: 'local', options: { locales: { root: { translations: {...中文文案...} } } } }`。
  - 完成标准：构建后页面顶部出现搜索框；输入任一示例文章关键词能命中结果。

- [ ] **T3.3 开启亮色/暗色模式（spec 4.1）**
  - `appearance: true`（默认即开启，显式声明以便后续维护）。
  - 完成标准：页面右上角出现主题切换按钮，切换后 `<html>` 上的 `dark` class 随之变化。

- [ ] **T3.4 配置 Markdown 能力（spec 2）**
  - `markdown.lineNumbers: true`（代码行号）。
  - `markdown.config` 注入 `markdown-it-mathjax3`（LaTeX 公式）。
  - `markdown.container` 中文标签（tip/warning/danger/info/details）。
  - 完成标准：示例文章中公式渲染为数学排版、代码块左侧出现行号。

- [ ] **T3.5 接入 Mermaid（spec 2）**
  - 建 `docs/.vitepress/theme/index.ts`，`extends: DefaultTheme` 并使用 `withMermaid()` 包装。
  - 完成标准：示例文章中的 ` ```mermaid ` 代码块渲染为流程图而非纯文本。

- [ ] **T3.6 开启 Git 最后更新时间（spec 4.2）**
  - 站点级 `lastUpdated: true`，并在页脚/页面呈现。
  - 完成标准：文章页出现"最后更新于 …"时间，且时间随该文件最新提交变化。

- [ ] **T3.7 明确"无重依赖/无特效"约束（spec 4.3）**
  - 自查配置与主题中不存在动画库、轮播、弹窗、推荐位、统计脚本（除 favicon/字体等必要 head 项）。
  - 完成标准：`package.json` dependencies 仅含上述 4 个包；`docs/.vitepress/theme/` 无额外第三方组件引入。

- [ ] **T3.8 配置说明落档**
  - 在 `docs/.vitepress/config.mts` 关键段落写简短中文注释（如为何 `layout-bottom`、为何锁 mermaid 11）。
  - 完成标准：注释存在且解释与实现一致。

---

## 阶段四：导航 / 侧边栏 / 首页（spec 3 / 7）

- [ ] **T4.1 顶部导航栏 5 项（spec 3.1）**
  - 依次为：首页 `/`、知识库 `/knowledge/`、技术博客 `/blog/`、项目实践 `/projects/`、关于我 `/about`。
  - 完成标准：导航项文本与顺序与 spec 3.1 完全一致，且每项均可跳转、无 404。

- [ ] **T4.2 知识库侧边栏 = 7 大分类骨架（spec 3.2）**
  - 用 `themeConfig.sidebar['/knowledge/']` 显式声明，`text` 与目录中文名一致，子分类做二级嵌套；顺序严格 `01→07`。
  - 完成标准：进入 `/knowledge/` 任意页面，左侧栏按 01～07 顺序展示，01 与 05 下能展开子分类。

- [ ] **T4.3 侧边栏折叠/展开（spec 4.2）**
  - 确认分组可折叠、当前文章所在分组默认展开。
  - 完成标准：点击分组标题可折叠/展开，刷新后当前页所在分组为展开态。

- [ ] **T4.4 博客与项目实践侧边栏**
  - `sidebar['/blog/']`、`sidebar['/projects/']` 指向各自 `index.md` 及后续文章；文章列表按日期倒序维护。
  - 完成标准：两个栏目页面均有可用侧边栏，点击进入对应示例文章。

- [ ] **T4.5 文章页右侧大纲导航（spec 4.2）**
  - 保持默认 `aside` 开启（`outline` 深度至少到 3 级，与 spec 5"层级严格"匹配）。
  - 完成标准：示例文章右侧显示 h2/h3 大纲，滚动时高亮跟随。

- [ ] **T4.6 首页极简文案（spec 7）**
  - 仅四块内容：个人简介（工程师、持续学习、技术沉淀）、站点定位（终身知识库 & 技术博客）、快速入口（知识库/博客/项目）、最近更新文章列表（手工维护的 Markdown 链接列表即可，不引入自动生成逻辑）。
  - 完成标准：首页不出现轮播、卡片特效、横幅动画；四项内容齐全且入口链接可点。

- [ ] **T4.7 首页文案自查（spec 7 / 4.3）**
  - 核对无广告模块、无推荐模块、无弹窗。
  - 完成标准：逐条对照 spec 4.3 三条禁令，均未命中。

---

## 阶段五：示例文章与书写模板（spec 5 / 9）

- [ ] **T5.1 定义文章书写规范文档**
  - 新建 `docs/CONTRIBUTING.md` 或在 README 中成节，写明：必填 frontmatter（`title` / `date` / `tags` / `category`）、标题层级规则、代码块必须带语言标识、文末必须有「更新日志」模块。
  - 完成标准：四条规则逐条成文，可被后续写作直接照抄。

- [ ] **T5.2 示例文章 1（知识库类）**
  - 位置：`docs/knowledge/01-计算机基础/计算机网络/` 下，内容为计算机网络主题。
  - 含完整 frontmatter、三级标题层级、带语言标识的代码块、Mermaid 图、文末「更新日志」。
  - 完成标准：页面可访问，公式/图表/行号/复制按钮均正常；frontmatter 四项齐全。

- [ ] **T5.3 示例文章 2（知识库类，LaTeX 公式）**
  - 位置：`docs/knowledge/05-AI与LLM学习/大模型基础/` 下，含至少一处 `$...$` 或 `$$...$$` 公式。
  - 完成标准：公式渲染为排版数学（非源码字面量）。

- [ ] **T5.4 示例文章 3（技术博客/踩坑类）**
  - 位置：`docs/blog/` 下，含踩坑记录与带行号代码块。
  - 完成标准：页面可访问；`/blog/` 索引中能跳转到该文。

- [ ] **T5.5 每篇文章插入图片引用示例（spec 6.1）**
  - 图片放入 `docs/public/images/`，正文以 `/images/xxx.png` 引用。
  - 完成标准：至少 1 篇文章含可正常显示的图片，且引用路径为 `docs/public/images/`。

- [ ] **T5.6 文章规范巡检**
  - 逐篇检查：frontmatter 四项齐全、无跳级标题、无无语言标识代码块、文末有「更新日志」。
  - 完成标准：3 篇示例文章全部通过，形成一份结论记录。

---

## 阶段六：UI 视觉与交互核对（spec 4）

- [ ] **T6.1 代码块高亮 / 一键复制 / 行号（spec 4.2）**
  - 完成标准：文章页代码块有语法高亮、右上角复制按钮可复制成功、左侧显示行号。

- [ ] **T6.2 极简黑白灰风格微调（spec 4.1）**
  - 仅通过 `docs/.vitepress/theme/custom.css` 调整：配色克制、正文字体无衬线、代码等宽字体、留白加大。
  - 完成标准：亮/暗两套模式下均无彩色装饰块；改动集中在单个 CSS 文件，未改动默认主题结构。

- [ ] **T6.3 页脚：版权 + 更新时间 + Git 最后提交时间（spec 4.2）**
  - 用 `layout-bottom` 插槽渲染页脚，显示版权信息、站点更新时间、以及基于 git 的最后提交时间；确保在**有侧边栏的文章页也可见**。
  - 完成标准：任取一篇带侧边栏的文章页，页脚三项信息均出现且时间非空。

- [ ] **T6.4 响应式适配手机 / PC（spec 4.2）**
  - 在窄屏（≤768px）与桌面宽度下各验证一次：导航、侧边栏抽屉、正文、代码块、大纲。
  - 完成标准：窄屏无横向滚动条，侧边栏可开合，正文不溢出。

- [ ] **T6.5 无特效自查（spec 4.3）**
  - 完成标准：无粒子背景、无横幅动画、无轮播、无花哨卡片、无弹窗/推荐模块。

---

## 阶段七：CI/CD 与部署（spec 6.2 / 9）

- [ ] **T7.1 编写 GitHub Actions 部署工作流（spec 6.2）**
  - 新建 `.github/workflows/deploy.yml`：`on: push`（`main` 分支）+ `workflow_dispatch`；Node 24；`npm ci` → `npm run docs:build` → 上传 `docs/.vitepress/dist` 产物 → 部署到 GitHub Pages（`actions/deploy-pages`，需 `pages: write`、`id-token: write`）。
  - 完成标准：YAML 语法有效（`npx --yes yaml-lint` 或 `actionlint` 任一校验通过），步骤顺序完整。

- [ ] **T7.2 保证 Git 历史完整（lastUpdated 前提）**
  - `actions/checkout` 必须设置 `fetch-depth: 0`。
  - 完成标准：工作流文件中 `fetch-depth: 0` 存在。

- [ ] **T7.3 保证 `base` 与部署路径一致**
  - 若部署到项目页（`https://<user>.github.io/<repo>/`），`config.mts` 的 `base` 必须为 `'/<repo>/'`；若为用户页或 Vercel 自定义域，则为 `'/'`。
  - 完成标准：部署后首页静态资源（CSS/JS/图片/搜索索引）全部 200，无 404。

- [ ] **T7.4 更新时间自动化核对（spec 6.2）**
  - 确认"每次更新自动生成更新时间"由 push 触发的构建 + `lastUpdated` 实现，无需额外脚本。
  - 完成标准：一次新提交推送后，Pages 产物中该文章的最后更新时间发生更新。

- [ ] **T7.5 可迁移性核对（spec 6.3）**
  - 全站纯静态：无数据库、无后端接口、无运行时环境变量依赖。
  - 完成标准：`docs/.vitepress/dist/` 可直接被任意静态服务器托管并正常访问（含搜索）。

- [ ] **T7.6 编写 README 项目说明（spec 9 / 8.5）**
  - 包含：项目简介与定位、目录结构说明、本地启动方式（安装/开发/构建/预览命令）、部署方式（GitHub Pages 步骤 + base 注意事项 + Vercel 备选）、文章书写规范入口（指向 T5.1 文档）。
  - 完成标准：README 三项（启动/部署/使用文档）齐备，命令逐条实测可执行。

---

## 阶段八：测试与验收（spec 9 交付物核对）

- [ ] **T8.1 开发模式功能验收**
  - `npm run docs:dev` 后逐项验证：5 个导航、侧边栏折叠、右侧大纲、全文搜索、暗色切换、代码复制/行号、Mermaid、LaTeX、页脚三项、示例文章可打开。
  - 完成标准：形成一份逐项通过/失败清单，失败项全部修复后复测通过。

- [ ] **T8.2 生产构建与预览验收**
  - `npm run docs:build` 退出码 0；`npm run docs:preview` 下重复 T8.1 全部检查。
  - 完成标准：构建无 dead link 报错；预览环境功能与开发模式一致。

- [ ] **T8.3 断链与资源核对**
  - 校验全站内部链接（`ignoreDeadLinks` 保持默认 `false`，即不允许死链）与图片路径。
  - 完成标准：构建期无死链警告；页面无 404 图片。

- [ ] **T8.4 内容规范最终巡检（spec 5 / 9）**
  - 3 篇示例文章全部符合 frontmatter / 层级 / 语言标识 / 更新日志四项要求。
  - 完成标准：清单逐篇打勾，无例外。

- [ ] **T8.5 目录结构最终核对（spec 3.2 / 6.1）**
  - 输出 `docs/` 完整目录树，与 spec 3.2 的 7 大分类 + 子分类逐条比对。
  - 完成标准：无缺失目录、无多余目录、命名前缀正确、图片统一在 `docs/public/images/`。

- [ ] **T8.6 交付物清单核对（spec 9）**
  - 逐项确认：完整 VitePress 骨架 ✅ / 完整分类目录结构 ✅ / 本地启动命令 ✅ / GitHub Pages 部署配置 ✅ / 示例文章 2–3 篇 ✅ / README ✅。
  - 完成标准：6 项交付物全部存在且可用；缺失项补做后再验收。

- [ ] **T8.7 禁用项最终自查（spec 2 / 4.3）**
  - 确认未使用 Hexo / Hugo / 繁杂主题 / 动态 heavy 框架；无广告、无弹窗、无推荐、无特效。
  - 完成标准：`package.json` 依赖与主题文件逐条对照通过。

- [ ] **T8.8 收尾提交**
  - 提交全部成果并推送到远端，确认 Actions 运行成功、Pages 可访问。
  - 完成标准：Actions 最近一次运行状态为成功；线上首页与一篇示例文章可正常打开。

---

## 附：完成标准速查

| spec 要求 | 对应任务 |
| --- | --- |
| VitePress 框架、纯 Markdown | T1.3 / T1.4 |
| 代码高亮、行号、复制 | T3.4 / T6.1 |
| Mermaid 流程图 | T3.5 / T5.2 |
| LaTeX 公式 | T3.4 / T5.3 |
| 顶部导航 5 项 | T4.1 |
| 知识库 7 大分类固定结构 | T2.3–T2.6 / T4.2 / T8.5 |
| 亮色/暗色切换 | T3.3 |
| 全文搜索 | T3.2 |
| 侧边栏折叠、右侧大纲 | T4.3 / T4.5 |
| 页脚版权/更新时间/Git 提交时间 | T3.6 / T6.3 |
| 响应式适配 | T6.4 |
| 禁止特效/弹窗/推荐 | T3.7 / T4.7 / T6.5 / T8.7 |
| frontmatter、层级、语言标识、更新日志 | T5.1 / T5.6 / T8.4 |
| `docs/` + `docs/public/images/` + 数字前缀 | T2.1–T2.8 |
| GitHub Action 自动部署与更新时间 | T7.1–T7.4 |
| 纯静态可迁移 | T7.5 |
| 首页极简文案四点 | T4.6 |
| 一次性完整骨架、启动/部署/使用文档 | T8.6 / T7.6 |

### 执行顺序依赖（简版）

```
T1.1 → T1.2 → T1.3 → T1.4 → T1.5 → T1.6 → T1.7
                                   ↓
T2.1 → T2.2 → T2.3 → T2.4 → T2.5 → T2.6 → T2.7 → T2.8
                                   ↓
T3.1 → T3.2 → T3.3 → T3.4 → T3.5 → T3.6 → T3.7 → T3.8
                                   ↓
T4.1 → T4.2 → T4.3 → T4.4 → T4.5 → T4.6 → T4.7
                                   ↓
T5.1 → T5.2 → T5.3 → T5.4 → T5.5 → T5.6
                                   ↓
T6.1 → T6.2 → T6.3 → T6.4 → T6.5
                                   ↓
T7.1 → T7.2 → T7.3 → T7.4 → T7.5 → T7.6
                                   ↓
T8.1 → T8.2 → T8.3 → T8.4 → T8.5 → T8.6 → T8.7 → T8.8
```
