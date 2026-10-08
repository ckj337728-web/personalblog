<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as posts } from './blog.data'

// 文章列表由 blog.data.ts 在构建期从 docs/blog/*.md 的 frontmatter 生成，
// 因此新增文章后无需再手工维护本列表（侧边栏仍需在 config.ts 登记）。
//
// 链接必须经 withBase() 处理：post.url 形如 `/blog/xxx`，不含部署 base。
// VitePress 只会为 Markdown 链接和链接组件自动补 base 前缀，不会处理组件里的
// 裸 <a href>；站点部署在子路径（GitHub Pages 项目页 /personalblog/）时，
// 未经处理的 href 会指向站点根，点击后 404。
</script>

<template>
  <div class="blog-list">
    <p v-if="!posts.length" class="blog-list__empty">
      暂无文章。在 <code>docs/blog/</code> 下新增 .md 文件即会自动出现在这里。
    </p>
    <ul v-else>
      <li v-for="post in posts" :key="post.url">
        <span class="blog-list__date">{{ post.dateLabel }}</span>
        <a :href="withBase(post.url)">{{ post.title }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.blog-list ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.blog-list li {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.blog-list li:last-child {
  border-bottom: none;
}

.blog-list__date {
  flex: none;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.blog-list__empty {
  color: var(--vp-c-text-3);
}
</style>
