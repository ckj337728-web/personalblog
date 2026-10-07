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
| 阶段二 目录骨架（T2.1–T2.8） | ✅ 已完成 | 提交 `fe5a3a9` |
| 阶段三 核心配置（T3.1–T3.8） | ✅ 已完成 | 提交 `6720c01`；搜索/Mermaid/公式均实测通过 |
| 阶段四 导航/侧边栏/首页（T4.1–T4.7） | ✅ 已完成 | 导航 5 项、侧边栏 29 条目、19 个页面 200 |
| 阶段五 示例文章（T5.1–T5.6） | ✅ 已完成 | 3 篇文章规范巡检 3/3 PASS |
| 阶段六 UI 与交互（T6.1–T6.5） | ✅ 已完成 | 真实浏览器验证 23/23 PASS；修复窄屏溢出 |
| 阶段七 CI/CD 与部署（T7.1–T7.6） | ✅ 已完成 | 工作流结构校验通过；双 base 场景各 1108 项资源引用校验通过 |
| 阶段八 测试验收（T8.1–T8.8） | ✅ 全部完成 | dev 22/22 + preview 22/22 + 终检 10/10；线上 22/22，Actions 运行成功 |

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

### 0.4 阶段三完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 配置文件 | `docs/.vitepress/config.ts`（站点元信息 + 搜索 + 亮暗模式 + Markdown 能力 + Mermaid + lastUpdated） |
| 主题入口 | `docs/.vitepress/theme/index.ts`：`extends: DefaultTheme` + `withMermaid` + `katex.min.css` |
| 依赖 | 5 个直接依赖：`vitepress`、`vitepress-plugin-mermaid`、`mermaid`、`@mdit/plugin-katex`、`katex` |
| 构建耗时 | 约 22–33s（接入 Mermaid 后由 2.75s 上升，属预期） |
| 验证结果 | 构建退出码 0；行号/高亮/复制/容器中文标签/KaTeX 公式/Mermaid 图/lastUpdated 全部实测通过 |

**阶段三发现并修复的两个隐性故障（构建均报成功，不看产物无法发现）**

1. **LaTeX 公式被静默丢弃**：原方案用 `markdown-it-mathjax3@4`（异步插件），而 `vitepress@1.6.4` 不依赖 `markdown-it-async`，渲染链是同步的，异步插件的 Promise 不会被 await —— 公式**连纯文本回退都没有**，直接从产物消失，但构建退出码仍为 0。
   - 定位方式：隔离实验证明 mathjax3 单独用 `md.render()` 能正常渲染（9260 字符含 `mjx-container`），集成后为 0，据此断定是异步链路问题。
   - 修复：改用同步插件 `@mdit/plugin-katex`（peer 为 `markdown-it ^14`，与 1.6.4 一致），并在主题中引入 `katex.min.css`（本地依赖，不走 CDN）。

2. **中文全文搜索失效**：`minisearch` 默认按空白/标点切词，中文无空格 → 「三次握手」被当成单个 token，导致查询「握手」**命中 0 条**（实测确认）。在纯中文站点上等于 spec 4.2「全文搜索（核心必备）」未达标。
   - 修复：在 `themeConfig.search.options.miniSearch` 中为 CJK 增加字符级切分（`tokenize`），并把多词匹配语义改为 `combineWith: 'AND'`。
   - 为何必须加 AND：字符级切分后中文查询会拆成多个单字，沿用默认 OR 时只要任一字出现即命中，产生大量噪音（实测「量子计算机」返回 12 条无关结果）。加 AND 后召回不降、噪音清零、结果数更精确。
   - 实测（8 个应命中 + 3 个应无结果）：全部通过；`握手`→8 条首条为「为什么需要三次握手」，`TIME_WAIT`→2 条，`量子计算机`→0 条。

---

### 0.5 阶段四完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 顶部导航 | 5 项，文案与顺序严格等于 spec 3.1：首页 / 知识库 / 技术博客 / 项目实践 / 关于我 |
| 知识库侧边栏 | 按 spec 3.2 配置，实测渲染 29 个条目（7 个一级分类按 01→07 排序，01 与 05 各含子分类嵌套），分组可折叠 |
| 其他侧边栏 | `/blog/`、`/projects/` 各自独立，互不污染（已确认博客页不含知识库条目） |
| 右侧大纲 | `outline.level: [2, 3]`，标签「本页目录」 |
| 首页 | 极简四项内容齐备，未使用 hero/features 组件，无侧边栏 |
| 界面中文化 | 覆盖 8 项内置文案（本页目录/上一篇/下一篇/目录/回到顶部/外观/亮色暗色切换标题/跳到正文） |
| 验证结果 | 构建退出码 0、无 dead link；9 个关键 URL 全部 HTTP 200 且含导航 |

**阶段四发现并处理的问题**

1. **VitePress 1.6.4 没有 zh-CN 内置语言包**：`lang: 'zh-CN'` **不会**自动切换界面文案，默认输出英文 "On this page" / "Previous page" / "Menu" / "Appearance" 等。已通过 `themeConfig` 逐项覆盖为中文（8 项），英文可见文案已全部消除。
   - 唯一残留：导航栏屏幕阅读器标签 "Main Navigation" 为 `VPNavBarMenu.vue` 内硬编码，1.6.4 未提供配置项，`node_modules` 内组件亦未导出，无法通过配置中文化。**不影响任何可见文案**，已记入配置注释。

2. **侧边栏 `aria-expanded="false"` 误判排查**：初查发现 3 处 `aria-expanded="false"`，疑似与 `collapsed: false`（默认展开）矛盾。核实后确认这 3 处分别属于外观菜单、移动端汉堡按钮、移动端目录抽屉，**与侧边栏分组无关**；`01-计算机基础` 实际渲染为 `level-1 collapsible` 且子项已展开输出。

3. **`弹窗` 禁令误报排查**：全站扫描时 `popup` 命中，核实为 `aria-haspopup="true"`（外观菜单按钮的标准无障碍属性），非真实弹窗；`VPDialog` 组件不存在，`role="dialog"` 无匹配。

---

### 0.6 阶段五完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 书写规范 | `docs/CONTRIBUTING.md`，六节：frontmatter、标题层级、代码块、更新日志、图片、可选增强 |
| 示例文章 | 3 篇：`tcp-handshake.md`（网络）、`attention-mechanism.md`（大模型，84 处公式）、`vitepress-math-silent-failure.md`（踩坑） |
| 图片 | `docs/public/images/attention-flow.png`（1000x340，自建极简线框） |
| 规范巡检 | 3/3 PASS，问题数 0（机械校验：frontmatter 四项、date 格式、唯一 h1、不跳级、代码块语言标识、文末更新日志） |
| 验证结果 | 构建退出码 0、无 dead link；图片 HTTP 200 且字节数一致 |

**阶段五的疑问与修正**

1. **`CONTRIBUTING.md` 会被生成为页面**：核实 `vitepress@1.6.4` 的 `srcExclude` 默认不含它（仅排除 2.x 才加入的约定文件名）。判断为符合 T5.1 意图（规范可公开查阅、可被搜索），故保留。

2. **图片生成经历两轮修正**：初版最后一个方框越界被裁切（1000 宽画布下 `790+150=940` 虽未超界，但改用 4 框等距布局后需重算），已加入 `assert` 断言防止复发；`Kᵀ` 上标字符在 `msyh.ttc` 中渲染为豆腐块，改为 `K^T`。

3. **巡检脚本自身有误**：初版把代码块内的 `# 注释` 误判为 Markdown 标题（误报"一级标题 6 个"），已改为先剔除围栏代码块再做结构检查。**若未发现该误报，会得出"三篇文章都不合规"的错误结论。**

4. **构建耗时上升至约 64s**：`attention-mechanism.md` 含 84 处公式，KaTeX 渲染开销显著。属内容增长的正常代价，非配置问题。

---

### 0.7 阶段六完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 页脚组件 | `theme/SiteFooter.vue`（版权 / 备注 / Git 最后提交时间）+ `theme/Layout.vue`（layout-bottom 插槽注入） |
| 样式 | `theme/custom.css`：系统 CJK 字体栈、留白微调、隐藏默认页脚、公式与代码块滚动容器 |
| 验证方式 | **真实浏览器（Playwright + Chromium）自动断言 23 项，全部 PASS**；并人工查看亮/暗、桌面/窄屏截图 |
| 验证覆盖 | 代码高亮/行号/复制按钮与剪贴板内容、字体栈、页脚三项与默认页脚隐藏、暗色模式、桌面与窄屏无横向溢出、移动端抽屉开合 |

**阶段六发现并修复的真实缺陷**

**窄屏横向溢出（spec 4.2 响应式适配不达标）**：390px 视口下文档宽度被撑到 **537px，超出 147px**，整页在手机上可左右滑动。
- 定位方式：遍历 `body *` 计算 `getBoundingClientRect().right` 与视口差值，按超出量排序，锁定元凶为 KaTeX 块级公式容器（内部 `<code>` 宽 764px，超出 406px）。
- 根因：KaTeX 的 `.katex-display` 默认 `white-space: nowrap` 且不换行，长公式（`ISN = M + F(localhost, localport, remotehost, remoteport)`）直接撑破布局。
- 修复：为 `.katex-display` 增加 `overflow-x: auto` 滚动容器（不改动公式自身排版）。
- 复验：窄屏 `scrollWidth` 由 537 → **390**（等于视口宽度）。

**验证过程中的两次自身失误（均已纠正，记录备查）**

1. **移动端抽屉断言写错对象**：初版检查 `.VPSidebar` 的 `open` 类，误报失败。实测该版本移动端侧边栏是靠 `transform: translateX(-320px)` 移出视口，导航抽屉由 `VPNavScreen` 承担。改为断言 `VPNavScreen` 可见性与汉堡按钮 `aria-expanded` 翻转后通过。
2. **预览服务缓存旧资源清单导致假失败**：修复 CSS 后未重启 `vitepress preview`，其进程内缓存了旧构建的资源哈希，新资源全部 404，于是出现"字体回落 Times New Roman、CSS 变量全空"等 9 项假失败。排查方式为捕获浏览器控制台与失败请求，确认 `404 /assets/style.*.css`。**重启预览服务后 23/23 全通过。**
   - 教训：`docs:build` 之后必须重启 `docs:preview`，否则验证结果不可信。

**保留的设计说明**

- 公式与代码块在窄屏采用**块内横向滚动**（`overflow-x: auto`），而非换行或缩小字号。这是技术文档的标准做法：代码与公式换行会破坏语义，整页横向滚动才是必须消除的缺陷。
- 页脚时间采用 **UTC 日期格式**（`2026-10-07 04:05 UTC`）而非本地化格式。原因：服务端与客户端时区可能不同，`Intl` 本地化格式会导致 hydration 不一致（默认主题的 `onMounted` 延迟渲染即为此原因）；UTC 对两侧都是同一确定值。

---

### 0.8 阶段七完成后的实际状态

| 项 | 结果 |
| --- | --- |
| 部署工作流 | `.github/workflows/deploy.yml`：push(main) + 手动触发 → build job → deploy job |
| base 策略 | 环境变量驱动 `VITEPRESS_BASE`，工作流按仓库名自动推导，本地与部署均无需改代码 |
| README | 技术栈、目录树、启动四步、部署步骤、base 对照表、写文章要点、6 条踩坑注意事项 |
| 验证工具 | `.automation/verify-base.ps1`（双 base 场景资源可达性校验，可重复执行） |
| 验证结果 | 工作流 23 项字段结构校验通过；双 base 场景各 1108 项资源引用校验通过；`npm ci` 可复现 |

**阶段七的关键决策与实测**

1. **`base` 不写死，改为环境变量驱动**：本仓库是项目页（`/ckj_blog/`），若把 `base` 写成 `'/'`，部署后 CSS/JS/搜索索引全部 404；若写死 `/ckj_blog/`，本地 `docs:dev` 又要多输一层路径。改为 `process.env.VITEPRESS_BASE || '/'` 后，两种场景都不需要改代码，且工作流按仓库名自动推导并处理 `<user>.github.io` 用户页特例。
2. **未安装 YAML 校验工具**：项目内无任何 YAML 解析器。为不放宽"无冗余依赖"的约束，改为自写结构化校验脚本（Tab/缩进/字段/顺序/表达式），用后即删。
3. **Action 版本靠 API 核实而非记忆**：通过 GitHub API 查询 latest release，确认使用 `checkout@v7`、`setup-node@v7`、`configure-pages@v6`、`upload-pages-artifact@v5`、`deploy-pages@v5`。

**阶段七验证过程中的三次自身失误（均已纠正，记录备查）**

1. **校验脚本正则要求了不必要的目录层级**：初版正则写成 `/[^"]*?/(?:assets|images)/`，强制 `^/` 后必须有一段目录，导致 `base: '/'` 下 `/assets/...` 匹配不到，出现「checked: 0 → FAIL」的假失败。改为中间段可选后，两场景各匹配到 1108 个引用。
2. **函数返回值被输出污染**：PowerShell 函数内 `Write-Output` 会进入返回管道，使 `$r1`/`$r2` 变成数组而非布尔值，出现「单项 FAIL 但 OVERALL PASS」的自相矛盾。改用 `Write-Host` 输出进度、函数只返回布尔值后修正。
3. **`.ps1` 无 BOM 导致中文注释被 PowerShell 5.1 按 ANSI 解码**，解析报错并最终留下语法错误。该脚本已改为**纯 ASCII 注释**，从根上规避编码依赖。

---

### 0.9 阶段八完成后的验收结果

| 验收项 | 方式 | 结果 |
| --- | --- | --- |
| T8.1 开发模式 | Playwright 真实浏览器，22 项断言 | ✅ 22/22 通过 |
| T8.2 生产预览 | 同一套 22 项断言 | ✅ 22/22 通过（且控制台错误 0） |
| T8.3 断链与资源 | 产物链接 + 正文内联链接 + 图片 + HTTP 层 | ✅ 全通过（含 22 个内联链接） |
| T8.4 内容规范 | 3 篇文章机械校验 | ✅ frontmatter / 层级 / 语言标识 / 更新日志 全通过 |
| T8.5 目录结构 | 与 spec 3.2 逐条比对 | ✅ 7 大分类 + 7 子分类 + 17 个内容目录均有 index.md |
| T8.6 交付物清单 | spec 9 六项 | ✅ 全部齐备 |
| T8.7 禁用项 | 依赖 + 24 个页面扫描 | ✅ 无禁用框架、无广告/弹窗/推荐/特效/统计 |

**阶段八发现并修复的真实故障（最重要的一项）**

**`npm run docs:dev` 自始至终是坏的 —— 开发模式下应用完全不挂载、全站空白。**
- 现象：`#app` 无任何子节点，导航、侧边栏、正文全部不渲染。
- 影响面被长期掩盖的原因：阶段一至七的验证**全部跑在生产构建产物上**（阶段一的 dev 检查只断言了 HTTP 200，而 dev 返回的是 SPA 外壳，天然为 200）。这正是"spec 8.5 要求提供可直接运行的本地启动命令"下最不该出现的问题。
- 定位：抓取浏览器 `pageerror` 得到
  `The requested module '.../node_modules/fastdom/fastdom.js' does not provide an export named 'default'`。
- 根因：`mermaid@11.17.2` 用到的 `fastdom@1.0.12` 是**纯 CommonJS 包**（`package.json` 无 `module` 字段、无 `exports` 映射，`main` 指向 `fastdom.js`），其扩展文件 `extensions/fastdom-promised.js` 同为 CJS。Vite 开发服务器未做 CJS→ESM 互操作，把文件当 ESM 原样返回，模块加载失败导致应用不挂载。生产构建走 Rollup + commonjs 插件，因此 `docs:build` 正常 —— 属 **dev 与 build 的行为差异**。
- 修复：在 `config.ts` 中把 `fastdom` 与 `fastdom/extensions/fastdom-promised` 精确别名到具体文件，并加入 `vite.optimizeDeps.include`，由 Vite 完成互操作转换。别名必须指向文件，指向目录无法解析（该包没有 `exports` 映射）。
- 复验：`#app` 子节点 0→1，导航 5 项、侧边栏、右侧大纲、`VPContent has-sidebar` 全部出现；生产构建的 CSS 哈希不变（`style.DqpxcTGY.css`），确认**未影响生产产物**。

**阶段八验收过程中我的三次断言失误（均已纠正，记录备查）**

1. **首页断言用了 `.vp-doc`**：首页是普通 layout 而非文档 layout，该选择器不存在，导致等待 30s 超时。改为读取 `document.body.innerText`。
2. **侧边栏折叠断言数了 DOM 节点**：VitePress 折叠是把子项容器高度动画到 0 并加 `collapsed` 类，**不移除节点**，所以节点数恒定 9→9，误报失败。改为断言 `collapsed` 类翻转 + 容器高度 `128→0` + 可见子项 `9→5`，并补充"可再次展开"断言；实测折叠功能一直是正常的。
3. **链接检查未做 URL 解码**：href 是百分号编码（如 `%E8%AE%A1`），直接拼文件路径必然找不到，误报 2 个"缺失链接"；而同一批链接的 HTTP 层检查全部 200，暴露出是检查器的问题。修正为先 `decodeURIComponent` 再比对。

**结论：三次失败中没有一次是站点缺陷，全部是断言写错。** 若不做交叉验证（HTTP 层 vs 文件系统、DOM 节点 vs 可见高度），会得出"侧边栏不能折叠、站内有死链"的错误结论。

---

### 0.10 最终交付状态

| 项 | 结果 |
| --- | --- |
| 线上站点 | https://ckj337728-web.github.io/personalblog/ |
| 仓库 | https://github.com/ckj337728-web/personalblog |
| CI 运行 | id `37643406741`，`conclusion=success`（build + deploy 全部步骤成功） |
| 线上功能验收 | 22/22 通过（与本地 dev / preview 结果一致） |
| 任务完成度 | **55 / 55** |

**T8.8 推送阶段发现的两个问题**

1. **首次推送不触发 workflow**：原因是 Pages 未启用（`has_pages: false`）。启用 Pages 后用 `workflow_dispatch` 正常触发。README 中已写明需先将 Pages 的 Source 设为 GitHub Actions。
2. **favicon 在子路径部署下 404**：见 T8.8 执行记录。这是**只有真正部署到子路径才会暴露**的问题 —— 本地 `/` 与产物检查都发现不了，必须靠线上浏览器请求才看得到。已在 `transformHead` 中按 base 动态拼接修复。

**关于本地开发与部署的 base 差异（最终机制）**

- 本地 `docs:dev` / `docs:build`：不带 `VITEPRESS_BASE`，`base` 为 `/`，直接访问 `http://localhost:5173/`。
- CI：工作流按 `github.event.repository.name`（`personalblog`）注入 `VITEPRESS_BASE=/personalblog/`，与 Pages 项目页路径一致；仓库名形如 `<user>.github.io` 时自动取 `/`。
- 因此**本地与线上均无需改代码**，仓库改名后也自动适配。

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

- [×] **T3.1 站点基础元信息**
  - `lang: 'zh-CN'`、`title`、`description`、`base`（默认 `'/'`，若部署到 `用户名.github.io/仓库名/` 则改为 `'/仓库名/'`）、`head` 中 favicon。
  - 完成标准：`docs/.vitepress/config.ts` 含上述字段且构建无警告。
  - 执行记录：配置文件名后缀为 `.ts`（非 `.mts`，VitePress 1.6.4 两者均支持，`.ts` 与项目 `type: module` 一致）；favicon 用 `docs/public/favicon.svg`（自建极简 SVG，无外部依赖），产物 `<link rel="icon" href="/favicon.svg">` 与 dist 中的文件均已确认；`lang="zh-CN"` 已确认写入 HTML。

- [×] **T3.2 开启全文搜索（spec 4.2 核心必备）**
  - `themeConfig.search = { provider: 'local', options: { locales: { root: { translations: {...中文文案...} } } } }`。
  - 完成标准：构建后页面顶部出现搜索框；输入任一示例文章关键词能命中结果。
  - 执行记录：本地索引 `@localSearchIndexroot.*.js` 已生成，含 27 个文档条目与文章正文；中文界面文案生效（实测 `aria-label="搜索"`）。
  - **修订（重要）**：仅配 `provider: 'local'` 时中文检索**不可用** —— minisearch 默认按空白/标点切词，中文无空格使「三次握手」成为单 token，查询「握手」命中 0 条。已增加 CJK 字符级 `tokenize` 与 `combineWith: 'AND'`，实测 8 个应命中查询全部通过、3 个无关查询（含「量子计算机」）全部 0 条。

- [×] **T3.3 开启亮色/暗色模式（spec 4.1）**
  - `appearance: true`（默认即开启，显式声明以便后续维护）。
  - 完成标准：页面右上角出现主题切换按钮，切换后 `<html>` 上的 `dark` class 随之变化。
  - 执行记录：产物中 `VPSwitchAppearance` 组件与 appearance 初始化脚本（`vitepress-theme-appearance`，防闪烁）均存在；`appearance: true` 显式声明。

- [×] **T3.4 配置 Markdown 能力（spec 2）**
  - `markdown.lineNumbers: true`（代码行号）。
  - `markdown.config` 注入数学渲染插件（LaTeX 公式）。
  - `markdown.container` 中文标签（tip/warning/danger/info/details）。
  - 完成标准：示例文章中公式渲染为数学排版、代码块左侧出现行号。
  - **修订（重要）**：`markdown-it-mathjax3@4` 是**异步**插件，vitepress 1.6.4 渲染链为同步（不依赖 `markdown-it-async`），公式会被静默丢弃且构建仍报成功。已改用同步插件 `@mdit/plugin-katex`，并在主题中引入 `katex.min.css`。
  - 执行记录：产物中确认 `line-numbers-wrapper` 与 `class="line-numbers"`；KaTeX 渲染命中 `class="katex"`；容器默认中文标签命中「信息」，自定义标题容器正常；代码高亮与复制按钮均在。

- [×] **T3.5 接入 Mermaid（spec 2）**
  - 建 `docs/.vitepress/theme/index.ts`，`extends: DefaultTheme` 并使用 `withMermaid()` 包装。
  - 完成标准：示例文章中的 ` ```mermaid ` 代码块渲染为流程图而非纯文本。
  - 执行记录：`docs/.vitepress/theme/index.ts` 已建；产物中 `language-mermaid` 代码块已全部转换为 mermaid 容器。
  - 修订：`vitepress@1.6.4` **未导出** `defineTheme`（该 API 属 2.x），主题直接导出普通对象即可；初版误用 `defineConfig`/`defineTheme` 均已修正。
  - 副作用记录：接入 Mermaid 后构建耗时由约 2.75s 升至 22–33s（Mermaid 需打包进客户端 bundle），属预期代价。

- [×] **T3.6 开启 Git 最后更新时间（spec 4.2）**
  - 站点级 `lastUpdated: true`，并在页脚/页面呈现。
  - 完成标准：文章页出现"最后更新于 …"时间，且时间随该文件最新提交变化。
  - 执行记录：站点级 `lastUpdated: true`；文案经 `themeConfig.lastUpdated.text` 覆盖为中文「最后更新于」（默认英文为 "Last updated:"）。实测已提交文件显示 `最后更新于: 2026-10-07T04:05:21Z`；未提交的新文件取不到时间（属 Git 机制预期，故本阶段将其纳入提交）。
  - 待办联动：CI 中 `actions/checkout` 必须 `fetch-depth: 0`，否则全站时间会相同（见 T7.2）。

- [×] **T3.7 明确"无重依赖/无特效"约束（spec 4.3）**
  - 自查配置与主题中不存在动画库、轮播、弹窗、推荐位、统计脚本（除 favicon/字体等必要 head 项）。
  - 完成标准：依赖清单仅含 spec 所需项；`docs/.vitepress/theme/` 无额外第三方组件引入。
  - 执行记录：直接依赖共 5 个 —— `vitepress`、`vitepress-plugin-mermaid`、`mermaid`、`@mdit/plugin-katex`、`katex`；`dependencies` 为空，`devDependencies` 5 项。相比原计划的 4 项，多出的是 LaTeX 渲染的同步实现（`@mdit/plugin-katex` + `katex`），属 spec 2 明确要求的能力，非冗余。
  - 说明：Mermaid 主题采用 `neutral`（低饱和），并非纯灰度；Mermaid 无法做到完全无彩色，已在配置注释中如实标注。

- [×] **T3.8 配置说明落档**
  - 在 `docs/.vitepress/config.ts` 关键段落写简短中文注释（如为何 `layout-bottom`、为何不自配 footer、为何锁 mermaid 11）。
  - 完成标准：注释存在且解释与实现一致。
  - 执行记录：`config.ts` 共 137 行，其中 35 行为注释，逐节标注对应任务号；覆盖 `base` 部署路径差异、`layout-bottom` 页脚决策、CJK 分词与 `combineWith` 原因、异步插件陷阱、`fetch-depth` 要求等关键决策，并逐条核对与实现一致。

---

## 阶段四：导航 / 侧边栏 / 首页（spec 3 / 7）

- [×] **T4.1 顶部导航栏 5 项（spec 3.1）**
  - 依次为：首页 `/`、知识库 `/knowledge/`、技术博客 `/blog/`、项目实践 `/projects/`、关于我 `/about`。
  - 完成标准：导航项文本与顺序与 spec 3.1 完全一致，且每项均可跳转、无 404。
  - 执行记录：实测渲染 5 项且顺序/文案与 spec 3.1 完全一致（首页→`/`、知识库→`/knowledge/`、技术博客→`/blog/`、项目实践→`/projects/`、关于我→`/about.html`），9 个页面 `VPNavBarMenuLink` 均存在、无 404。

- [×] **T4.2 知识库侧边栏 = 7 大分类骨架（spec 3.2）**
  - 用 `themeConfig.sidebar['/knowledge/']` 显式声明，`text` 与目录中文名一致，子分类做二级嵌套；顺序严格 `01→07`。
  - 完成标准：进入 `/knowledge/` 任意页面，左侧栏按 01～07 顺序展示，01 与 05 下能展开子分类。
  - 执行记录：`sidebar['/knowledge/']` 已声明，`text` 与磁盘目录名逐一一致；实测渲染 29 个条目，一级分类顺序为 01→07，01 下嵌套 `计算机网络`（含文章 `TCP 三次握手与四次挥手`）/`操作系统`/`数据结构与算法`，05 下嵌套 `大模型基础`/`Agent智能体`/`Harness与沙箱与评测体系`/`Prompt工程`。
  - 修订：同时把已存在的示例文章登记为侧边栏条目，避免出现"配置了但点不进去"的死条目。

- [×] **T4.3 侧边栏折叠/展开（spec 4.2）**
  - 确认分组可折叠、当前文章所在分组默认展开。
  - 完成标准：点击分组标题可折叠/展开，刷新后当前页所在分组为展开态。
  - 执行记录：带子项的分组渲染为 `VPSidebarItem level-1 collapsible` 并输出 `.caret` 折叠按钮；因 `collapsed: false`，01 与 05 默认展开且子项已 SSR 输出，首屏即为展开态。
  - 澄清：全站扫描发现的 3 处 `aria-expanded="false"` 经核实分别属于外观菜单、移动端汉堡按钮、移动端目录抽屉，**与侧边栏分组无关**，非缺陷。

- [×] **T4.4 博客与项目实践侧边栏**
  - `sidebar['/blog/']`、`sidebar['/projects/']` 指向各自 `index.md` 及后续文章；文章列表按日期倒序维护。
  - 完成标准：两个栏目页面均有可用侧边栏，点击进入对应示例文章。
  - 执行记录：`/blog/`（技术博客 → 文章列表）、`/projects/`（项目实践 → 项目列表）各自独立生效；已确认博客页侧边栏不含任何知识库条目（其他位置出现的 `01-计算机基础` 字样来自 VitePress 内嵌的站点数据，非侧边栏污染）。
  - 说明：`docs/blog/index.md`、`docs/projects/index.md` 补为正式索引页（含 frontmatter 与「更新日志」），供侧边栏链接落点。博客示例文章属 T5.4，本阶段不新增。

- [×] **T4.5 文章页右侧大纲导航（spec 4.2）**
  - 保持默认 `aside` 开启（`outline` 深度至少到 3 级，与 spec 5"层级严格"匹配）。
  - 完成标准：示例文章右侧显示 h2/h3 大纲，滚动时高亮跟随。
  - 执行记录：`outline.level: [2, 3]`、`outline.label: '本页目录'`；实测文章页 `VPDocAsideOutline` 容器存在，输出 5 条 h2 大纲锚点（含 `#状态迁移`、`#time-wait-的两个作用` 等）。滚动高亮由主题内置脚本提供。

- [×] **T4.6 首页极简文案（spec 7）**
  - 仅四块内容：个人简介（工程师、持续学习、技术沉淀）、站点定位（终身知识库 & 技术博客）、快速入口（知识库/博客/项目）、最近更新文章列表（手工维护的 Markdown 链接列表即可，不引入自动生成逻辑）。
  - 完成标准：首页不出现轮播、卡片特效、横幅动画；四项内容齐全且入口链接可点。
  - 执行记录：四项内容齐备；入口链接实测为 `/knowledge/`、`/blog/`、`/projects/`，最近更新指向示例文章；"最近更新"为手工维护的列表，未引入自动生成逻辑。
  - 实现取舍：**未使用 `layout: home` 的 hero/features 组件**，改用普通 Markdown 页面。原因：hero/features 属 spec 4.3 禁止的"花哨卡片/横幅"，且其渲染行为无法通过渲染后 HTML 断言验证。实测首页无 `VPHero`/`VPFeatures`，为纯 `VPContent` 布局，且未渲染侧边栏（`sidebar` 未给 `/` 配置）。

- [×] **T4.7 首页文案自查（spec 7 / 4.3）**
  - 核对无广告模块、无推荐模块、无弹窗。
  - 完成标准：逐条对照 spec 4.3 三条禁令，均未命中。
  - 执行记录：对全部 20 个页面做关键词扫描 —— 广告（`adsbygoogle`/`carbon-ads` 等）PASS、推荐位 PASS、轮播/粒子/动画库 PASS、统计脚本 PASS。
  - 澄清：`弹窗` 初查命中 `popup`，核实为 `aria-haspopup="true"`（外观菜单按钮的标准无障碍属性），非真实弹窗；`VPDialog` 组件不存在，`role="dialog"` 无匹配。

---

## 阶段五：示例文章与书写模板（spec 5 / 9）

- [×] **T5.1 定义文章书写规范文档**
  - 新建 `docs/CONTRIBUTING.md` 或在 README 中成节，写明：必填 frontmatter（`title` / `date` / `tags` / `category`）、标题层级规则、代码块必须带语言标识、文末必须有「更新日志」模块。
  - 完成标准：四条规则逐条成文，可被后续写作直接照抄。
  - 执行记录：`docs/CONTRIBUTING.md` 已建，六节成文（frontmatter 字段表、标题层级、代码块、更新日志、图片引用、可选增强），每条规则均附可直接复制的示例代码块。
  - 实现说明：实测 `vitepress@1.6.4` 的 `srcExclude` 默认**不含** `CONTRIBUTING.md`，故该文件会被生成为可访问页面并进入搜索索引。这符合 T5.1 的意图（规范可被公开查阅与检索），故保留，未额外加入 `srcExclude` 或导航。

- [×] **T5.2 示例文章 1（知识库类）**
  - 位置：`docs/knowledge/01-计算机基础/计算机网络/` 下，内容为计算机网络主题。
  - 含完整 frontmatter、三级标题层级、带语言标识的代码块、Mermaid 图、文末「更新日志」。
  - 完成标准：页面可访问，公式/图表/行号/复制按钮均正常；frontmatter 四项齐全。
  - 执行记录：`tcp-handshake.md`（阶段三为验证 T3.4/T3.5 已提前产出）。本阶段复核：页面 HTTP 200；行号、代码高亮、复制按钮、Mermaid 图（`language-mermaid` 已转换）、`:::: tip/warning/info` 容器中文标签均正常；规范巡检 PASS。
  - 内容构成：三次握手/四次挥手状态机（2 个 Mermaid 图）、TIME_WAIT 与 ISN 选择（含 `$$` 公式）、`tcpdump` 抓包示例。

- [×] **T5.3 示例文章 2（知识库类，LaTeX 公式）**
  - 位置：`docs/knowledge/05-AI与LLM学习/大模型基础/` 下，含至少一处 `$...$` 或 `$$...$$` 公式。
  - 完成标准：公式渲染为排版数学（非源码字面量）。
  - 执行记录：`attention-mechanism.md` 已建。产物中 KaTeX 渲染节点 **84 处**，块级公式（`katex-display`）存在，**无 `$$` 源码残留**；同时含 1 个 Mermaid 图与 PyTorch 最小实现代码块。
  - 内容构成：缩放点积注意力、`sqrt(d_k)` 的方差推导、多头注意力的等价变换、手写实现与形状断言。

- [×] **T5.4 示例文章 3（技术博客/踩坑类）**
  - 位置：`docs/blog/` 下，含踩坑记录与带行号代码块。
  - 完成标准：页面可访问；`/blog/` 索引中能跳转到该文。
  - 执行记录：`vitepress-math-silent-failure.md` 已建，记录本阶段前真实遇到的"公式被静默丢弃"故障（现象→隔离定位→根因→修复→经验）。行号、代码高亮、`warning` 容器均确认；含 6 个 h2/h3 标题。
  - 联动：`/blog/` 索引页与 `sidebar['/blog/']` 均已登记该文，索引中可跳转。

- [×] **T5.5 每篇文章插入图片引用示例（spec 6.1）**
  - 图片放入 `docs/public/images/`，正文以 `/images/xxx.png` 引用。
  - 完成标准：至少 1 篇文章含可正常显示的图片，且引用路径为 `docs/public/images/`。
  - 执行记录：用 Pillow 生成 `docs/public/images/attention-flow.png`（1000x340，极简黑白灰线框，与站点风格一致），在 `attention-mechanism.md` 中以 `![Scaled Dot-Product Attention 计算流程](/images/attention-flow.png)` 引用。
  - 验证：产物中 `<img src="/images/attention-flow.png">` 与 `alt` 均存在；HTTP 请求返回 `200 image/png`，字节数与本地文件一致（30318）。
  - 生成过程修正两处缺陷：初版最后一个框越界被裁切（`assert` 已加入防止复发）；`Kᵀ` 上标字符在所选字体中渲染为豆腐块，改为 `K^T`。

- [×] **T5.6 文章规范巡检**
  - 逐篇检查：frontmatter 四项齐全、无跳级标题、无无语言标识代码块、文末有「更新日志」。
  - 完成标准：3 篇示例文章全部通过，形成一份结论记录。
  - 执行记录：编写临时脚本对 3 篇文章做机械校验（frontmatter 四项齐全、`date` 为 `YYYY-MM-DD`、一级标题唯一、标题层级不跳级、代码块全部带语言标识、文末为「更新日志」小节），结果 **3/3 PASS，问题数 0**。脚本用后即删，未留在仓库中。
  - 校验自身修正：初版脚本把代码块内的 `# 注释` 误判为标题（报"一级标题 6 个"），已改为先剔除围栏代码块再做结构检查。

---

## 阶段六：UI 视觉与交互核对（spec 4）

- [×] **T6.1 代码块高亮 / 一键复制 / 行号（spec 4.2）**
  - 完成标准：文章页代码块有语法高亮、右上角复制按钮可复制成功、左侧显示行号。
  - 执行记录：真实浏览器断言 —— `.shiki` 高亮容器存在（单块着色 token 12 个）、`.line-numbers-wrapper` 行号容器存在、`button.copy` 存在；**实际点击复制按钮后读取剪贴板，内容包含代码正文**（不只是按钮存在）。
  - 说明：本项在阶段三已用产物 HTML 初验，本阶段改用浏览器交互复验，覆盖"按钮存在但点了没反应"这类产物断言查不出的情况。

- [×] **T6.2 极简黑白灰风格微调（spec 4.1）**
  - 仅通过 `docs/.vitepress/theme/custom.css` 调整：配色克制、正文字体无衬线、代码等宽字体、留白加大。
  - 完成标准：亮/暗两套模式下均无彩色装饰块；改动集中在单个 CSS 文件，未改动默认主题结构。
  - 执行记录：改动全部集中在 `custom.css`（未新增其他样式文件，未改默认主题组件结构）。浏览器实测：正文 `font-family` 命中系统栈（`-apple-system, ..., PingFang SC, ...`），代码命中等宽栈；暗色模式下 `body` 背景为 `rgb(27,27,31)`，亮/暗截图均确认无彩色装饰块。
  - 关键取舍：**字体改用系统 CJK 字体栈而非默认 Inter**。默认主题的 Inter 不含中文字形，中文会回退导致中英文基线不齐；且**未引入任何外部字体**（不走 CDN），满足 spec 6.3 纯静态可迁移。
  - 具体调整：间距变量、标题上下留白、正文行高 1.75、表格内边距与表头灰底、正文图片居中限宽。

- [×] **T6.3 页脚：版权 + 更新时间 + Git 最后提交时间（spec 4.2）**
  - 用 `layout-bottom` 插槽渲染页脚，显示版权信息、站点更新时间、以及基于 git 的最后提交时间；确保在**有侧边栏的文章页也可见**。
  - 完成标准：任取一篇带侧边栏的文章页，页脚三项信息均出现且时间非空。
  - 执行记录：新增 `theme/SiteFooter.vue` + `theme/Layout.vue`（`layout-bottom` 插槽注入）。浏览器断言：页脚在文章页可见、含 `Copyright © 2026-present CKJ`、Git 提交时间非空（`2026-10-07 04:05 UTC`）；窄屏下同样可见。
  - 实现要点一（双页脚消除）：默认主题 footer 在**无侧边栏页面**（首页、关于）会自行渲染，若只加自定义页脚会导致首页出现两套页脚。处理方式为：`themeConfig.footer` 保留但仅作为 `SiteFooter` 的**数据源**，默认页脚由 `custom.css` 的 `.VPFooter { display: none }` 隐藏，全站页脚统一由 `SiteFooter` 输出。浏览器已断言默认页脚 `display === 'none'`。
  - 实现要点二（hydration 一致）：时间采用 **UTC 定值格式**而非 `Intl` 本地化格式，避免服务端与客户端时区不同导致 hydration 不一致（默认主题改用 `onMounted` 延迟渲染即为此原因）；UTC 格式对两侧都是同一确定值，且服务端产物中时间即非空。

- [×] **T6.4 响应式适配手机 / PC（spec 4.2）**
  - 在窄屏（≤768px）与桌面宽度下各验证一次：导航、侧边栏抽屉、正文、代码块、大纲。
  - 完成标准：窄屏无横向滚动条，侧边栏可开合，正文不溢出。
  - 执行记录：用 Playwright + Chromium 在 1440×900 与 390×844 两档实测。桌面 `scrollWidth=1440=clientWidth`；窄屏 `scrollWidth=390=clientWidth`；右侧大纲 7 条可见；窄屏汉堡按钮可见、侧边栏默认收起、导航抽屉可开合并含导航链接、展开后仍无溢出。
  - **修复了一个真实缺陷**：初步验证发现窄屏文档宽度被撑到 **537px（超出 147px，整页可横向滑动）**。经遍历元素边界定位，元凶是 KaTeX 块级公式（`.katex-display` 默认 `nowrap`，内部 `<code>` 宽 764px）。已为其增加 `overflow-x: auto` 滚动容器，复验 537 → 390。
  - 说明：公式与代码块在窄屏为**块内横向滚动**（实测公式 maxScroll 171px、代码块 maxScroll 406px），非被裁切；这是技术文档的标准做法，代码与公式换行会破坏语义。

- [×] **T6.5 无特效自查（spec 4.3）**
  - 完成标准：无粒子背景、无横幅动画、无轮播、无花哨卡片、无弹窗/推荐模块。
  - 执行记录：对全部 20 个页面产物做关键词扫描，广告（`adsbygoogle`/`carbon-ads`）、推荐位、轮播/粒子/动画库、统计脚本全部 PASS；首页无 `VPHero`/`VPFeatures`/`VPCarousel`/`VPDialog`。
  - 浏览器侧复核：亮色与暗色、桌面与窄屏四张截图逐张目视确认，无动画元素、无弹窗、无推荐模块、无彩色装饰块。

---

## 阶段七：CI/CD 与部署（spec 6.2 / 9）

- [×] **T7.1 编写 GitHub Actions 部署工作流（spec 6.2）**
  - 新建 `.github/workflows/deploy.yml`：`on: push`（`main` 分支）+ `workflow_dispatch`；Node 24；`npm ci` → `npm run docs:build` → 上传 `docs/.vitepress/dist` 产物 → 部署到 GitHub Pages（`actions/deploy-pages`，需 `pages: write`、`id-token: write`）。
  - 完成标准：YAML 语法有效（`npx --yes yaml-lint` 或 `actionlint` 任一校验通过），步骤顺序完整。
  - 执行记录：`.github/workflows/deploy.yml` 已建（72 行）。项目内无 YAML 解析器（PyYAML、js-yaml、yaml 均不存在），为**不污染依赖树**未安装新包，改为编写结构化校验脚本：检查 Tab 字符、缩进是否为 2 的倍数、空列表项、23 个关键字段、步骤顺序、`${{ }}` 配对 —— **全部通过**。脚本用后即删。
  - 版本核对：通过 GitHub API 查询各 Action 的 latest release 确定真实版本号（避免凭记忆写错）：`actions/checkout@v7`、`actions/setup-node@v7`、`actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`。
  - 说明：`configure-pages` 步骤用于初始化 Pages 配置；`concurrency` 设为 `cancel-in-progress: false`，避免排队中的部署被取消而丢失已推送的提交。

- [×] **T7.2 保证 Git 历史完整（lastUpdated 前提）**
  - `actions/checkout` 必须设置 `fetch-depth: 0`。
  - 完成标准：工作流文件中 `fetch-depth: 0` 存在。
  - 执行记录：已设置，并附注释说明原因（浅克隆会让全站最后更新时间退化为同一个值）。

- [×] **T7.3 保证 `base` 与部署路径一致**
  - 若部署到项目页（`https://<user>.github.io/<repo>/`），`config.ts` 的 `base` 必须为 `'/<repo>/'`；若为用户页或 Vercel 自定义域，则为 `'/'`。
  - 完成标准：部署后首页静态资源（CSS/JS/图片/搜索索引）全部 200，无 404。
  - 执行记录（方案修订）：本仓库名为 `ckj_blog`，GitHub Pages 上属**项目页**（`https://<user>.github.io/ckj_blog/`），`base` 必须为 `/ckj_blog/`。为同时满足「本地开箱可用」与「部署开箱可用」，改为**环境变量驱动**：`base: process.env.VITEPRESS_BASE || '/'`，工作流按仓库名自动推导（仓库名形如 `<user>.github.io` 判为用户页取 `/`，否则取 `/<repo>/`），并用 `endsWith` 三元表达式处理用户页特例。
  - 验证方式：新增 `.automation/verify-base.ps1`，对两种 base 场景各清空产物重新构建，逐页提取资源引用并校验「前缀正确」+「磁盘存在」：两场景各 **1108 个引用，前缀错误 0、缺失 0，全部 PASS**；另实测 `docs:preview` 在 `/ckj_blog/` 下各页面与 CSS 均返回 200。

- [×] **T7.4 更新时间自动化核对（spec 6.2）**
  - 确认"每次更新自动生成更新时间"由 push 触发的构建 + `lastUpdated` 实现，无需额外脚本。
  - 完成标准：一次新提交推送后，Pages 产物中该文章的最后更新时间发生更新。
  - 执行记录：逐文件比对 `git log -1 --pretty=%ai` 与产物 `<time datetime>`，确认时间戳**一一对应**（`docs/index.md` 12:19:06+0800 → `04:19:06Z`；`blog/index.md` 12:43:15+0800 → `04:43:15Z`；`tcp-handshake.md` 12:05:21+0800 → `04:05:21Z`）。证明时间随提交自动更新，无需额外脚本。

- [×] **T7.5 可迁移性核对（spec 6.3）**
  - 全站纯静态：无数据库、无后端接口、无运行时环境变量依赖。
  - 完成标准：`docs/.vitepress/dist/` 可直接被任意静态服务器托管并正常访问（含搜索）。
  - 执行记录：扫描全部 24 个页面产物 —— 外部 CDN 脚本、外部样式表、外部字体（Google Fonts 等）、后端接口调用、数据库/WebSocket 依赖**全部为 0**；搜索索引为本地静态文件（`@localSearchIndexroot.*.js`，45.7 KB），无服务端参与；产物中 `process.env` 出现次数为 0（环境变量仅构建期使用）。

- [×] **T7.6 编写 README 项目说明（spec 9 / 8.5）**
  - 包含：项目简介与定位、目录结构说明、本地启动方式（安装/开发/构建/预览命令）、部署方式（GitHub Pages 步骤 + base 注意事项 + Vercel 备选）、文章书写规范入口（指向 T5.1 文档）。
  - 完成标准：README 三项（启动/部署/使用文档）齐备，命令逐条实测可执行。
  - 执行记录：`README.md` 已建，含技术栈表、完整目录树、本地启动四步命令、GitHub Pages 首次启用步骤、base 路径三场景对照表、其他静态托管说明、写文章要点、6 条踩坑注意事项、更新日志。
  - 实测验证：README 内 2 个相对链接（`docs/CONTRIBUTING.md`、`.github/workflows/deploy.yml`）与 9 个提及路径**全部存在**；三个 npm 命令与 `package.json` scripts 一致；`npm ci` 亲测可复现（249 packages，退出码 0）。
  - 额外记录：验证 `npm ci` 时首次失败并暴露一个真实约束 —— **`docs:preview` 进程未关闭会占用 `dist` 与 `node_modules`，导致 `npm ci` 报权限错误**。已在 README 的启动说明中写明"构建后需重启预览进程"。

---

## 阶段八：测试与验收（spec 9 交付物核对）

- [×] **T8.1 开发模式功能验收**
  - `npm run docs:dev` 后逐项验证：5 个导航、侧边栏折叠、右侧大纲、全文搜索、暗色切换、代码复制/行号、Mermaid、LaTeX、页脚三项、示例文章可打开。
  - 完成标准：形成一份逐项通过/失败清单，失败项全部修复后复测通过。
  - 执行记录：新增 `.automation/verify-features.cjs`（Playwright 真实浏览器，22 项断言），对 dev server 实测 **22/22 通过**。覆盖：导航 5 项文案与顺序、首页四项内容、侧边栏 7 分类顺序、分组折叠与再次展开、右侧大纲、代码高亮/行号/复制（含剪贴板实际内容）、Mermaid SVG、两篇文章的 LaTeX、页脚三项、暗色模式界面切换、图片真实加载（naturalWidth）、中文搜索命中、窄屏无溢出/汉堡按钮/页脚可见。
  - **修复了一个真实故障**：`docs:dev` 下应用完全不挂载（详见 0.9 节）。修复后 dev 与 preview 行为一致。

- [×] **T8.2 生产构建与预览验收**
  - `npm run docs:build` 退出码 0；`npm run docs:preview` 下重复 T8.1 全部检查。
  - 完成标准：构建无 dead link 报错；预览环境功能与开发模式一致。
  - 执行记录：构建退出码 0（38.87s），**无 dead link 警告**（`ignoreDeadLinks` 保持默认 `false`，未放宽）。同一套 22 项断言对 preview 实测 **22/22 通过**，且控制台错误 0、页面异常 0、失败请求 0 —— 与 dev 环境结果一致。

- [×] **T8.3 断链与资源核对**
  - 校验全站内部链接（`ignoreDeadLinks` 保持默认 `false`，即不允许死链）与图片路径。
  - 完成标准：构建期无死链警告；页面无 404 图片。
  - 执行记录：构建期无死链警告；另做四层核验 —— ①产物中 25 个导航/侧边栏链接全部可解析；②**正文内联站内链接**从 23 个 md 源文件提取 22 个，全部可解析；③图片引用 1 个且文件存在；④HTTP 层逐个请求 25 个链接，全部 200。
  - 说明：站内链接检查必须做 URL 解码（中文路径为百分号编码），且需跳过书写规范中的占位符示例（如 `/images/xxx.png`）。

- [×] **T8.4 内容规范最终巡检（spec 5 / 9）**
  - 3 篇示例文章全部符合 frontmatter / 层级 / 语言标识 / 更新日志四项要求。
  - 完成标准：清单逐篇打勾，无例外。
  - 执行记录：机械校验 3 篇文章 —— frontmatter 四项齐全、`date` 为 `YYYY-MM-DD`、一级标题唯一、标题层级不跳级、代码块全部带语言标识、文末为「更新日志」小节，**全部通过，无例外**。校验前先剔除围栏代码块，避免把代码注释误判为标题。

- [×] **T8.5 目录结构最终核对（spec 3.2 / 6.1）**
  - 输出 `docs/` 完整目录树，与 spec 3.2 的 7 大分类 + 子分类逐条比对。
  - 完成标准：无缺失目录、无多余目录、命名前缀正确、图片统一在 `docs/public/images/`。
  - 执行记录：脚本双向比对（既查缺失也查多余）—— 7 个一级分类齐全且顺序为 `01`～`07`、无多余目录；01 的 3 个子分类与 05 的 4 个子分类齐全；**17 个内容目录全部具备 `index.md`**；数字前缀正则 `^0[1-7]-` 全部通过；图片统一位于 `docs/public/images/`。

- [×] **T8.6 交付物清单核对（spec 9）**
  - 逐项确认：完整 VitePress 骨架 ✅ / 完整分类目录结构 ✅ / 本地启动命令 ✅ / GitHub Pages 部署配置 ✅ / 示例文章 2–3 篇 ✅ / README ✅。
  - 完成标准：6 项交付物全部存在且可用；缺失项补做后再验收。
  - 执行记录：六项**全部存在且可用** —— VitePress 骨架（`config.ts` + `theme/index.ts`）、分类目录结构（与 spec 3.2 一致）、三个 npm 命令（已实测可执行）、Pages 工作流（结构校验通过）、3 篇示例文章（规范巡检通过）、`README.md`（链接与命令实测有效）。

- [×] **T8.7 禁用项最终自查（spec 2 / 4.3）**
  - 确认未使用 Hexo / Hugo / 繁杂主题 / 动态 heavy 框架；无广告、无弹窗、无推荐、无特效。
  - 完成标准：`package.json` 依赖与主题文件逐条对照通过。
  - 执行记录：直接依赖 5 个（`vitepress`、`vitepress-plugin-mermaid`、`mermaid`、`@mdit/plugin-katex`、`katex`），正则排查 hexo/hugo/vuepress/gatsby/next/nuxt/animate/swiper/particles **全部无命中**；扫描全部 24 个页面产物，广告、真实弹窗（`role="dialog"`/`<dialog>`）、推荐位、轮播/粒子/动画库、统计脚本、外部 CDN 与外部字体**全部无命中**。

- [×] **T8.8 收尾提交**
  - 提交全部成果并推送到远端，确认 Actions 运行成功、Pages 可访问。
  - 完成标准：Actions 最近一次运行状态为成功；线上首页与一篇示例文章可正常打开。
  - 远端仓库：`https://github.com/ckj337728-web/personalblog.git`（由用户提供）
  - 执行记录：
    1. `git remote add origin` + `git push -u origin main` 成功，远端 `main` 与本地 HEAD 一致（`88a17a3`）。
    2. 首次推送**未触发工作流**（`total_count: 0`），根因是 Pages 尚未启用（`has_pages: false`）。
    3. 通过 GitHub API 启用 Pages（`build_type: workflow`），站点地址 `https://ckj337728-web.github.io/personalblog/`。
    4. 用 `workflow_dispatch` 触发运行（id `37643406741`），最终 `status=completed / conclusion=success`，`build` 与 `deploy` 两个 job 全部步骤成功。
    5. **线上实测**：8 个 URL 全部 HTTP 200（含中文路径文章、图片、favicon）；**22 项浏览器功能断言在线上重跑，22/22 通过**（导航、侧边栏折叠、大纲、代码高亮/行号/复制、Mermaid、LaTeX、页脚三项、暗色切换、中文搜索命中 10 条、窄屏无溢出）。
    6. `base` 自动推导验证：仓库名为 `personalblog`（非目录名 `ckj_blog`），工作流按仓库名推导出 `/personalblog/`，线上 48 个资源引用全部 200，且无裸 `/assets/` 引用。
  - **过程中发现并修复的真实缺陷（favicon 子路径 404）**：线上浏览器请求 `https://ckj337728-web.github.io/favicon.svg` 返回 404。根因是 `config.ts` 的 `head` 中手写绝对路径 `/favicon.svg`，而 **VitePress 不会为 head 里手写的绝对路径补 base 前缀**（官方文档中"base 会自动加到以 / 开头的 URL"的描述仅适用于 `base: './'` 的可搬迁构建）。修复为 `transformHead` 中按 base 动态拼接；定位过程中还确认了正确的上下文字段是 `ctx.siteData.base`，`ctx.siteConfig` 中并无 `base`（曾因此产出 `undefinedfavicon.svg`）。修复后两种 base 场景均正确且标签位于 `<head>` 内。
  - 同步修正：`.automation/verify-base.ps1` 原先硬编码 `/ckj_blog/`，已改为从 `git remote` 自动推导仓库名，避免仓库改名后脚本失效。
  - **未解问题（如实记录，未标记为已验证）**：`push` 到 `main` **不会触发** workflow 运行。实测证据：①首次推送与后续两次推送（含一次空提交）均未产生 `event=push` 的运行，`total_count` 始终只有手动派发的那一次；②已通过 API 逐一排除常见原因 —— `actions/permissions` 为 `enabled: true, allowed_actions: all`、workflow `state=active` 且 `path` 正确、远端 `deploy.yml` 的 `on.push.branches=[main]` 解析正常、无分支保护规则（404）、推送确认落地（远端 HEAD 与本地一致）。③推送所用凭据为 GitHub 官方凭据管理器（`x-oauth-client-id: 0120e057bd645470c1ed`，标准 OAuth app，`repo`+`workflow` scope），理论上属不应被抑制的类型。**根因未确认，需在仓库页面排查**（Settings → Actions → General，以及 Actions 页签是否有提示横幅）。当前部署依赖 `workflow_dispatch`：既可在 Actions 页签点 "Run workflow"，也可由 API 派发；本次两次成功部署（`37643406741`、`37645958368`）均由此触发。
  - 另一处修正：验收脚本的侧边栏断言存在 flaky —— `networkidle` 可能早于客户端 hydration 完成，导致远端环境下找不到 `.caret`。已改为显式 `waitForSelector`，线上连跑 3 次均 22/22 通过且零控制台错误。

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
