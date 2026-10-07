/**
 * Phase 8 final acceptance (T8.3 / T8.4 / T8.5 / T8.6 / T8.7)
 *
 * Usage: node .automation/verify-final.cjs <distDir> [previewBaseUrl]
 *   - link/resource checks are done on the built output
 *   - when previewBaseUrl is given, every internal link is also requested over HTTP
 */
const fs = require('fs')
const path = require('path')

const DIST = process.argv[2] || 'docs/.vitepress/dist'
const BASE_URL = process.argv[3] || ''
const REPO = path.resolve(__dirname, '..')

const results = []
const check = (id, name, pass, detail = '') => results.push({ id, name, pass: !!pass, detail })

const toFs = (distRelative) => path.join(DIST, distRelative.replace(/^\//, '').replace(/\//g, path.sep))
const exists = (p) => fs.existsSync(p)
const readUtf8 = (p) => fs.readFileSync(p, 'utf8')

// Scan all built HTML for internal refs
const htmlFiles = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full)
    else if (e.name.endsWith('.html')) htmlFiles.push(full)
  }
})(DIST)

const internalHrefs = new Set()
const imgSrcs = new Set()
for (const f of htmlFiles) {
  const html = readUtf8(f)
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) internalHrefs.add(m[1])
  for (const m of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) imgSrcs.add(m[1])
}

// Which hrefs are real links (not asset bundles)
const pageLinks = [...internalHrefs].filter((h) => !/^\/(assets|vp-icons)/.test(h))

// ---------- T8.3 broken links & resources ----------
;(async () => {
  const missingLinks = pageLinks.filter((h) => {
    // hrefs are URL-encoded (e.g. %E8%AE%A1 for Chinese); decode before touching the FS.
    let decoded
    try { decoded = decodeURIComponent(h) } catch { decoded = h }
    const clean = decoded.replace(/\/$/, '')
    return !(exists(toFs(decoded)) || exists(toFs(clean + '.html')) || exists(toFs(clean + '/index.html')))
  })
  check('T8.3', '内部页面链接全部可解析', missingLinks.length === 0, `${pageLinks.length} 个链接，缺失 ${missingLinks.length}${missingLinks.length ? ': ' + missingLinks.slice(0, 3).join(', ') : ''}`)

  const missingImgs = [...imgSrcs].filter((s) => !exists(toFs(s)))
  check('T8.3', '图片资源全部存在', missingImgs.length === 0, `${imgSrcs.size} 个图片引用，缺失 ${missingImgs.length}`)

  // Inline body links live in the Markdown sources; the nav/sidebar links above come from
  // the rendered HTML. Check the sources too so article cross-links are covered.
  const mdFiles = []
  ;(function walkMd(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { if (!full.includes(`${path.sep}.vitepress`)) walkMd(full) }
      else if (e.name.endsWith('.md')) mdFiles.push(full)
    }
  })(path.join(REPO, 'docs'))

  const inlineLinks = new Set()
  for (const f of mdFiles) {
    for (const m of readUtf8(f).matchAll(/\]\((\/[^)\s#?]*)\)/g)) inlineLinks.add(m[1])
  }
  const inlineMissing = [...inlineLinks].filter((h) => {
    // Skip documentation placeholders such as /images/xxx.png used as syntax examples.
    if (/\bxxx\b|\.\.\.|placeholder|<[a-z]/i.test(h)) return false
    let decoded
    try { decoded = decodeURIComponent(h) } catch { decoded = h }
    const clean = decoded.replace(/\/$/, '')
    return !(exists(toFs(decoded)) || exists(toFs(clean + '.html')) || exists(toFs(clean + '/index.html')))
  })
  check(
    'T8.3',
    '正文内联站内链接全部可解析',
    inlineMissing.length === 0,
    `${mdFiles.length} 个 md 文件，${inlineLinks.size} 个内联链接，缺失 ${inlineMissing.length}${inlineMissing.length ? ': ' + inlineMissing.slice(0, 3).join(', ') : ''}`
  )

  // optional HTTP verification
  if (BASE_URL) {
    const bad = []
    for (const h of pageLinks) {
      try {
        const r = await fetch(BASE_URL.replace(/\/$/, '') + h, { redirect: 'follow' })
        if (!r.ok) bad.push(`${r.status} ${h}`)
      } catch (e) { bad.push(`ERR ${h}`) }
    }
    check('T8.3', 'HTTP 层内部链接全部 200', bad.length === 0, `${pageLinks.length} 个链接，异常 ${bad.length}${bad.length ? ': ' + bad.slice(0, 3).join(', ') : ''}`)
  }

  // ---------- T8.4 content spec ----------
  const articles = [
    'docs/knowledge/01-计算机基础/计算机网络/tcp-handshake.md',
    'docs/knowledge/05-AI与LLM学习/大模型基础/attention-mechanism.md',
    'docs/blog/vitepress-math-silent-failure.md'
  ]
  const problems = []
  for (const rel of articles) {
    const text = readUtf8(path.join(REPO, rel))
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/)
    if (!fm) { problems.push(`${rel}: 无 frontmatter`); continue }
    for (const key of ['title', 'date', 'tags', 'category']) {
      if (!new RegExp(`^${key}\\s*:`, 'm').test(fm[1])) problems.push(`${rel}: frontmatter 缺 ${key}`)
    }
    if (!/^date\s*:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(fm[1])) problems.push(`${rel}: date 格式错`)

    const body = text.slice(fm[0].length)
    // strip fenced code before structural checks
    let inBlock = false
    const prose = body.split('\n').map((l) => {
      if (/^\s*`{3,}/.test(l)) { inBlock = !inBlock; return '' }
      return inBlock ? '' : l
    }).join('\n')

    const h1 = [...prose.matchAll(/^#\s+\S/gm)].length
    if (h1 !== 1) problems.push(`${rel}: 一级标题 ${h1} 个`)

    const levels = [...prose.matchAll(/^(#{1,6})\s+\S/gm)].map((m) => m[1].length)
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) { problems.push(`${rel}: 标题跳级 ${levels[i - 1]}->${levels[i]}`); break }
    }

    inBlock = false
    const fences = body.split('\n').filter((l) => /^\s*`{3,}/.test(l))
    let open = false, unlabeled = 0
    for (const l of fences) {
      if (!open) { open = true; if (!l.replace(/^\s*`{3,}/, '').trim()) unlabeled++ } else open = false
    }
    if (unlabeled) problems.push(`${rel}: ${unlabeled} 个代码块无语言标识`)

    if (!/^##\s+更新日志\s*$/m.test(prose)) problems.push(`${rel}: 缺更新日志`)
    const h2s = [...prose.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim())
    if (h2s.length && h2s[h2s.length - 1] !== '更新日志') problems.push(`${rel}: 更新日志不在文末`)
  }
  check('T8.4', '3 篇示例文章符合书写规范', problems.length === 0, problems.length ? problems.slice(0, 4).join(' | ') : 'frontmatter/层级/语言标识/更新日志 全部通过')

  // ---------- T8.5 directory structure ----------
  const specCats = [
    '01-计算机基础', '02-Linux运维与底层', '03-C与C++编程笔记', '04-前端工程化',
    '05-AI与LLM学习', '06-开源项目研读', '07-工具教程与踩坑记录'
  ]
  const specSubs = {
    '01-计算机基础': ['计算机网络', '操作系统', '数据结构与算法'],
    '05-AI与LLM学习': ['大模型基础', 'Agent智能体', 'Harness与沙箱与评测体系', 'Prompt工程']
  }
  const kb = path.join(REPO, 'docs/knowledge')
  const actualCats = fs.readdirSync(kb, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  const catDiff = []
  for (const c of specCats) if (!actualCats.includes(c)) catDiff.push(`缺 ${c}`)
  for (const a of actualCats) if (!specCats.includes(a)) catDiff.push(`多 ${a}`)
  for (const [parent, subs] of Object.entries(specSubs)) {
    const dir = path.join(kb, parent)
    if (!exists(dir)) { catDiff.push(`缺目录 ${parent}`); continue }
    const actual = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    for (const s of subs) if (!actual.includes(s)) catDiff.push(`缺 ${parent}/${s}`)
    for (const a of actual) if (!subs.includes(a)) catDiff.push(`多 ${parent}/${a}`)
  }

  const contentDirs = []
  ;(function walkD(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue
      const full = path.join(dir, e.name)
      if (full.includes(`${path.sep}.vitepress`) || full.includes(`${path.sep}public`)) continue
      contentDirs.push(full)
      walkD(full)
    }
  })(path.join(REPO, 'docs'))
  const noIndex = contentDirs.filter((d) => !exists(path.join(d, 'index.md')))
  if (noIndex.length) catDiff.push(`${noIndex.length} 个内容目录缺 index.md`)

  const prefixBad = actualCats.filter((c) => !/^0[1-7]-/.test(c))
  if (prefixBad.length) catDiff.push(`数字前缀异常: ${prefixBad.join(',')}`)

  check('T8.5', '目录结构与 spec 3.2 逐条一致', catDiff.length === 0, catDiff.length ? catDiff.slice(0, 4).join(' | ') : `7 大分类 + 7 子分类 + ${contentDirs.length} 个内容目录均有 index.md`)
  check('T8.5', '图片统一在 docs/public/images', exists(path.join(REPO, 'docs/public/images')) && fs.readdirSync(path.join(REPO, 'docs/public/images')).some((f) => /\.(png|jpg|svg|webp)$/i.test(f)), fs.readdirSync(path.join(REPO, 'docs/public/images')).join(', '))

  // ---------- T8.6 deliverables ----------
  const pkg = JSON.parse(readUtf8(path.join(REPO, 'package.json')))
  const deliverables = {
    '完整 VitePress 骨架': exists(path.join(REPO, 'docs/.vitepress/config.ts')) && exists(path.join(REPO, 'docs/.vitepress/theme/index.ts')),
    '完整分类目录结构': catDiff.length === 0,
    '本地启动命令': !!(pkg.scripts['docs:dev'] && pkg.scripts['docs:build'] && pkg.scripts['docs:preview']),
    'GitHub Pages 部署配置': exists(path.join(REPO, '.github/workflows/deploy.yml')),
    '示例文章 2-3 篇': articles.filter((a) => exists(path.join(REPO, a))).length >= 2,
    'README 项目说明': exists(path.join(REPO, 'README.md'))
  }
  const missing = Object.entries(deliverables).filter(([, v]) => !v).map(([k]) => k)
  check('T8.6', 'spec 9 六项交付物齐备', missing.length === 0, missing.length ? `缺: ${missing.join(', ')}` : Object.keys(deliverables).join(' / '))

  // ---------- T8.7 forbidden ----------
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const forbiddenDeps = Object.keys(allDeps).filter((d) => /hexo|hugo|vuepress|gatsby|next|nuxt|animate|swiper|particles/i.test(d))
  check('T8.7', '未使用禁用框架/特效库 (spec 2/4.3)', forbiddenDeps.length === 0, forbiddenDeps.length ? forbiddenDeps.join(', ') : `直接依赖 ${Object.keys(allDeps).length} 个: ${Object.keys(allDeps).join(', ')}`)

  const banned = {
    '广告': /adsbygoogle|advertisement|carbon-ads|CarbonAds/i,
    '真实弹窗': /<dialog|VPDialog|role="dialog"/i,
    '推荐位': /recommend|Recommend/i,
    '轮播/粒子/动画库': /particles|tsparticles|carousel|swiper|animate\.css/i,
    '统计脚本': /googletagmanager|hm\.baidu\.com|analytics\.js/i,
    '外部CDN/字体': /<script[^>]+src="https?:\/\/|<link[^>]+stylesheet[^>]+https?:\/\/|fonts\.googleapis/i
  }
  const hits = []
  for (const [label, re] of Object.entries(banned)) {
    const found = htmlFiles.filter((f) => re.test(readUtf8(f)))
    if (found.length) hits.push(`${label}(${found.length})`)
  }
  check('T8.7', '页面无广告/弹窗/推荐/特效/统计 (spec 4.3)', hits.length === 0, hits.length ? hits.join(', ') : `扫描 ${htmlFiles.length} 个页面`)

  // ---------- report ----------
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n)
  console.log(`\n产物目录: ${DIST}`)
  console.log(`页面数: ${htmlFiles.length}  内部链接: ${pageLinks.length}  图片引用: ${imgSrcs.size}`)
  console.log('-'.repeat(92))
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  ${pad(r.name, 34)} ${r.detail}`)
  console.log('-'.repeat(92))
  const failed = results.filter((r) => !r.pass)
  console.log(`合计 ${results.length} 项，通过 ${results.length - failed.length}，失败 ${failed.length}`)
  process.exit(failed.length ? 1 : 0)
})()
