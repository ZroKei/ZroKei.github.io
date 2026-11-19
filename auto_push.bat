@echo off
setlocal
rem Auto commit + push on save. Keep this file ASCII-only (codepage safe).
cd /d "%~dp0"
set "LOG=%~dp0.git\auto-push.log"

rem ---- guards: never touch a repo that is mid-merge/rebase ----
if exist "%~dp0.git\rebase-merge" goto busy
if exist "%~dp0.git\rebase-apply" goto busy
if exist "%~dp0.git\MERGE_HEAD" goto busy

rem ---- guard: another git process is running (index locked) ----
if exist "%~dp0.git\index.lock" goto busy

rem ---- rotate log at 256 KB ----
if exist "%LOG%" for %%A in ("%LOG%") do if %%~zA GTR 262144 del "%LOG%" >nul 2>&1
echo [%time%] save>>"%LOG%"

git add -A >>"%LOG%" 2>&1
git diff-index --quiet HEAD -- >>"%LOG%" 2>&1
if not errorlevel 1 goto push

git commit -m "auto: blog save" >>"%LOG%" 2>&1
if errorlevel 1 goto fail

:push
git push --quiet >>"%LOG%" 2>&1
if not errorlevel 1 goto ok

rem remote moved on (e.g. edited on github.com): rebase, then retry once
git pull --rebase --autostash --quiet >>"%LOG%" 2>&1
if errorlevel 1 goto fail
git push --quiet >>"%LOG%" 2>&1
if errorlevel 1 goto fail
goto ok

:ok
if exist "%~dp0PUSH_FAILED.txt" del "%~dp0PUSH_FAILED.txt" >nul 2>&1
exit /b 0

:busy
echo [%time%] skipped: merge or rebase in progress>>"%LOG%"
exit /b 0

:fail
echo [%time%] FAILED - see this log>>"%LOG%"
echo push failed at %time% - see .git\auto-push.log>"%~dp0PUSH_FAILED.txt"
exit /b 1
