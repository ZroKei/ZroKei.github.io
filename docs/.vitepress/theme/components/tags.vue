<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
// 组件
import tags from "./tags.vue";
</script>

<template>
  <span v-if="frontmatter.date" class="fdate">🔥&nbsp;更新时间：{{ frontmatter.date }}</span>
</template>

<style>
.fdate {
  font-size: 15px;
  color: #7f7f7f;
  margin-right: 10px;
}
</style>