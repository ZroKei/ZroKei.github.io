// 引入 VitePress 默认主题
import DefaultTheme from 'vitepress/theme'
import './style/index.css'
import Mycomponent from "./components/Mycomponent.vue"
import MouseClick from "./components/MouseClick.vue"
import MouseFollower from "./components/MouseFollower.vue"
import MyLayout from './components/MyLayout.vue' // 导入布局组件

export default {
  extends: DefaultTheme, // 继承默认主题
  Layout: MyComponent, // 应用组件
  Layout: MyLayout, // 应用布局组件
  enhanceApp({app}) { 
    // 注册全局组件
    app.component('Mycomponent' , Mycomponent)
    app.component('MouseClick' , MouseClick)
    app.component('MouseFollower' , MouseFollower)
  }
}

