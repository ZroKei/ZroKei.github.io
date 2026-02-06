import { defineConfig } from 'vitepress'
import { devDependencies } from 'D:/vitepress/package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: "Study",
  description: "我的嵌入式学习",

  base: '/', //网站部署的路径，默认根目录
    // base: '/vitepress/', //网站部署到github的vitepress这个仓库里

  //markdown配置
  markdown: {
    image: {
      // 开启图片懒加载
      lazyLoading: true
    },
  },

  //fav图标
  head: [
      ['link',{ rel: 'icon', href: '/logo.png'}],
  ],

  appearance:'dark', 

  //站点地图
  sitemap: {
    hostname: 'http://localhost:5173.com',
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    //编辑本页
    editLink: { 
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path', // 改成自己的仓库
      text: '在GitHub编辑本页'
    },
    
    outline: { 
      level: [2,4], // 显示2-4级标题
      // level: 'deep', // 显示2-6级标题
      label: '当前页大纲' // 文字显示
    },
    // outline:false, // 关闭标题显示
    // outlineTitle:'当前页大纲', //老方式设置标题

    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-2023 present Evan You',
      // 自动更新时间
      //copyright: `Copyright © 2019-${new Date().getFullYear()} present Evan You`, 
    },

    logo: '/logo.png',
    siteTitle: false, //标题隐藏
    nav: [
      { text: '首页', link: '/' },
      { text: '学习记录', link: '/getting-started' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: `VitePress ${ devDependencies.vitepress.replace('^','') }`, link: 'https://vitepress.dev/zh/', noIcon: true },
    ],
    
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '前言', link: '/preface' },
          { text: '快速上手', link: '/getting-started' },
          { text: '配置', link: '/configuration' },
          { text: '页面', link: '/page' },
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    //本地搜索
    search: {
      provider: 'local'
    },
  }
})
