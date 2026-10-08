import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { katex } from '@mdit/plugin-katex'

// 说明：spec 4.2 要求"文章页底部有版权/更新时间/Git 最后提交时间"。
// VitePress 默认主题的 themeConfig.footer 在侧边栏可见时不渲染，无法满足该要求，
// 故页脚统一由 docs/.vitepress/theme/index.ts 的 layout-bottom 插槽实现（见 T6.3），
// 此处不配置 themeConfig.footer，避免出现两套页脚。
export default withMermaid(
  defineConfig({
    // ------------------------------------------------------------------
    // T3.1 站点基础元信息
    // ------------------------------------------------------------------
    lang: 'zh-CN',
    title: '个人技术博客 & 知识库',
    description: '工程师个人技术博客与永久知识库：学习存档、求职展示、公开查阅。',

    // 部署路径说明（重要）：base 必须与部署位置严格一致，否则 CSS/JS/搜索索引会 404。
    //   GitHub 项目页 https://<user>.github.io/ckj_blog/  → base: '/ckj_blog/'
    //   GitHub 用户页 / 自定义域名 / Vercel            → base: '/'
    // 这里用环境变量驱动，使两种场景都不需要改代码：
    //   - 本地 npm run docs:dev / docs:build：不带变量 → base '/'
    //   - GitHub Actions 工作流：注入 VITEPRESS_BASE=/<仓库名>/ → 自动匹配项目页
    // 若你的仓库名不是 ckj_blog，请同步修改 .github/workflows/deploy.yml 中的 VITEPRESS_BASE。
    base: process.env.VITEPRESS_BASE || '/',

    // favicon 通过 transformHead 注入 <head>。
    // 为什么不在 head 选项里直接写 '/favicon.svg'：VitePress 不会为 head 中手写的
    // 绝对路径自动补 base 前缀，部署到子路径（GitHub Pages 项目页 /personalblog/）
    // 后会请求站点根下的 /favicon.svg 而 404。这里用 base 动态拼接，两种部署都正确。
    // 注意：base 位于 ctx.siteData.base，ctx.siteConfig 中没有该字段（实测确认）。
    transformHead: ({ siteData }) => [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: `${siteData.base}favicon.svg` }]
    ],

    // ------------------------------------------------------------------
    // T3.3 亮色 / 暗色模式
    // ------------------------------------------------------------------
    // true = 默认跟随系统偏好，右上角提供手动切换按钮（spec 4.1）。
    appearance: true,

    // ------------------------------------------------------------------
    // T3.6 Git 最后更新时间
    // ------------------------------------------------------------------
    // 取每个 Markdown 文件最近一次 Git 提交时间；要求文件已提交到 Git，
    // 且 CI 中 checkout 需 fetch-depth: 0（见 T7.2），否则全站时间会相同。
    lastUpdated: true,

    // ------------------------------------------------------------------
    // T3.4 Markdown 能力
    // ------------------------------------------------------------------
    markdown: {
      // 代码块行号（spec 4.2）；单块可用 :no-line-numbers 覆盖。
      lineNumbers: true,

      // LaTeX 公式（spec 2）。
      // 注意：不能用 markdown-it-mathjax3@4（异步插件）。vitepress 1.6.4 不依赖
      // markdown-it-async，渲染链是同步的，异步插件的 Promise 不会被 await，
      // 公式会被静默丢弃（连纯文本回退都没有），构建仍报成功 —— 属隐性故障。
      // @mdit/plugin-katex 为同步插件，peer 为 markdown-it ^14，与 1.6.4 一致。
      config: (md) => {
        md.use(katex)
      },

      // 自定义容器中文标签（spec 5：全站中文书写）。
      container: {
        tipLabel: '提示',
        warningLabel: '警告',
        dangerLabel: '危险',
        infoLabel: '信息',
        detailsLabel: '详细信息'
      }
    },

    // ------------------------------------------------------------------
    // 开发模式依赖互操作（修复 dev 下应用无法挂载的问题）
    // ------------------------------------------------------------------
    // 现象：npm run docs:dev 打开页面全站空白，#app 无任何子节点。
    // 根因：mermaid 用到的 fastdom@1.x 是纯 CommonJS 包（package.json 无 module
    //   字段、无 exports 映射），且其扩展文件 fastdom/extensions/fastdom-promised.js
    //   也是 CJS。Vite 开发服务器把它们当 ESM 原样返回，浏览器报
    //   "does not provide an export named 'default'"，模块加载失败导致应用不挂载。
    //   生产构建走 Rollup + commonjs 插件，因此 docs:build 正常 —— 属 dev 与 build 差异。
    // 修复：用别名把这两个模块指向具体文件，并加入预打包列表，由 Vite 做 CJS→ESM 互操作。
    //   别名必须指向文件，指向目录无法解析（该包没有 exports 映射）。
    resolve: {
      alias: [
        { find: /^fastdom$/, replacement: 'fastdom/fastdom.js' },
        { find: /^fastdom\/extensions\/fastdom-promised$/, replacement: 'fastdom/extensions/fastdom-promised.js' }
      ]
    },
    vite: {
      optimizeDeps: {
        include: ['fastdom', 'fastdom/extensions/fastdom-promised.js']
      }
    },

    // ------------------------------------------------------------------
    // Mermaid 配置（spec 2 要求支持 Mermaid 流程图）
    // ------------------------------------------------------------------
    mermaid: {
      // 用 neutral 主题替代默认的彩色配色，降低饱和度以贴近极简黑白灰风格（spec 4.1）。
      // 说明：neutral 主题并非完全无彩色，只是饱和度最低；Mermaid 无法做到纯灰度。
      theme: 'neutral'
    },

    themeConfig: {
      // ----------------------------------------------------------------
      // T6.3 全站页脚文案（spec 4.2：底部版权、更新时间、Git 最后提交时间）
      // ----------------------------------------------------------------
      // 注意：此处的 footer 不是默认主题页脚（它在侧边栏可见时不渲染，
      // 无法覆盖文章页），而是作为 SiteFooter.vue 的数据源存在；
      // 默认页脚已由 custom.css 隐藏，全站页脚统一由 SiteFooter 输出。
      footer: {
        message: '内容以学习与记录为目的，持续更新中。',
        copyright: 'Copyright © 2026-present CKJ'
      },

      // ----------------------------------------------------------------
      // T3.6 最后更新时间文案（spec 4.2 要求展示 Git 最后提交时间）
      // ----------------------------------------------------------------
      // 默认英文为 "Last updated:"，全站中文书写（spec 5），故覆盖为中文。
      lastUpdated: {
        text: '最后更新于'
      },

      // ----------------------------------------------------------------
      // T3.2 全文搜索（spec 4.2 核心必备）
      // ----------------------------------------------------------------
      // 纯静态本地索引（minisearch），不依赖任何第三方服务，满足 spec 6.3 可迁移性。
      search: {
        provider: 'local',
        options: {
          // 中文检索修正（必需）：
          // minisearch 默认按空白/标点切词，中文无空格 → 「三次握手」被当成一个 token，
          // 导致查询「握手」命中 0 条（实测确认）。全站中文内容下等于搜索不可用。
          // 这里为 CJK 增加字符级切分，并把多词匹配语义改为 AND：
          //   字符级切分后中文查询会拆成多个单字，若沿用默认 OR，只要任一字出现即命中，
          //   会产生大量噪音（实测「量子计算机」这类无关词也会返回 12 条）。
          //   AND 要求所有字都出现，实测召回不降、噪音清零、结果数更精确。
          // ASCII（代码、TIME_WAIT、TCP）分词逻辑不变。
          miniSearch: {
            options: {
              tokenize: (text) => text.match(/[\u3400-\u9fff]|[A-Za-z0-9_]+/g) || [],
              processTerm: (term) => {
                const t = term.toLowerCase()
                // 丢弃单字符的非 CJK 词（如 "a"、"1"），减少噪音；中文单字保留。
                return t.length > 1 || /[\u3400-\u9fff]/.test(t) ? t : false
              }
            },
            searchOptions: {
              combineWith: 'AND'
            }
          },
          locales: {
            root: {
              translations: {
                button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
                modal: {
                  displayDetails: '显示详细列表',
                  resetButtonTitle: '重置搜索',
                  backButtonTitle: '关闭搜索',
                  noResultsText: '没有找到相关结果',
                  footer: {
                    selectText: '选择',
                    selectKeyAriaLabel: '回车',
                    navigateText: '切换',
                    navigateUpKeyAriaLabel: '上箭头',
                    navigateDownKeyAriaLabel: '下箭头',
                    closeText: '关闭',
                    closeKeyAriaLabel: 'Esc'
                  }
                }
              }
            }
          }
        }
      },

      // ----------------------------------------------------------------
      // 内置界面文案中文化
      // ----------------------------------------------------------------
      // vitepress 1.6.4 没有 zh-CN 内置语言包（不随 lang 自动切换），
      // 默认输出英文（"On this page" / "Previous page" / "Menu" 等）。
      // 全站中文书写（spec 5），故逐项覆盖以下内置文案。
      outline: {
        label: '本页目录',
        // 展示到三级标题，与 spec 5「标题层级严格」对应。
        level: [2, 3]
      },
      docFooter: {
        prev: '上一篇',
        next: '下一篇'
      },
      sidebarMenuLabel: '目录',
      returnToTopLabel: '回到顶部',
      darkModeSwitchLabel: '外观',
      lightModeSwitchTitle: '切换到亮色模式',
      darkModeSwitchTitle: '切换到暗色模式',
      // 键盘聚焦时才可见的"跳到正文"链接，默认英文 "Skip to content"。
      skipToContentLabel: '跳到正文',
      // 说明：导航栏屏幕阅读器标签 "Main Navigation" 为组件内硬编码，
      // vitepress 1.6.4 未提供配置项，无法通过配置中文化，属上游限制（不影响可见文案）。

      // ----------------------------------------------------------------
      // T4.1 顶部导航栏（spec 3.1，顺序与文案固定）
      // ----------------------------------------------------------------
      nav: [
        { text: '首页', link: '/' },
        { text: '知识库', link: '/knowledge/' },
        { text: '技术博客', link: '/blog/' },
        { text: '项目实践', link: '/projects/' },
        { text: '关于我', link: '/about' }
      ],

      // ----------------------------------------------------------------
      // T4.2 / T4.3 知识库侧边栏 = spec 3.2 的 7 大分类骨架
      // ----------------------------------------------------------------
      // 顺序严格 01→07；01 与 05 下的子分类做二级嵌套。
      // collapsed: false 让分组默认展开（spec 4.2 要求可折叠/展开，折叠交互由主题提供）。
      // 条目 text 与磁盘目录名保持一致，便于对照维护。
      sidebar: {
        '/knowledge/': [
          {
            text: '知识库',
            items: [
              {
                text: '01-计算机基础',
                collapsed: false,
                items: [
                  { text: '计算机网络', link: '/knowledge/01-计算机基础/计算机网络/' },
                  { text: 'TCP 三次握手与四次挥手', link: '/knowledge/01-计算机基础/计算机网络/tcp-handshake' },
                  { text: '操作系统', link: '/knowledge/01-计算机基础/操作系统/' },
                  { text: '数据结构与算法', link: '/knowledge/01-计算机基础/数据结构与算法/' }
                ]
              },
              { text: '02-Linux运维与底层', link: '/knowledge/02-Linux运维与底层/' },
              { text: '03-C与C++编程笔记', link: '/knowledge/03-C与C++编程笔记/' },
              { text: '04-前端工程化', link: '/knowledge/04-前端工程化/' },
              {
                text: '05-AI与LLM学习',
                collapsed: false,
                items: [
                  { text: '大模型基础', link: '/knowledge/05-AI与LLM学习/大模型基础/' },
                  { text: '自注意力到 Transformer', link: '/knowledge/05-AI与LLM学习/大模型基础/attention-mechanism' },
                  { text: 'Agent智能体', link: '/knowledge/05-AI与LLM学习/Agent智能体/' },
                  { text: 'Harness与沙箱与评测体系', link: '/knowledge/05-AI与LLM学习/Harness与沙箱与评测体系/' },
                  { text: 'Prompt工程', link: '/knowledge/05-AI与LLM学习/Prompt工程/' }
                ]
              },
              { text: '06-开源项目研读', link: '/knowledge/06-开源项目研读/' },
              { text: '07-工具教程与踩坑记录', link: '/knowledge/07-工具教程与踩坑记录/' }
            ]
          }
        ],

        // --------------------------------------------------------------
        // T4.4 博客与项目实践侧边栏
        // --------------------------------------------------------------
        '/blog/': [
          {
            text: '技术博客',
            items: [
              { text: '文章列表', link: '/blog/' },
              { text: 'LaTeX 公式被静默丢弃', link: '/blog/vitepress-math-silent-failure' },
              { text: '我的第一篇测试文章', link: '/blog/my-first-post' }
              // 后续新增文章在此登记（按日期倒序）。
            ]
          }
        ],
        '/projects/': [
          {
            text: '项目实践',
            items: [{ text: '项目列表', link: '/projects/' }]
          }
        ]
      }
      // T4.6 首页文案在 docs/index.md 中实现（极简，不使用 hero/features 组件）。
    }
  })
)
