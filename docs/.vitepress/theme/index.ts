// 引入 VitePress 默认主题
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme, // 继承默认主题
  enhanceApp({ app, router, siteData }) {
    // 可以在这里注册全局组件
  }
}