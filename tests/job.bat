@echo off
set JOB_NAME=%1
shift
set ARGS=%*
echo Running job %JOB_NAME% with args: %ARGS%
set /a "rand=%random% %% 10"
if %rand% lss 7 (
  echo Job %JOB_NAME% succeeded
  exit /b 0
) else (
  echo Job %JOB_NAME% failed
  exit /b 1
)
