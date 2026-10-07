/**
 * 全站页脚组件（spec 4.2 要求：底部版权、更新时间、Git 最后提交时间）。
 *
 * 为什么用 layout-bottom 插槽而不是 themeConfig.footer：
 * VitePress 默认主题的 footer 在侧边栏可见时不渲染，文章页（有侧边栏）底部
 * 将完全看不到版权与时间信息，无法满足 spec 4.2。
 *
 * 站点配置中的 themeConfig.footer 已停用（见 config.ts），默认页脚由 custom.css 隐藏，
 * 全站页脚统一由此组件输出，避免出现两套页脚。
 */
<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, theme, frontmatter } = useData()

// 版权与备注文案来自 themeConfig.footer，保持单一数据源。
const message = computed(() => theme.value.footer?.message ?? '')
const copyright = computed(() => theme.value.footer?.copyright ?? '')

const showFooter = computed(() => frontmatter.value.footer !== false)

/**
 * Git 最后提交时间（由 lastUpdated: true 提供，来源为该文件最近一次 git 提交）。
 * 注意：这里用 UTC 日期格式化而非 Intl 本地化格式，原因是
 * 服务端与客户端时区可能不同，本地化格式会导致 hydration 不一致；
 * UTC 格式对两侧都是同一确定值（默认主题的 @vueuse 时钟依赖即为此原因）。
 */
const lastUpdated = computed(() => {
  const ts = page.value.lastUpdated
  if (!ts) return null
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    iso: d.toISOString(),
    text: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  }
})
</script>

<template>
  <footer v-if="showFooter" class="site-footer">
    <div class="site-footer__inner">
      <p v-if="copyright" class="site-footer__copyright" v-html="copyright" />
      <p v-if="message" class="site-footer__message" v-html="message" />
      <p v-if="lastUpdated" class="site-footer__updated">
        本页最后提交于
        <time :datetime="lastUpdated.iso">{{ lastUpdated.text }}</time>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 48px;
  padding: 24px 24px 32px;
}

.site-footer__inner {
  max-width: 1152px;
  margin: 0 auto;
  text-align: center;
}

.site-footer__copyright,
.site-footer__message,
.site-footer__updated {
  margin: 0;
  line-height: 24px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.site-footer__updated time {
  font-variant-numeric: tabular-nums;
}
</style>
