// 引入 VitePress 默认主题
import DefaultTheme from 'vitepress/theme'
import './style/index.css'
import ArticleMetadata from './components/ArticleMetadata.vue'

export default {
  extends: DefaultTheme, // 继承默认主题

  enhanceApp({ app }) {
    // 全局注册，供 markdown 渲染钩子注入的 <ArticleMetadata /> 使用
    app.component('ArticleMetadata', ArticleMetadata)
  }
}
