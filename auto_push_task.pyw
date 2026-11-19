"""计划任务入口：静默运行 auto_push.bat，不弹出控制台窗口。

由 Windows 计划任务每 10 分钟调用一次，也可以用 pythonw 双击运行。
pythonw.exe 属于 GUI 子系统，启动时不分配控制台；再由 CREATE_NO_WINDOW
把 cmd 也压成无窗口，整个过程用户不会看到黑框闪过。
"""

import os
import subprocess
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
BAT = os.path.join(BASE, "auto_push.bat")
CREATE_NO_WINDOW = 0x08000000


def main() -> int:
    if not os.path.exists(BAT):
        return 1
    try:
        subprocess.run(
            ["cmd.exe", "/c", BAT],
            cwd=BASE,
            creationflags=CREATE_NO_WINDOW,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=300,
        )
    except Exception:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
