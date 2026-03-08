// 引入 VitePress 默认主题
import DefaultTheme from 'vitepress/theme'
// 引入你刚才展示的那段 117 行 CSS
import './custom.css'

export default {
  extends: DefaultTheme, // 继承默认主题
  enhanceApp({ app, router, siteData }) {
    // 可以在这里注册全局组件
  }
}