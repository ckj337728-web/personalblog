# debug-task.md —— 移动端问题修复任务清单

> 依据：[debug.md](./debug.md)（移动端两个问题的排查记录）
> 状态标记：`[ ]` 未完成 / `[×]` 已完成
> **范围约束**：只修 debug.md 中已确证的问题。**复用现有架构与文件，不做无关重构，不新增 spec 未要求的功能。**

---

## 关键前提（开工前必读）

1. **目标缺陷只在「部署到子路径」时出现**（线上 `base = /personalblog/`）。
   本地 `npm run docs:dev` 的 `base` 是 `/`，**永远复现不出该缺陷** —— 这正是它长期未被发现的原因。所有验证必须显式使用子路径 base。
2. **必须用真实浏览器点击验证，不能只查 HTML**。debug.md 已证明：此前的链接校验是 HTTP 直连，漏掉了"客户端路由点击"这条路径。
3. **子路径 base 的构造方式**（已实测可行）：
   `$env:VITEPRESS_BASE='/personalblog/'; npm run docs:build`，预览为 `http://localhost:4173/personalblog/`。

---

## 阶段一：基础准备

### 1.1 清理重复文件（先做，避免干扰后续链接验证）

- [×] **T-D1 删除重复文件 `my-first-post - 副本.md`**
  - 目标文件：`docs/blog/my-first-post - 副本.md`
  - 已核实：与 `my-first-post.md` **MD5 完全相同**（`BAAF8C5949379C7CE67FB330BC870AED`），来源为提交 `7dc8bfe`，已在远端。
  - 完成标准：文件从工作区删除，且后续提交中包含该删除（`git status` 显示 deleted、提交后 `git ls-files` 中不再有该文件）。
  - 执行记录：删除前核对绝对路径并确认位于 `docs/blog/` 下才执行。`git status` 显示 ` D "docs/blog/my-first-post - \345\211\257\346\234\254.md"`。

- [×] **T-D2 移除侧边栏中指向该副本的条目**
  - 目标文件：`docs/.vitepress/config.ts` **第 267 行**
    ```ts
    { text: '我的第一篇测试文章', link: '/blog/my-first-post - 副本' },
    ```
  - 为什么要删：与 `my-first-post` 那条**标题完全相同**，导致侧边栏出现两个同名条目；且删除源文件后它会变成死链 —— 而 `ignoreDeadLinks` 保持默认 `false`，**死链会让构建直接失败**。
  - 完成标准：该行被删除；`config.ts` 中不再出现「副本」字样。
  - 执行记录：已删除该行（该行原为 `items` 最后一项，其上一行不需要补逗号）。复验 `config.ts` 中已无「副本」字样，改动范围仅此文件。

- [×] **T-D3 重建并确认条目数回落**
  - 执行：默认 base 下执行 `npm run docs:build`，检查产物 `docs/.vitepress/dist/blog/index.html` 的正文列表与侧边栏。
  - 完成标准：博客文章列表由 **3 条**回到 **2 条**；侧边栏 `/blog/` 分组只剩 2 条文章条目；产物中不再生成 `my-first-post - 副本.html`；构建退出码 0 且无 dead link 报错。
  - 执行记录（6 项检查全部通过）：
    1. 构建退出码 0（17.79s），**无 dead link 报错**；
    2. 产物中**不再生成** `my-first-post - 副本.html`；
    3. `dist/blog/` 仅剩 `index.html`、`my-first-post.html`、`vitepress-math-silent-failure.html`；
    4. 正文文章列表 **3 条 → 2 条**；
    5. 侧边栏 `/blog/` 分组文章条目 **2 条**，指向副本的链接 **0 条**；
    6. 全站扫描：`docs/` 下无「副本」文件、配置中无「副本」引用、侧边栏重复标题数 **0**。
  - 回归确认：`.automation/verify-final.cjs` 终检 **9/9 PASS**（页面数 26→25，正是删掉的那一页）；`.automation/verify-base.ps1` 双 base 场景 **OVERALL: PASS**（各 1156 项资源引用，缺失 0、前缀错误 0）。

### 1.2 用户确认（可与阶段二起的工作并行等待，不阻塞 T-D5）

- [×] **T-D4 收集三个必要答复**
  - 需要答复：
    1. 手机系统主题是**深色还是浅色**？
    2. 当时在**哪里**点的明暗切换：顶部太阳/月亮图标，还是汉堡菜单里的「外观」？
    3. 点 404 那次是列表里**第几条**？（第一条是「副本」，第二条才是正常文章）
  - 完成标准：三个问题均得到明确答复，并据此决定阶段五的两个任务是否需要实施。
  - 执行记录（用户答复）：
    1. 手机系统主题 → **深色**；
    2. 点切换的位置 → **汉堡菜单里的「外观」**；
    3. 404 的点位 → 答复为「文章列表里的**三条点开都是 404**」。
  - **第 3 问的答复修正了此前的范围判断**：debug.md 原先只记录"某一条"缺前缀。经全路径实测确证 —— **文章列表的 3 条链接全部缺 `/personalblog/` 前缀**（均来自 `BlogList.vue` 的裸 `<a>`），而「汉堡菜单→技术博客」「侧边栏→文章」「直接输入地址」三种路径**均正常**。故"三条都 404"准确，缺陷范围就是 `BlogList.vue` 一个组件。完整证据已补入 `debug.md` 第 1.5 节。

---

## 阶段二：功能实现

- [×] **T-D5 修复博客文章列表链接缺少 base 前缀**
  - 目标文件：`docs/.vitepress/theme/BlogList.vue`
  - 现状（已核实，第 16 行）：使用原生 `<a :href="post.url">`
    ```vue
    <a :href="post.url">{{ post.title }}</a>
    ```
  - 根因：`post.url` 由 `blog.data.ts` 提供，值为 `/blog/xxx`（**不含 base，设计上正确**）；而 VitePress 只会为 Markdown 链接与链接组件自动补 base 前缀，**不处理组件里的裸 `<a href>`**，所以部署到子路径后指向了站点根 → 404。
  - 修复方向：**优先复用 VitePress 官方导出的 `withBase()` 工具函数**（其文档注释为 "Append base to internal (non-relative) urls"），即 `<a :href="withBase(post.url)">`。
  - **实施注意（重要）**：`withBase` 已确认由 `vitepress` 主入口导出（类型定义与客户端入口均可查证），但**在 Node ESM 下直接 `import` 会报 "does not provide an export named"** —— 因为 Node 解析到的是 Node 入口。组件中导入走的是客户端入口（项目现有 `SiteFooter.vue` 成功导入 `useData` 即为佐证），默认可行，但**实施后必须用 T-D6 的构建结果确认导入有效**；若构建报错，则改用备选方案（在组件内通过 `useData().site.value.base` 自行拼接）。
  - 完成标准：`BlogList.vue` 不再直接输出未加 base 的 `href`；文件内改动**仅限于链接 href 的生成方式**，不引入新依赖、不重写组件结构、不调整样式。
  - **执行记录**：
    - 采用方案 A：在 `<script setup>` 中 `import { withBase } from 'vitepress'`，模板改为 `<a :href="withBase(post.url)">`，并补充说明性注释（为何必须经 `withBase` 处理）。
    - **导入有效性已确认**：默认 base 与子路径 base 两种构建均 **退出码 0**，未出现 "does not provide an export named" 报错 —— 证明组件内导入走客户端入口可行，备选方案无需启用。
    - **改动范围核对**（`git diff --numstat` = `7 1`，即 7 增 1 删）：
      - 新增 1 行 `import`、1 处 `withBase()` 调用、6 行注释；
      - **`<style>` 段零改动**；
      - **`package.json` 与 `package-lock.json` 零改动**（未新增依赖）；
      - 未改动组件结构、未改动 `blog.data.ts`。
    - **浏览器实测（子路径预览 `http://localhost:4173/personalblog/`，iPhone 13 模拟，实际点击）**：
      | 条目 | href | 点击结果 | URL |
      | --- | --- | --- | --- |
      | 第 1 条 | `/personalblog/blog/my-first-post.html` | ✅ 正常 | `.../personalblog/blog/my-first-post.html`（标题正确） |
      | 第 2 条 | `/personalblog/blog/vitepress-math-silent-failure.html` | ✅ 正常 | `.../personalblog/blog/vitepress-math-silent-failure.html`（标题正确） |
      两条均**保持 `/personalblog/` 前缀、无 404**。
    - **回归**：`.automation/verify-features.cjs` 在子路径下 **22/22 PASS**、控制台错误 0、失败请求 0；`.automation/verify-final.cjs` **9/9 PASS**。
    - **实施环境记录（避免后续踩坑）**：`docs:preview` 必须与 dist **同 base** 启动，否则预览以 `base=/` 加载站点，而产物内的 `/personalblog/assets/...` 全部 404，页面无 JS、列表为空，会误判为"修复无效"。正确启动方式：`$env:VITEPRESS_BASE='/personalblog/'; npm run docs:preview`。

---

## 阶段三：测试与验收

- [ ] **T-D6 子路径构建下核对产物链接**
  - 执行：以 `VITEPRESS_BASE=/personalblog/` 构建后，检查 `docs/.vitepress/dist/blog/index.html` 正文列表的链接。
  - 完成标准：列表内 **3 条链接全部以 `/personalblog/` 开头**，且与同一页面内 VitePress 自身生成的链接前缀一致。

- [ ] **T-D7 真实浏览器点击验证（关键项，不可用 HTTP 直连替代）**
  - 执行：`npm run docs:preview` 后，用移动端模拟（iPhone 尺寸）访问 `http://localhost:4173/personalblog/blog/`。
  - 操作：**实际点击**列表内每一条链接。
  - 完成标准：每次点击后 URL 均保持在 `/personalblog/` 前缀下、页面标题为对应文章标题、**不出现 404 页面**。

- [ ] **T-D8 线上验证**
  - 执行：提交并推送（推送后自动部署），访问 `https://ckj337728-web.github.io/personalblog/blog/`。
  - 完成标准：移动端模拟下点击列表内每一条链接均正常打开；地址栏不再出现缺少 `/personalblog/` 的 URL。

- [ ] **T-D9 补充测试盲区：给验收脚本增加「博客列表点击」断言**
  - 目标文件：`.automation/verify-features.cjs`
  - 现状（已核实）：脚本覆盖了导航、侧边栏、大纲、代码块、搜索等，**未覆盖博客文章列表链接** —— 这正是 T-D5 缺陷长期未被发现的原因。
  - 新增断言：取出列表内每条链接 → 校验其 href 含当前 base 前缀 → **实际点击**并确认目标页标题正确、无 404。
  - 完成标准：断言**有效性可证** —— 对修复前的代码会失败（`FAIL`），对修复后的代码通过（`PASS`）。若两种情况下结果相同，说明断言无效，需重写。
  - 说明：本任务只**新增断言**，不修改脚本既有逻辑与既通过项。

- [ ] **T-D10 扩大子路径校验范围至页面内链接**
  - 目标文件：`.automation/verify-base.ps1`
  - 现状（已核实，第 42 行）：正则仅匹配 `/assets/` 与 `/images/`，**只校验静态资源，不校验页面内链接**。
  - 完成标准：子路径场景下同时校验页面内链接（如 `/blog/xxx.html`）的前缀正确性；`verify-base.ps1` 两个场景仍全部 `PASS`。

---

## 阶段四：回归验收

- [ ] **T-R1 默认 base 构建通过**
  - 执行：`npm run docs:build`。
  - 完成标准：退出码 0；构建输出中无 dead link 报错、无 `Build failed`。

- [ ] **T-R2 功能断言全部通过**
  - 执行：`docs:preview` 后运行 `.automation/verify-features.cjs`（默认 base）。
  - 完成标准：原有 22 项 + T-D9 新增断言**全部 PASS，失败数 0**；控制台错误 0、页面异常 0。

- [ ] **T-R3 终检全部通过**
  - 执行：运行 `.automation/verify-final.cjs`。
  - 完成标准：断链、内容规范、目录结构、交付物、禁用项各项**全部 PASS，失败数 0**。

- [ ] **T-R4 双 base 场景通过**
  - 执行：运行 `.automation/verify-base.ps1`。
  - 完成标准：`OVERALL: PASS`，两个场景的 `RESULT: PASS`，资源引用缺失数与前缀错误数均为 0。

- [ ] **T-R5 线上回归通过**
  - 执行：对 `https://ckj337728-web.github.io/personalblog` 运行 `.automation/verify-features.cjs`（移动端模拟）。
  - 完成标准：全部断言 PASS；`失败请求(>=400)` 为 **0**；点击博客文章列表不再出现 404。

- [ ] **T-R6 确认改动范围符合约束**
  - 执行：对比改动前后的 `package.json` 与 `docs/.vitepress/theme/` 目录；并用 `git diff --stat` 检视本次全部改动。
  - 完成标准：
    - `package.json` 依赖项数量与内容**均无变化**；
    - `docs/.vitepress/theme/` 下**无新增文件**（仅修改既有文件）；
    - `git diff` 中不出现与本次缺陷无关的文件改动。

---

## 阶段五：待用户答复后决定（当前不实施）

> 这两项在 debug.md 中已确证为「**功能正常、体验待议**」，不是缺陷。修复与否取决于阶段一 T-D4 的答复。
> **T-D4 的答复已收到**（见阶段一 1.2 的执行记录），两项的判定结论如下。

- [×] **T-D11 移动端外观开关不易发现 —— 判定：不成立，无需改代码**
  - 目标：`docs/.vitepress/theme/` 与配置中的外观入口（**仅在判定需要调整时才动**），或 `如何测试.md` 的使用说明。
  - 已确证：移动端 2 个外观开关初始均不可见，唯一可用者位于汉堡菜单**最底部**（844px 屏上 y=365），开关较小、标签「外观」较抽象。
  - 已确证：**切换功能本身完全正常**（body 亮度 255 → 27.3，差 227.7，有截图佐证）。
  - 判定依据：若答复为"没找到开关" → 需评估是否调整入口或文案；若答复为"找到了但觉得没用" → 应优先排查 T-D12。
  - **判定结论**：用户答复为「**在汉堡菜单里点的「外观」**」，即**开关已被找到并成功点击**。故"不易发现"这一原因**不成立**，无需调整入口或改代码；真正让用户产生"没差别"观感的是 T-D12 的方向问题。
  - 完成标准：依据答复得出结论并记录；若判定为"预期行为仅需指引"，则改为更新 `如何测试.md` 说明，**不改代码**。
  - 执行记录：结论为「不成立，不改代码」。开关位置虽深但仍可发现，暂不调整（避免无关改动）。

- [×] **T-D12 「自动」模式下系统深色时切换方向与直觉相反 —— 判定：成立，属预期行为，用说明解决**
  - 目标：默认外观设置（`docs/.vitepress/config.ts` 的 `appearance` 项）或 `如何测试.md` 的使用说明。
  - 已确证：手机系统为深色且网站设置为默认「自动」时，网站**初始即为暗色**；此时点一次开关会变成**亮色**，与"我要切到暗色"的直觉相反。
  - 判定依据：若答复为"手机是深色" → 这属于**预期行为**，宜通过在 `如何测试.md` 中说明「网站默认跟随系统主题」来解决，**而非改代码**；若答复为"手机是浅色" → 需要重新排查，因为该情形下不应出现"没差别"。
  - **判定结论**：用户答复为「手机系统主题是**深色**」→ **符合"预期行为"分支**。网站默认 `appearance: true`（跟随系统），因此打开时已是暗色；点一下变亮色，与直觉相反，被感知为"切换没差别"。
  - 完成标准：依据答复得出结论并记录；结论必须附改动前 vs 改动后的对比验证数据（如 `--vp-c-bg` 取值变化）。
  - 执行记录（对比数据，均为线上实测）：
    | 状态 | html class | `--vp-c-bg` | body 亮度 |
    | --- | --- | --- | --- |
    | 系统深色 + 默认「自动」 | `dark` | `#1b1b1f` | 27.3 |
    | 点击一次开关后 | `""`（亮色） | `#ffffff` | 255 |
    | 再点一次 | `dark` | `#1b1b1f` | 27.3 |
    结论：功能正常，**方向与直觉相反**是主因。处理方式为在 `如何测试.md` 中补充「网站默认跟随系统主题」的说明，**不修改 `appearance` 默认值**（改默认值会违背站点既有外观策略，属无关改动）。
  - **待办移交**：该说明的补充属阶段五范围内的文档改动，可在阶段二~四完成后一并处理。

---

## 实施顺序（依赖关系）

```
阶段一 基础准备
  T-D1 → T-D2 → T-D3          （清副本，必须先做，否则干扰链接验证）
  T-D4                          （并行等待用户答复，不阻塞下面）

阶段二 功能实现
  T-D5                          （唯一需要改代码的任务）

阶段三 测试与验收
  T-D6 → T-D7 → T-D8            （产物 → 浏览器 → 线上，逐级验证）
  T-D9 → T-D10                  （补测试盲区，防止复发）

阶段四 回归验收
  T-R1 → T-R2 → T-R3 → T-R4 → T-R5 → T-R6

阶段五 待答复
  T-D4 答复 ──→ T-D11 / T-D12   （未答复前不动手）
```

**关键路径**：T-D1 → T-D5 → T-D6 → T-D7 → T-D8（清副本 → 修链接 → 三级验证）
