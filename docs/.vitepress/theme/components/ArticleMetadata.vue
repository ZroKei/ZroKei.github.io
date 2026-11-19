<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { countWord } from '../utils/functions'

const { page } = useData()

const wordCount = ref(0)
const imageCount = ref(0)
const ready = ref(false)

/** 最近更新时间，取 git 提交时间（config 里 lastUpdated: true 才会注入） */
const updated = computed(() => {
  const t = page.value.lastUpdated
  if (!t) return ''
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
})

/** 阅读时长：文字按 275 字/分钟，图片按张数递增计入 */
const readTime = computed(() => {
  const wordTime = (wordCount.value / 275) * 60
  const n = imageCount.value
  const imageTime = n <= 10 ? n * 13 + (n * (n - 1)) / 2 : 175 + (n - 10) * 3
  return Math.max(1, Math.ceil((wordTime + imageTime) / 60))
})

function analyze() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  // 克隆一份再统计，避免把本组件自身的文字算进去
  const clone = doc.cloneNode(true) as HTMLElement
  clone
    .querySelectorAll('.article-metadata, .header-anchor, script, style')
    .forEach((el) => el.remove())

  imageCount.value = clone.querySelectorAll('img').length
  wordCount.value = countWord(clone.textContent || '')
  ready.value = true
}

onMounted(() => nextTick(analyze))
// 站内跳转时组件不会重新挂载，需要跟着路由重新统计
watch(() => page.value.relativePath, () => nextTick(analyze))
</script>

<template>
  <div class="article-metadata" data-pagefind-ignore>
    <span v-if="updated" class="meta-item">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 11h18" />
      </svg>
      更新于 {{ updated }}
    </span>

    <span v-if="ready" class="meta-item">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
      全文 {{ wordCount }} 字
    </span>

    <span v-if="ready" class="meta-item">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      约 {{ readTime }} 分钟读完
    </span>
  </div>
</template>

<style scoped>
.article-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 18px;
  /* h1 自身没有下边距（默认主题只给了 line-height），这里给足呼吸空间：
     与标题拉开 14px，与正文拉开 30px，读起来是一组「标题 + 副信息」 */
  margin: 14px 0 30px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.meta-item svg {
  flex: none;
  opacity: 0.6;
}

@media (max-width: 640px) {
  .article-metadata {
    gap: 2px 14px;
    font-size: 13px;
  }
}
</style>
