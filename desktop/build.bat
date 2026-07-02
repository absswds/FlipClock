@echo off
setlocal
echo Building FlipClock Desktop Launcher...

pushd ..\web
call npm run build
if errorlevel 1 (
    popd
    exit /b 1
)
popd

if exist dist rmdir /S /Q dist
mkdir dist
xcopy /E /Y ..\web\dist dist\ >nul
echo This placeholder keeps the embedded dist directory present for Go tests.> dist\placeholder.txt

go build -ldflags="-s -w -H=windowsgui" -o flipclock-desktop.exe .
if errorlevel 1 exit /b 1

echo.
echo Done: flipclock-desktop.exe
echo.
