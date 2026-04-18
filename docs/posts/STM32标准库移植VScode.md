# STM32如何将标准库移植成为VScode能够使用的版本

![image-20260415214652979](/image-20260415214652979.png)

首先我们需要在VScode的右下角设置界面找到配置文件，单击配置文件跳转到配置文件界面：

![image-20260415214819132](/image-20260415214819132.png)

点击新建配置文件（上图是新建好后的界面，可以按照自己的想法修改配置文件的名称，比如STM32），这样可以根据不同的代码编译需求一键切换不同的配置文件。



![image-20260415214510688](/image-20260415214510688.png)

然后我们需要在需要用到的配置文件中安装上图中的扩展包，扩展包安装好了之后在左侧侧边栏会出现一个蝴蝶样式的图标（如下图所示）：

![image-20260415215356904](/image-20260415215356904.png)

这个时候如果我们使用的是标准库编写代码，我们就需要点击图中的Creat empty project 按钮新建工程

![image-20260415215521445](/image-20260415215521445.png)

点击按钮之后会提示我们输入一个项目名称，自己随便写一个就好

![image-20260415215648253](/image-20260415215648253.png)

输入名称并按下回车键之后会提示我们选择Device或者Board，我们单击Device选项

![image-20260415215900734](/image-20260415215900734.png)

这个时候我们需要输入芯片型号进行选择，选择自己要用的芯片，这里以STM32F103C8T6为例

![image-20260415220020450](/image-20260415220020450.png)

选择好芯片之后会跳转到选择路径界面，找一个自己常用的文件夹进行存放

![image-20260415220142170](/image-20260415220142170.png)

选择好文件夹之后，上图这个界面只需要单击最后一行的Creat project创建项目就可以了

![image-20260415220402612](/image-20260415220402612.png)

创建好项目之后右下角会弹出选择 “当前窗口打开” 或者 “在新窗口打开”，这个选哪个无所谓

![image-20260415220535327](/image-20260415220535327.png)

创建好工程之后，在这里选择第一个Debug选项，

![image-20260415221028588](/image-20260415221028588.png)

然后我们找到上图这个页面，点击红色箭头指向的生成

![image-20260415221211498](/image-20260415221211498.png)

这里会提示生成完成，这个时候代码还是无法下载到芯片中的，

我们需要去ST的官方网站找到他提供的标准库代码的压缩包

[ST官网](https://www.st.com.cn/content/st_com/zh/search.html#q=STSW-STM32054-t=tools-page=1)

然后我们需要将官方标准库文件夹中将Libraries文件夹移动到我们自己创建的项目文件夹中
然后在文件\stsw-stm32054_v3-6-0\STM32F10x_StdPeriph_Lib_V3.6.0\Project\STM32F10x_StdPeriph_Template中找到
"stm32f10x_conf.h","stm32f10x_it.c","stm32f10x_it.h"这三个文件
将.h文件复制到Inc文件夹内，.c文件复制到Src文件夹

可以新建一个System文件夹用来存放各个模块的底层代码

然后修改CMakeLists.txt文件：
找到set(sources_SRCS)和set(include_DIRS)这两部分代码，在set(sources_SRCS)代码上方添加代码：

```c
# 2. 收集源文件（自动搜索所有库里的 .c）
file(GLOB_RECURSE LIB_SOURCES 
    "${CMAKE_CURRENT_SOURCE_DIR}/Libraries/*.c"
)
file(GLOB_RECURSE SYSTEM_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/System/*.c")
```

然后修改set(sources_SRCS)为：

```c
# Sources
set(sources_SRCS
    ${CMAKE_CURRENT_SOURCE_DIR}/Src/main.c
    ${CMAKE_CURRENT_SOURCE_DIR}/Src/stm32f10x_it.c
    ${CMAKE_CURRENT_SOURCE_DIR}/Src/startup_stm32f103xx.S  # <--- 请根据实际文件名修改
    ${LIB_SOURCES}
    ${SYSTEM_SOURCES}  # <--- 别忘了把 System 里的文件也加进来
)
```

修改set(include_DIRS)为：

```c
# Include directories for all compilers
set(include_DIRS
    ${CMAKE_CURRENT_SOURCE_DIR}/Inc
    ${CMAKE_CURRENT_SOURCE_DIR}/System                                          # 包含你的 System 文件夹
    ${CMAKE_CURRENT_SOURCE_DIR}/Libraries/CMSIS/CM3/CoreSupport
    ${CMAKE_CURRENT_SOURCE_DIR}/Libraries/CMSIS/CM3/DeviceSupport/ST/STM32F10x
    ${CMAKE_CURRENT_SOURCE_DIR}/Libraries/STM32F10x_StdPeriph_Driver/inc
)
```

然后在下方找到set(symbols_c_SYMB)代码

将其修改为：

```c
set(symbols_c_SYMB
    "USE_STDPERIPH_DRIVER"  # 开启标准库开关
    "STM32F10X_MD"         # 设置芯片容量（中容量）
)
```

修改好了之后，在VScode的运行和调试界面进行运行和调试