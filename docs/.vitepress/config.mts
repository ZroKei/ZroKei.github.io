import { defineConfig } from 'vitepress'
import pkg from '../../package.json' assert { type: 'json' }



// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'Zh-CN',
  title: "ZroKei's Blog",
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
      ['link',{ rel: 'icon', href: '/head or Fav.jpg'}],
  ],

  appearance:'dark', 

  //站点地图
  sitemap: {
    hostname: 'https://zrokei.github.io',
  },

  lastUpdated: true, //首次配置不会立即生效，需git提交后爬取时间戳

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    
    //标题logo
    logo: '/head or Fav.jpg', //路径相对于public文件夹

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
          { text: '快速上手', link: '/getting-started' },
          { text: '配置', link: '/configuration' },
          { text: '页面', link: '/page' },
          { text: '文档', link: '/posts/蓝桥杯嵌入式' },
          { text: '定时器中断', link: '/posts/定时器中断' },
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

    //Algolia搜索纯中文版
    search: {
      provider: 'algolia',
      options: {
        appId: 'Q6EFM4UTI1',
        apiKey: '4ea66402f592049eb4d9744cb10a1c74',
        indexName: 'My Github ZroKei',
        locales: {
          root: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                },
              },
            },
          },
        },
      },
    },
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
