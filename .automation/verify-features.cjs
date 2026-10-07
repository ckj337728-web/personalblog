/**
 * Phase 8 acceptance script (T8.1 / T8.2): same assertion set against a running site.
 *
 * Usage:
 *   node .automation/verify-features.cjs <baseUrl> <basePath> <outDir> [--shots]
 * Example:
 *   node .automation/verify-features.cjs http://localhost:5173 / .automation/shots-dev --shots
 *
 * The site is served at <baseUrl><basePath>, so both dev (base '/') and a
 * project-page base can be verified with the same checks.
 */
const path = require('path')
const fs = require('fs')

const PLAYWRIGHT = path.join(
  process.env.LOCALAPPDATA || '',
  'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core'
)
const { chromium } = require(PLAYWRIGHT)

const [, , BASE_URL = 'http://localhost:4173', BASE_PATH = '/', OUT_DIR = '.automation/shots', ...flags] = process.argv
const WANT_SHOTS = flags.includes('--shots')

const ARTICLE = 'knowledge/01-计算机基础/计算机网络/tcp-handshake'
const MATH_ARTICLE = 'knowledge/05-AI与LLM学习/大模型基础/attention-mechanism'
const BLOG_ARTICLE = 'blog/vitepress-math-silent-failure'

function join(p) {
  const base = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/'
  return BASE_URL + base + p.replace(/^\//, '')
}

const results = []
function check(name, pass, detail = '') {
  results.push({ name, pass: !!pass, detail })
}

;(async () => {
  if (WANT_SHOTS) fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ channel: 'chromium' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`) })

  // ---------- home ----------
  await page.goto(join(''), { waitUntil: 'networkidle' })
  check('首页打开', await page.title() !== '')

  // nav: 5 items, exact text + order (spec 3.1)
  const nav = await page.$$eval('.VPNavBarMenuLink', (els) =>
    els.map((e) => ({ text: e.textContent.trim(), href: e.getAttribute('href') }))
  )
  const expectedNav = ['首页', '知识库', '技术博客', '项目实践', '关于我']
  check(
    '导航 5 项文案与顺序 (spec 3.1)',
    nav.length === 5 && nav.every((n, i) => n.text === expectedNav[i]),
    nav.map((n) => n.text).join(' / ')
  )

  // home content: four blocks (spec 7)
  // The home page uses the plain layout, so .vp-doc is absent; read body text instead.
  const homeText = await page.evaluate(() => document.body.innerText)
  check('首页四项内容齐备 (spec 7)', ['个人简介', '站点定位', '快速入口', '最近更新'].every((t) => homeText.includes(t)))

  // ---------- article ----------
  await page.goto(join(ARTICLE), { waitUntil: 'networkidle' })

  // sidebar: 7 categories in order
  const sidebar = await page.$$eval('.VPSidebarItem .text', (els) => els.map((e) => e.textContent.trim()))
  const cats = sidebar.filter((t) => /^0[1-7]-/.test(t))
  check('侧边栏 7 大分类顺序 01-07 (spec 3.2)', cats.length === 7 && cats[0].startsWith('01-') && cats[6].startsWith('07-'), cats.join(' '))

  // sidebar collapse toggle works.
  // VitePress animates the nested container to height 0 and adds a `collapsed`
  // class; it does NOT remove the child nodes. Counting DOM nodes therefore
  // cannot detect the toggle -- measure the container height instead.
  const measureSidebar = () =>
    page.evaluate(() => {
      const group = document.querySelector('.VPSidebarItem.level-1.collapsible')
      const items = group?.querySelector(':scope > .items')
      return {
        collapsed: group ? group.classList.contains('collapsed') : null,
        itemsHeight: items ? Math.round(items.getBoundingClientRect().height) : -1,
        visibleLevel2: Array.from(document.querySelectorAll('.VPSidebarItem.level-2')).filter(
          (e) => e.getBoundingClientRect().height > 1
        ).length
      }
    })

  const beforeCollapse = await measureSidebar()
  await page.locator('.VPSidebarItem.level-1.collapsible > .item > .caret').first().click()
  await page.waitForTimeout(700)
  const afterCollapse = await measureSidebar()
  check(
    '侧边栏分组可折叠 (spec 4.2)',
    beforeCollapse.collapsed === false &&
      afterCollapse.collapsed === true &&
      afterCollapse.itemsHeight === 0 &&
      afterCollapse.visibleLevel2 < beforeCollapse.visibleLevel2,
    `collapsed ${beforeCollapse.collapsed}->${afterCollapse.collapsed}, 高度 ${beforeCollapse.itemsHeight}->${afterCollapse.itemsHeight}, 可见子项 ${beforeCollapse.visibleLevel2}->${afterCollapse.visibleLevel2}`
  )

  // expand again and confirm it restores
  await page.locator('.VPSidebarItem.level-1.collapsible > .item > .caret').first().click()
  await page.waitForTimeout(700)
  const reExpanded = await measureSidebar()
  check(
    '侧边栏分组可再次展开 (spec 4.2)',
    reExpanded.collapsed === false && reExpanded.visibleLevel2 === beforeCollapse.visibleLevel2,
    `高度恢复到 ${reExpanded.itemsHeight}, 可见子项 ${reExpanded.visibleLevel2}`
  )

  // outline
  const outline = await page.$$eval('.VPDocAsideOutline a', (els) => els.map((e) => e.textContent.trim()))
  check('右侧大纲存在且含 h2/h3 (spec 4.2)', outline.length >= 3, `${outline.length} 条`)

  // code block: highlight / line numbers / copy
  const code = await page.evaluate(() => {
    const b = document.querySelector('.vp-doc div[class*="language-"]')
    return b ? {
      shiki: !!b.querySelector('.shiki'),
      lines: !!b.querySelector('.line-numbers-wrapper'),
      copy: !!b.querySelector('button.copy')
    } : null
  })
  check('代码高亮 + 行号 + 复制按钮 (spec 4.2)', code && code.shiki && code.lines && code.copy, JSON.stringify(code))

  // copy actually writes to clipboard
  let clipOk = false
  try {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.locator('.vp-doc div[class*="language-"] button.copy').first().click()
    await page.waitForTimeout(300)
    const txt = await page.evaluate(() => navigator.clipboard.readText())
    clipOk = typeof txt === 'string' && txt.length > 10
  } catch (e) { clipOk = false }
  check('复制按钮实际写入剪贴板', clipOk)

  // mermaid rendered as diagram
  const mermaid = await page.evaluate(() => {
    const m = document.querySelector('.mermaid')
    return m ? { exists: true, svg: !!m.querySelector('svg') } : { exists: false, svg: false }
  })
  check('Mermaid 渲染为图形（非代码块）', mermaid.exists && mermaid.svg, JSON.stringify(mermaid));

  // katex formula on article 1
  const katex1 = await page.locator('.katex').count()
  check('LaTeX 公式渲染 (文章1)', katex1 > 0, `${katex1} 个`)

  // footer: 3 items
  const footer = await page.evaluate(() => {
    const f = document.querySelector('.site-footer')
    if (!f) return null
    return {
      visible: f.getBoundingClientRect().height > 0,
      copyright: /Copyright/.test(f.textContent),
      updated: /本页最后提交于\s*\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(f.textContent),
      defaultHidden: getComputedStyle(document.querySelector('.VPFooter')).display === 'none'
    }
  })
  check('页脚：版权 (spec 4.2)', footer && footer.copyright)
  check('页脚：Git 最后提交时间非空 (spec 4.2)', footer && footer.updated)
  check('页脚在文章页可见且无重复 (spec 4.2)', footer && footer.visible && footer.defaultHidden)

  // dark mode toggle via UI
  const darkBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  await page.locator('.VPSwitchAppearance').first().click()
  await page.waitForTimeout(400)
  const darkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  check('暗色模式可通过界面切换 (spec 4.1)', darkBefore !== darkAfter, `${darkBefore} -> ${darkAfter}`)
  if (WANT_SHOTS) await page.screenshot({ path: `${OUT_DIR}/desktop-dark.png`, fullPage: true })
  await page.locator('.VPSwitchAppearance').first().click()
  await page.waitForTimeout(300)

  // ---------- math article ----------
  await page.goto(join(MATH_ARTICLE), { waitUntil: 'networkidle' })
  const katex2 = await page.locator('.katex').count()
  const katexDisplay = await page.locator('.katex-display').count()
  check('LaTeX 块级公式渲染 (文章2)', katex2 > 0 && katexDisplay > 0, `inline+display ${katex2}, display ${katexDisplay}`)
  const img = await page.evaluate(() => {
    const i = document.querySelector('.vp-doc img')
    return i ? { src: i.getAttribute('src'), complete: i.complete, w: i.naturalWidth } : null
  })
  check('文章图片实际加载成功 (spec 6.1)', img && img.complete && img.w > 0, img ? `${img.src} natural=${img.w}` : 'no img')

  // ---------- blog article ----------
  await page.goto(join(BLOG_ARTICLE), { waitUntil: 'networkidle' })
  check('博客示例文章可打开', (await page.title()).length > 0)

  // ---------- search ----------
  await page.goto(join(''), { waitUntil: 'networkidle' })
  await page.locator('button.DocSearch-Button, .VPNavBarSearch button, [aria-label="搜索"]').first().click()
  await page.waitForTimeout(700)
  const searchInput = page.locator('.DocSearch-Input, input[type="search"], #localsearch-input').first()
  await searchInput.fill('握手')
  await page.waitForTimeout(1200)
  const hits = await page.locator('.DocSearch-Hit, .result, li a[href*="tcp-handshake"]').count()
  check('中文全文搜索命中 (spec 4.2)', hits > 0, `"握手" 命中 ${hits} 条`)
  if (WANT_SHOTS) await page.screenshot({ path: `${OUT_DIR}/search.png` })

  // ---------- narrow screen ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const m = await mobile.newPage()
  await m.goto(join(ARTICLE), { waitUntil: 'networkidle' })
  const mob = await m.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    burger: !!document.querySelector('.VPNavBarHamburger') &&
      getComputedStyle(document.querySelector('.VPNavBarHamburger')).display !== 'none',
    footerVisible: (() => { const f = document.querySelector('.site-footer'); return f ? f.getBoundingClientRect().height > 0 : false })()
  }))
  check('窄屏无横向滚动 (spec 4.2)', mob.scrollW <= mob.clientW + 1, `${mob.scrollW} vs ${mob.clientW}`)
  check('窄屏汉堡按钮可见', mob.burger)
  check('窄屏页脚可见', mob.footerVisible)
  if (WANT_SHOTS) await m.screenshot({ path: `${OUT_DIR}/mobile.png`, fullPage: true })

  await browser.close()

  // ---------- report ----------
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n)
  console.log(`\n站点: ${BASE_URL}${BASE_PATH}`)
  console.log('-'.repeat(78))
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${pad(r.name, 46)} ${r.detail || ''}`)
  }
  console.log('-'.repeat(78))
  const failed = results.filter((r) => !r.pass)
  console.log(`合计 ${results.length} 项，通过 ${results.length - failed.length}，失败 ${failed.length}`)

  const realErrors = consoleErrors.filter((e) => !/favicon|DevTools/i.test(e))
  console.log(`\n控制台错误: ${realErrors.length}${realErrors.length ? ' -> ' + realErrors.slice(0, 3).join(' | ') : ''}`)
  console.log(`页面异常: ${pageErrors.length}${pageErrors.length ? ' -> ' + pageErrors.slice(0, 3).join(' | ') : ''}`)
  console.log(`失败请求(>=400): ${failedRequests.length}${failedRequests.length ? ' -> ' + failedRequests.slice(0, 5).join(' | ') : ''}`)

  process.exit(failed.length || pageErrors.length ? 1 : 0)
})()
