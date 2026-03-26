最近重温了一下铁头山羊老师的stm32标准库的中断部分，这是在回顾一遍stm32标准库中断部分课程后所写的文章

## 中断的基本概念

### 中断——单片机应对突发事件的一种方式


![](https://files.mdnice.com/user/123300/8e651c71-31a1-4788-a747-173f4c0e5042.png)


铁头山羊老师用以上的三个例子来解释我们人在实际生活中是怎么应对突发事件的，以第一个例子来讲：当我们正在阅读的时候蚊子来了，于是我们停止阅读去拍蚊子，拍死蚊子后我们继续之前阅读的动作。单片机处理突发事件的方式呢其实和我们人差不多，在单片机编程里我们一般把上图中的阅读叫做常规程序，把蚊子来了这一突发事件叫做中断，当中断发生的时候单片机就需要停止常规程序转而去处理中断，在处理中断时，单片机会跳转到预先编写好的中断服务程序（ISR），执行结束后再返回主程序继续执行，从而实现对紧急事件的**高效、即时**响应。如下:

**常规函数:**

```c
int main(void)
{
    while(1)
    {
        //常规程序
        ...
        ...
        ...
    }
}
```

**中断响应函数:**

```c
// IRQ Handler = Interrupt Request Handler
//                 中断      请求   处理器
// 中断响应函数
void xxx_IRQHandler(void)
{
	// 对中断的具体处理代码
	...
}
```




![](https://files.mdnice.com/user/123300/78b8ac69-3176-4a5c-87de-ea301379cd18.png)


## 中断编程举例

我们想要用程序来实现通过串口接受数据来控制LED灯闪烁的频率，那么就有了以下代码：

**闪灯程序：**

```c
int main(void)
{
	while(1)
	{
		// 亮灯
		GPIO_WriteBit(..., Bit_RESET);
		// 延迟一段时间
		Delay(...);
		// 灭灯
		GPIO_WriteBit(..., Bit_SET);
		// 延迟一段时间
		Delay(...);
	}
}
```

**串口数据接收程序：**

```c
int main(void)
{
    while(1)
    {
        if(USART_GetFlagStatus(...RxNE)==SET)
        {
            // 读取数据
            uint8_t byte = USART_ReceiveData(...);
            // 根据收到的数据改变闪灯速度
            ...
        }
    }
}
```

将以上两段程序合并得到我们想要的代码：

```c
int main(void)
{
    while(1)
    {
        GPIO_WriteBit(..., Bit_RESET); // 亮灯
        Delay(...);// 延迟一段时间
		GPIO_WriteBit(..., Bit_SET);// 灭灯
		Delay(...);// 延迟一段时间
        
        if(USART_GetFlagStatus(...RxNE)==SET)
        {
            // 读取数据
            uint8_t byte = USART_ReceiveData(...);
            // 根据收到的数据改变闪灯速度
            ...
        }
    }
}
```

合并之后的这段代码真的能够实现我们理想中的效果吗，当然不能，为什么呢？

我们发现，当我们运行LED的闪灯程序的时候，程序会因为延时程序导致运行时发生阻塞，而我们的数据读取程序只能等待延时程序结束时再运行读取串口接收到的数据，这会导致一部分数据无法及时读取，当数据无法及时读取就会造成一部分数据的丢失。这就相当于我们的快递送到快递站了之后我们没有及时去取，那么我们的快递就会退回。

所以我们该如何解决这个问题呢？

那我们只能抽出一段时间去快递站取快递，此时快递到了就是一个突发事件，而我们去取快递就是一个针对突发事件的中断处理。


![](https://files.mdnice.com/user/123300/d44c9422-0412-4f2a-a6bf-a1750aa45e65.png)


上图是USART串口模块的内部结构框图，我们能够看到右上角部分这里有很多的标志位，这些标志位都可以产生中断，我们使用RxNE标志位（接收数据寄存器非空标志位）来产生这个中断，当RxNE标志位从0变为1的时候（也就是左下角接收数据寄存器接收到数据的时候）程序就会触发一个中断，加入中断后程序如下：

```c
// 闪灯程序
int main(void)
{
    while(1)
    {
        GPIO_WriteBit(..., Bit_RESET); // 亮灯
        Delay(...);// 延迟一段时间
		GPIO_WriteBit(..., Bit_SET);// 灭灯
		Delay(...);// 延迟一段时间
    }
}

// 中断程序
void USART1_IRQHandler(void) // 中断响应函数
{
    // 接受数据
    uint8_t data = USART_ReceiveData(...);
    // 对接收到的数据进行处理
}
```

在加入中断后，串口每接收一次数据就触发一次中断，调用一次中断响应函数，这么看来这个程序就非常合理了。

## 中断优先级

### 中断优先级——用数字表示中断的紧急程度

在讲了中断的概念和例程后，我们再来讲一讲中断优先级这一概念。从名称中的“优先”来看我们就知道中断优先级应该跟中断顺序的先后有关，我们以医生给病人看病为例：医生小张此时正在给病人甲看病，病人乙和病人丙正在排队，病人丙有很急的急事需要插队，那么医生小张看病的顺序就是甲->乙->丙。在另一个房间，医生小曹正在给病人1看病，此时来了病人2需要急诊，那么医生小曹就需要暂停病人1的问诊然后去给病人2看病，结束后再给病人1看病（病人1->病人2->病人1）。如下图所示：


![](https://files.mdnice.com/user/123300/9d655de7-4ca7-4745-80a5-0a0fb78c6fbd.png)


**stm32单片机中断内部结构框图：**


![](https://files.mdnice.com/user/123300/0f39d5b0-184e-425f-b720-52590dff1b6e.png)


在上面的中断内部结构框图中我们可以看到此图分为五个部分，分别为：片上外设、中断、NVIC、中断时序图和中断向量表。其中的片上外设相当于我们stm32单片机上的一个个器官，每个片上外设都可以产生不同的作用，而本文所讲的中断部分就是由一个个片上外设所产生的（例如上文的示例程序就是由USART模块产生的中断）。我们可以看到片上外设中的I2C模块可以产生两个中断，分别是I2Cx错误中断和I2Cx事件中断，而EXTI模块可以产生多个中断，例如EXTI0、EXTI1...等。为了防止这么多中断堆到一起出现乱套的情况，我们就需要一个能够管理中断的存在（NVIC）来帮我们对这些中断进行排队。NVIC会针对每个中断的优先级给中断进行排序，排在前面的中断会优先被响应，我们的CPU在响应中断的时候会从中断向量表里面查找对应的中断响应函数并优先进行执行，当我们的中断响应函数处理完成后这个中断也就结束了。

## 中断优先级的表示方法


![](https://files.mdnice.com/user/123300/1bcb286e-7aac-46d1-a1c5-4d41e2845a57.png)


我们将NVIC模块放大，能够看到每一个中断都被分成了4个格子，每一个格子都代表一个bit位，每个bit位可以填0/1。而4个格子中间的那条竖线是可以移动的，它代表了每个中断的优先级的分组，分别为分组0~分组4，优先级分组是配置这 4 个位如何分配给抢占优先级和子优先级。例如，若设置为分组 2，则表示 2 位用于抢占优先级，2 位用于子优先级。假设此时中断为分组0，它的四个bit位分别为1011，那么此时的抢占优先级就为0，子优先级通过二进制数的计算可以得到结果为11。

## 抢占优先级与中断嵌套

### 中断嵌套——更高优先级的中断打断正在执行的中断

一个中断中嵌套了一个更高优先级的中断被称为中断嵌套，那么中断的优先级该怎么比较呢？

### 中断嵌套的条件——新中断的抢占优先级更高


![](https://files.mdnice.com/user/123300/3c73f7a8-6183-4741-8a6e-62fe02fcacbb.png)


我们拿分组2来举例，中断1~4分别为1001、1000、0011、1110，通过计算能够得出中断1~4的抢占优先级分别为2、2、0、3，假如此时程序正在进行中断1，那么当此时中断2来了之后中断1和中断2能否形成中断嵌套呢？由上文的计算可知中断1和2的抢占优先级是相同的，那么程序的运行过程就是按顺序运行中断1和中断2然后中断结束。同样的，当中断1正在运行的时候中断3来了，中断1和中断3能否形成中断嵌套呢？中断3的抢占优先级为0，因为抢占优先级数字越小，优先级越高，中断3的抢占优先级 (0) 高于中断1的抢占优先级 (2)，因此能够形成中断嵌套。

## 子优先级与中断排队

### 中断排队——优先级相仿，等待前一个中断执行完再处理新中断

单片机中断排队所遵循的原则：

**1.不会打断当前中断的执行**

**2.优先级高的排前边**

**3.优先级相同则根据先来后到排队**



**用一句话总结就是：抢占优先级可以中断嵌套，子优先级可以优先排队，抢占优先级越高，数值越小。**

在学习了本节中断的知识之后，让我们来敲一敲代码实战一下。


![](https://files.mdnice.com/user/123300/4c7081fd-62c0-41dd-ad4e-46b81abb9e62.png)


上文中我们提到，如果想要使用中断响应函数来进行数据接收的处理，那么就需要用RxNE标志位来进行判断串口是否接收到了数据。从上图中的内容可知，USART的中断是使用一个或门来控制的，也就是说这些标志位只要有一个为1就可以触发USART全局中断。在标志位与或门之间存在一个开关，这个开关的作用是用来屏蔽标志位的，当开关关闭的时候即使标志位为1也无法触发中断。所以如果我们想要使用RxNE标志位去触发USART的全局中断，那就需要先将RxNE标志位的开关闭合，那么我们就需要学习一个新的编程接口：

```c
void USART_ITConfig(USART_TypeDef *USARTx,	 // 串口的名称, USART1, USART2, ...
					    uint16_t USART_IT, // 标志位的名称
					                       // USART_IT_TXE, USART_IT_TC, USART_IT_RxNe
					                       // USART_IT_PE, USART_IT_ERR
			      FunctionalState NewState);// 开关状态, ENABLE - 闭合 DISABLE - 断开
```

对这个编程接口进行调用：

```c
#include "stm32f10x.h"
#include "delay.h"

uint32_t blinkInterval = 1000; // 闪灯间隔

// 板载LED初始化函数
void App_OnBoardLED_Init(void)
{
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE); // 开启GPIOC时钟
    
    GPIO_InitTypeDef GPIO_InitStruct;
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_13; // PC13引脚
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_Out_OD; // 输出开漏模式
    GPIO_InitStruct.GPIO_Speed = GPIO_Speed_2MHz;
    
    GPIO_Init(GPIOC, &GPIO_InitStruct);
}

// 串口初始化函数
void App_USART1_Init(void)
{
    // #1. 初始化IO引脚
    GPIO_InitTypeDef GPIO_InitStruct;
    // PA9 AF_PP
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP; // 复用推挽
    GPIO_Initstruct.GPIO_Speed = GPIO_Speed_2MHz;
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // PA10 IPU
     RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU; // 输入上拉模式
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // #2. 初始化USART1
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1, ENABLE); // 开始USART1时钟
    
    USART_InitTypeDef USART_InitStruct;
    
    USART_InitStruct.USART_BaudRate = 115200;
    USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None; // 硬件流控
    USART_InitStruct.USART_Mode = USART_Mode_Tx | USART_Mode_Rx; // 数据接收与发送
    USART_InitStruct.USART_Parity = USART_Parity_No; // 校验方式为没有校验
    USART_InitStruct.USART_StopBits = USART_StopBits_1; // 1位停止位
    USART_InitStruct.USART_WordLength = USART_WordLength_8b; // 8位数据位
    
    USART_Init(USART1, &USART_InitStruct);
    
    // 闭合总开关
    USART_Cmd(USART1, ENABLE);
    
    // #3. 配置中断,USART 的标志位（如 RxNE）在读取数据时自动清除
    USART_ITConfig(USART1, USART_IT_RxNE, ENABLE);
}

// 主程序
int main(void)
{
    App_OnBoardLED_Init();
    while(1)
    {
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_RESET); // 亮灯
        Delay(blinkInterval);// 延迟一段时间
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_SET);// 灭灯
        Delay(blinkInterval);// 延迟一段时间
    }
}
```

上述代码已经配置好了中断以及板载LED和USART的初始化，接下来我们需要配置一下NVIC模块

NVIC模块是嵌套中断向量控制器的一个缩写，它有四个功能：

**1.每一个中断都存储了4个bit位，这4个bit位代表了中断的优先级**

**2.给中断优先级进行分组**

**3.通过开关是否闭合来控制中断的使能**

**4.根据中断的优先级和产生的中断信号来对中断进行排队或者嵌套**

接下来我们需要对NVIC进行配置，有三个地方需要我们进行配置：

**1.配置中断优先级的分组（将4个bit位分给抢占优先级和子优先级）**

**2.向4个bit位中填入中断优先级，这代表了我们中断的紧急程度**

**3.闭合相应的开关来使能中断**

为了能够配置中断优先级的分组，我们需要学习一个新的编程接口：


![](https://files.mdnice.com/user/123300/d9fc93bd-ef3f-44fa-8fdc-613258d8f9cc.png)


这个编程接口的作用就是配置中断优先级的分组，能够看到NVIC_PriorityGroup_1~4分别对应分组0~4，比如我们使用分组2来配置中断优先级，那么我们在main函数中调用这个编程接口：

```c
int main(void)
{
    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2); // 中断优先级分组2
    
    App_OnBoardLED_Init();
    App_USART1_Init();
    while(1)
    {
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_RESET); // 亮灯
        Delay(blinkInterval);// 延迟一段时间
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_SET);// 灭灯
        Delay(blinkInterval);// 延迟一段时间
    }
}
```

这样我们的中断优先级分组就完成了，而剩下的两个配置任务使用下面的这个新编程接口就可以完成了。


![](https://files.mdnice.com/user/123300/c682f730-de70-4d32-9ad8-038a938e70d7.png)

从图中可以看出，这个编程接口所使用的参数是一个结构体指针类型的参数，我们需要先给这个参数声明一个结构体指针类型的变量

我们将中断初始化的这段代码写在串口初始化的函数里面（见 #4.）：

```c
// 串口初始化函数
void App_USART1_Init(void)
{
    // #1. 初始化IO引脚
    GPIO_InitTypeDef GPIO_InitStruct;
    // PA9 AF_PP
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP; // 复用推挽
    GPIO_Initstruct.GPIO_Speed = GPIO_Speed_2MHz;
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // PA10 IPU
     RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU; // 输入上拉模式
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // #2. 初始化USART1
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1, ENABLE); // 开始USART1时钟
    
    USART_InitTypeDef USART_InitStruct;
    
    USART_InitStruct.USART_BaudRate = 115200;
    USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None; // 硬件流控
    USART_InitStruct.USART_Mode = USART_Mode_Tx | USART_Mode_Rx; // 数据接收与发送
    USART_InitStruct.USART_Parity = USART_Parity_No; // 校验方式为没有校验
    USART_InitStruct.USART_StopBits = USART_StopBits_1; // 1位停止位
    USART_InitStruct.USART_WordLength = USART_WordLength_8b; // 8位数据位
    
    USART_Init(USART1, &USART_InitStruct);
    
    // 闭合总开关
    USART_Cmd(USART1, ENABLE);
    
    // #3. 配置中断,USART 的标志位（如 RxNE）在读取数据时自动清除
    USART_ITConfig(USART1, USART_IT_RxNE, ENABLE);
    
    // #4. 配置NVIC
    NVIC_InitTypeDef NVIC_InitStruct;
    NVIC_InitStruct.NVIC_IRQChannel = USART1_IRQn; // 中断名称，见stm32f10x.h IRQn
    NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority = 0; // 抢占优先级
    NVIC_InitStruct.NVIC_IRQChannelSubPriority = 0; // 子优先级
    NVIC_InitStruct.NVIC_IRQChannelCmd = ENABLE; // 开关状态
    NVIC_Init(&NVIC_InitStruct);
}
```

配置完NVIC之后我们的整体工作差不多就做完了，还需要编写一下中断响应函数（名称见’startup_stm32f10x_md.s'）：

```c
void USART1_IRQHandler(void) // 中断响应函数，
{
    // 判断中断的产生原因
    if(USART_GetFlagStatus(USART1, USART_FLAG_RXNE) == SET)
    {
        uint8_t byte = USART_ReceiveData(USART1); // 读取数据， 清除标志位
        if(byte == '0')blinkInterval = 1000;
        else if(byte == '1')blinkInterval = 200;
        else if(byte == '2')blinkInterval = 50;
    }
}
```

这样我们的全部工作就做完了，下面是main.c中完整的代码：

```c
#include "stm32f10x.h"
#include "delay.h"

uint32_t blinkInterval = 1000; // 闪灯间隔

// 板载LED初始化函数
void App_OnBoardLED_Init(void)
{
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE); // 开启GPIOC时钟
    
    GPIO_InitTypeDef GPIO_InitStruct;
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_13; // PC13引脚
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_Out_OD; // 输出开漏模式
    GPIO_InitStruct.GPIO_Speed = GPIO_Speed_2MHz;
    
    GPIO_Init(GPIOC, &GPIO_InitStruct);
}

// 串口初始化函数
void App_USART1_Init(void)
{
    // #1. 初始化IO引脚
    GPIO_InitTypeDef GPIO_InitStruct;
    // PA9 AF_PP
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP; // 复用推挽
    GPIO_Initstruct.GPIO_Speed = GPIO_Speed_2MHz;
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // PA10 IPU
     RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU; // 输入上拉模式
    GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // #2. 初始化USART1
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1, ENABLE); // 开始USART1时钟
    
    USART_InitTypeDef USART_InitStruct;
    
    USART_InitStruct.USART_BaudRate = 115200;
    USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None; // 硬件流控
    USART_InitStruct.USART_Mode = USART_Mode_Tx | USART_Mode_Rx; // 数据接收与发送
    USART_InitStruct.USART_Parity = USART_Parity_No; // 校验方式为没有校验
    USART_InitStruct.USART_StopBits = USART_StopBits_1; // 1位停止位
    USART_InitStruct.USART_WordLength = USART_WordLength_8b; // 8位数据位
    
    USART_Init(USART1, &USART_InitStruct);
    
    // 闭合总开关
    USART_Cmd(USART1, ENABLE);
    
    // #3. 配置中断
    USART_ITConfig(USART1, USART_IT_RxNE, ENABLE);
    
    // #4. 配置NVIC
    NVIC_InitTypeDef NVIC_InitStruct;
    NVIC_InitStruct.NVIC_IRQChannel = USART1_IRQn; // 中断名称，见stm32f10x.h IRQn
    NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority = 0; // 抢占优先级
    NVIC_InitStruct.NVIC_IRQChannelSubPriority = 0; // 子优先级
    NVIC_InitStruct.NVIC_IRQChannelCmd = ENABLE; // 开关状态
    NVIC_Init(&NVIC_InitStruct);
}

// 主程序
int main(void)
{
    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2); // 中断优先级分组2
    
    App_OnBoardLED_Init();
    App_USART1_Init();
    while(1)
    {
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_RESET); // 亮灯
        Delay(blinkInterval);// 延迟一段时间
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, Bit_SET);// 灭灯
        Delay(blinkInterval);// 延迟一段时间
    }
}

// 中断响应函数
void USART1_IRQHandler(void)
{
    // 判断中断的产生原因
    if(USART_GetFlagStatus(USART1, USART_FLAG_RXNE) == SET)
    {
        uint8_t byte = USART_ReceiveData(USART1); // 读取数据， 清除标志位
        if(byte == '0')blinkInterval = 1000;
        else if(byte == '1')blinkInterval = 200;
        else if(byte == '2')blinkInterval = 50;
    }
}
```

到这里stm32中断相关的基础知识就讲完了，后续可能还会再写一篇EXTI相关的文章吧。。。