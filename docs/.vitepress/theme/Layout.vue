<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import SiteFooter from './SiteFooter.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- spec 4.2：文章页（有侧边栏）也要显示版权与 Git 最后提交时间，
         默认主题 footer 在侧边栏可见时不渲染，故用 layout-bottom 插槽补齐。 -->
    <template #layout-bottom>
      <SiteFooter />
    </template>
  </Layout>
</template>
