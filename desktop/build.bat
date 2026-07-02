@echo off
echo Building FlipClock Desktop Launcher...

:: Copy the web build
xcopy /E /Y ..\web\dist dist\ >nul

:: Build
go build -ldflags="-s -w" -o flipclock-desktop.exe .

echo.
echo Done: flipclock-desktop.exe
echo.
