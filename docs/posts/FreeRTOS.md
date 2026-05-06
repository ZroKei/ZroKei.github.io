# FreeRTOS

## 一、FreeRTOS如何实现两个任务并发

### 1. 程序运行的本质时CPU对内存、外设寄存器等存储元件的读写与计算

​	但是实际上CPU并不能直接对内存里的数据进行运算，而是通过寄存器进行读写操作，比如STM32F103系列芯片就又R0~R12，共13个32位通用寄存器

​	CPU要对内存中的数据进行计算时，先要将内存中的数据读取到寄存器中，计算完成后再将计算完成的数据写回内存中。

​	除了通用寄存器外，还有特殊寄存器，比如：

**R13：栈指针寄存器，简称SP寄存器（Stack Pointer）**

**R14：链接寄存器，简称LR寄存器（Link Register）**

**R15：程序计数寄存器，简称PC寄存器（Program Counter）**

其中，PC寄存器中存储着CPU将要执行的指令所在的Flash地址，每次执行完一个指令，将会指向下一个要执行的指令

FreeRTOS有一个叫做“时间片”的概念，默认情况下一个时间片是1ms，当FreeRTOS分给任务A一个时间片，也就是FreeRTOS要运行任务A1ms，这个时候PC寄存器就会指向任务A开头的指令，CPU也正常的执行相应的指令，当时间片耗尽之后，FreeRTOS会将此时各个寄存器的值存入到对应的任务栈中，然后分给任务B一个时间片，让任务B运行，每次切换所要执行的任务时，FreeRTOS都会将对应的寄存器中的值存入对应的任务栈中，然后将切换回的任务所对应的任务战中的各个寄存器的值全部出栈

其实，在FreeRTOS中还包括了**优先级、就绪、挂起、阻塞**等概念，每个任务之间也不都是这样的回合制切换。

**总结：任务切换的本质是在给CPU的寄存器“偷梁换柱”，将CPU寄存器值存入任务栈，以及从任务栈恢复寄存器值**

### 2.任务状态

示例代码：

```c
void StartLEDTask(void *argument)
{
  /* USER CODE BEGIN 5 */
  /* Infinite loop */
  for(;;)
  {
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_8);
    osDelay(500);
  }
  /* USER CODE END 5 */
}

/* USER CODE BEGIN Header_StartSerialTask */
/**
* @brief Function implementing the SerialTask thread.
* @param argument: Not used
* @retval None
*/
/* USER CODE END Header_StartSerialTask */
void StartSerialTask(void *argument)
{
  /* USER CODE BEGIN StartSerialTask */
  char msg[] = "Hello World";
  /* Infinite loop */
  for(;;)
  {
    HAL_UART_Transmit(&huart1, (uint8_t *)msg, sizeof(msg)-1, HAL_MAX_DELAY);
    osDelay(200);
  }
  /* USER CODE END StartSerialTask */
}
```

以上述代码为例，我们在每个任务函数中都加入了osDelay()延时函数，而FreeRTOS又存在时间片这一概念，那延时函数在调用时是否是在浪费时间片的时间，导致需要紧急运行的任务无法立马执行，甚至在运行时由于时间片耗尽而被打断。为了防止这种情况出现，FreeRTOS中每个任务都有一个**“任务状态”**的概念，用来划定哪个任务需要运行、哪个任务暂时不需要运行

当osThreadNew函数创建任务后，这些任务就会被FreeRTOS认为处于**就绪态**，等待被分配时间片运行，而当程序运行了osKernelStart系统内核启动，FreeRTOS的调度器就会从正在排队的就绪态任务中取出一个任务，分配时间片让其运行，此时这个任务的任务状态叫做**运行态**，当运行态的任务时间片耗尽时，FreeRTOS调度器就会将其送回就绪态排队，然后给下一个就绪态的任务分配时间片，让其进入运行态运行，这样循环就实现了任务依次分配时间片运行。

为了解决任务调用延时函数会空耗CPU等类似的问题，FreeRTOS又引入了**阻塞态**，当处于运行态的任务运行到osDelay函数进行延时，及时此时时间片没有耗尽，也会将自己的任务状态设为阻塞态，以此来让出CPU的运行资源，然后调度器在为下一个处于就绪态的任务分配时间片运行，而处于阻塞态的任务不再参与时间片的分配，知道osDelay的延时时间结束，调度器会再将其设置为就绪态重新开始排队，等待时间片的分配，解决了CPU会被占用的问题，这也是为什么在任务中我们使用osDelay而不是HAL_Delay的原因。

```c
__weak void HAL_Delay(uint32_t Delay)
{
  uint32_t tickstart = HAL_GetTick();
  uint32_t wait = Delay;

  /* Add a freq to guarantee minimum wait */
  if (wait < HAL_MAX_DELAY)
  {
    wait += (uint32_t)(uwTickFreq);
  }

  while ((HAL_GetTick() - tickstart) < wait)
  {
  }
}
```

上面是HAL_Delay函数的内容，HAL_Delay的原理是不断比较当前是否达到延迟时间，也就是占用着CPU不断运算，而osDelay则是让自己进入阻塞态不断等待，让出CPU的运行资源知道延时结束再等待被分配时间片

![8f90a3004cb9294c71207408beadd3e4](/8f90a3004cb9294c71207408beadd3e4.png)

在创建任务时，FreeRTOS会默认将代表正在运行的任务的指针变量(pxCurrentTCB)指向优先级最大的任务，一边调度器启动时直接执行，所以即使是FreeRTOS调度器尚未工作，调试工具也认为LEDTask处于运行态

![alt text](/edce9201299eb5bd2a3eb92ad297604f.png)

![alt text](/00d7184be35a89610b86e2f8881e3524.png)

在使用Clion进行调试时，会出现两个新的任务，其中IDLE任务是空闲任务，当没有就绪态任务时FreeRTOS就会执行它，用来做一些自动的资源整理。Tmr Svc是定时器任务，是用来处理FreRTOS的软件定时器的。
Clion的FreeRTOS调试器将有超时时间的阻塞态表述为Delayed，但实际上FreeRTOS对阻塞态的官方英文为Blocked。如果调用osThread函数，此时处于挂起态的任务StartSerialTask会处于挂起态，此时的运行状态也是Blocked，而FreeRTOS官方挂起态的英文是Suspended。这是因为FreeRTOS将无超时时间的阻塞态和挂起态任务都放入了同一个列表中，Clion没有区分，都标记为了Blocked。而我们区分的方法是：如果没有等待的时间那便是挂起态，而如果有等待的时间，那就说明任务会因事件发生而回到就绪态，因而是阻塞态

![alt text](/image.png)

![alt text](/image1.png)

然后是在调试过程中的一些问题，如上图所示，我们在使用Clion进行Debug的时候，右下角会弹出这个框，它的解决方法在Clion的文档中有所提及，总结为CubeMX中的配置如下图所示：

![alt text](/image2.png)

大多数默认配置就足够使用了，我们在CubeMX中可以将RECORD_STACK_HIGH_ADDRESS（开启记录栈顶地址）和GENERATE_RUN_TIME_STARTS（生成运行时统计）启用，然后生成代码就好了

### 3.任务优先级
每个任务均被分配了从0到（configMAX_PRIORITIES-1）的优先级，其中configMAX_PRIORITIES定义为FreeRTOSConfig.h

如果正在使用的移植实现了使用“前到零计数”类指令的移植优化任务选择机制（针对单一指令中的任务选择）而且configUSE_PORT_OPTIMISED_TASK_SELECTION在FreeRTOSConfig.h中设置为1，则configMAX_PRIORITIES无法高于32.在其他所有情况下，configMAX_PRIORITIES可以取任何合理数值————但为了保证RAM的使用效率，应取实际需要的最小值。

优先级数字小表示任务优先级低。空闲任务的优先级为零（tskIDLE_PRIORITY）。

FreeRTOS调度器可确保在就绪或运行状态下的任务使用比同样处于就绪状态下的更低优先级任务先获得处理器（CPU）事件。换句话说，处于运行状态的任务始终时能够运行的最高优先级任务。

处于相同优先级的任务数量不限。如果configUSE_TIME_SLICING未经定义，或者如果configUSE_TIME_SLICING设置为1，则具有相同优先级的若干就绪状态任务将通过时间切片轮询调度方案共享可用的处理时间。

优先级高的先执行，优先级低的后执行，排在同一优先级的任务会轮流分配时间片，不同优先级间，只有前面所有较高优先级的队空了，才能轮到后面较低优先级的队中的任务。而且如果高优先级的任务不进入挂起态或阻塞态，即使回到就绪态也还会继续获得时间片运行，所以就会一直占用CPU，因而如果有某个任务从不进入挂起或阻塞态的话，低于其优先级的任务就会产生“任务饥饿”，永远无法被执行到。
高优先级的任务确实重要，但一个系统的实现时所有任务协作完成的，一个任务独占资源的话，那不就是裸机程序吗。因而，除了最低优先级的任务（通常是IDLE空闲任务），其他所有任务必须要能够通过odDelay或者等待数据的方式进入挂起态或者就绪态，让底层任务有得以运行的机会。

### 4.抢占式调度
当一个高优先级的任务从挂起或阻塞态可以恢复到就绪态时，如果发现正在运行的任务优先级比较低，即使这个任务的时间片仍未耗尽，高优先级的任务也会强行抢占进入运行态，这就是RTOS的“抢占式调度”机制。

### 5.队列

::: code-group

```c [数据处理任务函数]
void StartDataTask(void *argument)
{
  /* USER CODE BEGIN StartDataTask */
  uint32_t dataCount = 0;
  char msg[50];
  /* Infinite loop */
  for(;;)
  {
    osDelay(10);
    if (btnPressed) {
      dataCount++;
      osDelay(1000);
      sprintf(msg, "按键：%d次，数据：%d次\r\n", (int)btnCount,(int)dataCount);
      HAL_UART_Transmit(&huart1, (uint8_t *)msg, strlen(msg), HAL_MAX_DELAY);
    }
  }
  /* USER CODE END StartDataTask */
}
```

```c [按键任务函数]
void StartBtnTask(void *argument)
{
  /* USER CODE BEGIN StartBtnTask */
  /* Infinite loop */
  for(;;)
  {
    if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_0) == GPIO_PIN_RESET) {
      osDelay(1);
      if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_0) == GPIO_PIN_RESET) {
        btnPressed = 1;
        btnCount++;
      }
      while (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_0) == GPIO_PIN_RESET) {
        osDelay(10);
      }
    } else {
      btnPressed = 0;
      osDelay(10);
    }
  }
  /* USER CODE END StartBtnTask */
}
```
:::

事件丢失：对于上面的按键函数任务和数据处理任务来说，如果我们在1秒内按下多次按键，按键次数自增，此时数据处理还在处理等待，当数据处理1秒结束后，就会发送数据：按键n次，数据1次。

事件重复：而当我们保持长按按键而不松开时，此时在串口发送的数据中，按键次数不会发生改变，而数据次数每秒自增1次，这是因为当我们按键按下时，数据任务被不断触发，但是由于我们的按键没有抬起，所以按键的次数没有发生自增。

队列（Queue）：队列就是一条数据运输的管道，产生数据的任务，我们称为生产者，它可以将数据塞入到管道中排队，而需要这个数据的任务我们称为消费者，它可以从队列中取出数据使用。生产者产生了多少条数据，消费者就只能取出多少条数据，所以就不会出现事件重复的问题。而且由于队列有一定的长度可以排队缓存数据，因此便不会出现因消费者在处理数据时无暇顾及而导致生产者产生的数据被忽略的这种事件丢失情况。
队列的长度是有限的，还是有可能发生溢出现象。

除了能解决上述的两个问题之外，队列更优雅的地方还在于，当队列中没有数据需要处理时，消费者无需像全局变量方案一样，一遍一遍的检查是否有新数据需要处理，而是将自己直接置于阻塞态，不再占用CPU运行资源，而当生产者向队列中塞入新的数据时，FreeRTOS便会将消费者唤醒到就绪态，等待获得时间片后取出新数据进行处理

由上述代码所示的情况下，我们可以将按键任务视为生产者，将数据处理任务视为消费者，我们没按下一次按键，按键任务就将按键次数塞入到队列中，数据处理任务依次取出进行处理，最后将取出来的次数依次输出出来。

![Queue](/Queue.png)