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
Clion的FreeRTOS调试器将有超时时间的阻塞态表述为Delayed，但实际上FreeRTOS对阻塞态的官方英文为Blocked。如果调用osThread函数，此时处于挂起态的任务StartSerialTask会处于挂起态，此时的运行状态也是Blocked，而FreeRTOS官方挂起态的英文是Suspended。这是因为FreeRTOS将无超时时间的阻塞态和挂起态任务都放入了同一个列表中，Clion没有区分，都标记为了Blocked。而我们区分的方法是：如果没有等待的时间那便是挂起态

![alt text](/image.png)

