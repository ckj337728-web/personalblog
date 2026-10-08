import { createContentLoader } from 'vitepress'

/**
 * 博客文章列表数据源（构建期读取，输出为静态 JSON）。
 *
 * 目的：避免"同一份文章清单要手写两遍"——侧边栏在 config.ts 登记，
 * 文章列表页由此文件自动生成，只依赖每篇文章 frontmatter 里的 title 与 date。
 *
 * 约定：文章必须写在 docs/blog/ 下，且 frontmatter 含 date（YYYY-MM-DD）。
 * 未填 date 的文章会被排到最后并在日期位置显示"—"，以便被察觉。
 */
export interface BlogPost {
  title: string
  url: string
  date: string
  dateLabel: string
  tags: string[]
}

export default createContentLoader('blog/*.md', {
  transform(raw): BlogPost[] {
    return raw
      // 索引页自身不进列表
      .filter((p) => !p.url.endsWith('/blog/'))
      .map((p) => {
        // gray-matter 会把 YYYY-MM-DD 解析为 Date 对象。
        // 用 UTC 取值，避免在负时区下显示成前一天。
        const rawDate = p.frontmatter.date
        let date = ''
        if (rawDate instanceof Date) {
          date = rawDate.toISOString().slice(0, 10)
        } else if (typeof rawDate === 'string') {
          date = rawDate.slice(0, 10)
        }

        const tags = Array.isArray(p.frontmatter.tags)
          ? p.frontmatter.tags
          : p.frontmatter.tags
            ? [p.frontmatter.tags]
            : []

        return {
          title: p.frontmatter.title || p.url,
          url: p.url,
          date,
          // 供界面直接显示；缺日期时给出显式提示而不是留空
          dateLabel: date || '（缺 date）',
          tags
        }
      })
      // 按日期倒序；缺日期的排最后
      .sort((a, b) => {
        if (a.date && b.date) return b.date.localeCompare(a.date)
        if (a.date) return -1
        if (b.date) return 1
        return a.title.localeCompare(b.title)
      })
  }
})
