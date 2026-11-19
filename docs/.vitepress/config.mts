import { defineConfig } from 'vitepress'
import { pagefindPlugin, chineseSearchOptimize } from 'vitepress-plugin-pagefind'
import pkg from '../../package.json' with { type: 'json' }

// 站点根地址，sitemap / canonical / og:url 共用
const HOSTNAME = 'https://zrokei.github.io'
const SITE_NAME = "ZroKei's Blog"
const SITE_DESC = '我的嵌入式学习'
const OG_IMAGE = `${HOSTNAME}/og-image.jpg`



// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: SITE_NAME,
  description: SITE_DESC,

  base: '/', //网站部署的路径，默认根目录
    // base: '/vitepress/', //网站部署到github的vitepress这个仓库里

  //markdown配置
  markdown: {
    image: {
      // 开启图片懒加载
      lazyLoading: true
    },
    
  },

  //本地搜索：构建时用 pagefind 生成索引，chineseSearchOptimize 做中文分词
  vite: {
    plugins: [
      pagefindPlugin({
        customSearchQuery: chineseSearchOptimize,
        btnPlaceholder: '搜索文档',
        placeholder: '搜索文档',
        emptyText: '没有找到相关内容',
        loadingText: '正在搜索...',
        heading: '共 {{searchResult}} 条结果',
        toSelect: '选择',
        toNavigate: '切换',
        toClose: '关闭',
        searchBy: '搜索提供者'
      })
    ]
  },

  //fav图标
  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#1b1b1f' }],
    ['meta', { name: 'author', content: 'ZroKei' }],
  ],

  // 每页生成 og / twitter 卡片与 canonical，分享到微信、QQ、Telegram 才有缩略图
  transformHead({ pageData }) {
    const path = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
      .replace(/(^|\/)index$/, '$1')
    const url = `${HOSTNAME}/${path}`
    const title = pageData.frontmatter.title || pageData.title || SITE_NAME
    const description = pageData.frontmatter.description || pageData.description || SITE_DESC
    const isHome = pageData.frontmatter.layout === 'home'

    return [
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:site_name', content: SITE_NAME }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: OG_IMAGE }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE }],
      ['link', { rel: 'canonical', href: url }],
    ]
  },

  appearance:'dark', 

  //站点地图
  sitemap: {
    hostname: HOSTNAME,
  },

  lastUpdated: true, //首次配置不会立即生效，需git提交后爬取时间戳

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    
    //标题logo
    logo: '/logo.png', //路径相对于public文件夹

    siteTitle: 'ZroKei', //标题隐藏
    //返回顶部文字修改
    returnToTopLabel:'返回顶部', 
    //导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: '学习记录', link: '/posts/学习记录' },
      { text: '文档', link: '/posts/蓝桥杯嵌入式' },
      { text: `VitePress ${ pkg.devDependencies.vitepress.replace('^','') }`, link: 'https://vitepress.dev/zh/', noIcon: true },
    ],
    //侧边栏
    sidebar: [
      {
        text: '指南',
        collapsed: false, // 默认展开
        items: [
          { text: '前言', link: '/preface' },
          { text: '使用VScode开发STM32标准库', link: '/posts/STM32标准库移植VScode' },
          { text: '文档', link: '/posts/蓝桥杯嵌入式' },
          { text: '定时器中断', link: '/posts/定时器中断' },
          { text: 'FreeRTOS', link: '/posts/FreeRTOS' },
          { text: 'ESP32-Arduino', link: '/posts/ESP32' },
          { text: '立创天猛星学习', link: '/posts/立创天猛星学习' },
        ],
      },
    ],

    //自定义上下页名
    docFooter: { 
      prev: '上一页', 
      next: '下一页', 
    }, 

    //上次更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short', // 可选值full、long、medium、short
        timeStyle: 'medium' // 可选值full、long、medium、short
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ZroKei' }
    ],

    //搜索：本地 pagefind 全文检索（无需 Algolia）
    //UI 与索引全部在构建时生成，配置见下方 vite.plugins
    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} ZroKei`,
      // 自动更新时间
      //copyright: `Copyright © 2019-${new Date().getFullYear()} present Evan You`, 
    },
    //编辑本页
    editLink: { 
      pattern: 'https://github.com/ZroKei/ZroKei.github.io/edit/main/docs/:path', // 改成自己的仓库
      text: '在GitHub编辑本页'
    },
    
    outline: { 
      level: [2,4], // 显示2-4级标题
      // level: 'deep', // 显示2-6级标题
      label: '当前页大纲' // 文字显示
    },
    // outline:false, // 关闭标题显示
    // outlineTitle:'当前页大纲', //老方式设置标题
    
  }
})
