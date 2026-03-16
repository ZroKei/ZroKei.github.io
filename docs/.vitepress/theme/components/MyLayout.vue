<!-- .vitepress/theme/MyLayout.vue -->
<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
// 组件1、2、3
import MyComponent from "./MyComponent.vue";

</script>

<template>
  <DefaultTheme.Layout v-bind="$attrs">

    <!-- doc-footer-before插槽1个组件 -->
    <template #doc-footer-before>
      <MyComponent />
    </template>

    <!-- layout-top插槽2个组件 -->
    <template #layout-top>
      <MyComponent2 />
      <MyComponent3 />
    </template>

  </DefaultTheme.Layout>
</template>

<style scoped>
</style>