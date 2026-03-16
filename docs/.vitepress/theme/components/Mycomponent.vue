<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
    <Layout>
        <!-- 插槽 --> 
        <template #aside-outline-before>
          <!-- 这里写内容，下面是一个简单示例 -->
          <div class="title">我是aside-outline-before</div>
        </template>
    </Layout>
</template>

<style>
.title {
    color: red;
}
</style>