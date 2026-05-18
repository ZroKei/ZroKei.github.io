# ESP32

## 一、ESP-IDF命令式开发

| 功能         | 命令                                       | 说明                |
| ------------ | ------------------------------------------ | ------------------- |
| 创建新工程   | idf.py create-project --path '<project name>' | 默认工程为esp32     |
| 设置目标芯片 | idf.py set-taeget '<target>'                 | esp32s3、esp32p4... |
| 创建新的组件 | idf.py create-component '<component name>'    | 创建外设驱动        |
| 编译工程     | idf.py build                               |                     |
| 监控项目工程 | idf.py monitor                             | 退出监控 'Ctrl + 】' |
| 配置项目     | idf.py menuconfig                          | 项目配置            |
| 下载程序     | idf.py -p COMx flash                       | x为端口号           |
| 清除编译文件 | idf.py fullclean; idf.py clean             | 全部清除、部分清除  |

