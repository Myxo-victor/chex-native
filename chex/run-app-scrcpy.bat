@echo off
setlocal

cd /d "%~dp0"

set SCRCPY_EXE=C:\Users\HP\Documents\scrcpy-win64-v3.3.4\scrcpy.exe
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set APP_ID=com.venjsx.mobile
set MAIN_ACTIVITY=com.venjsx.MainActivity

echo [0/6] Validating tools...
if not exist "%SCRCPY_EXE%" (
  echo ERROR: scrcpy not found at:
  echo %SCRCPY_EXE%
  exit /b 1
)

where adb >nul 2>nul
if errorlevel 1 (
  echo ERROR: adb not found in PATH. Add Android SDK platform-tools to PATH.
  exit /b 1
)

if not exist "android\gradlew.bat" (
  echo ERROR: android\gradlew.bat not found.
  exit /b 1
)

echo [1/6] Checking device connection...
adb get-state >nul 2>nul
if errorlevel 1 (
  echo ERROR: No adb device detected. Connect phone and enable USB debugging.
  exit /b 1
)

echo [2/6] Starting scrcpy...
start "scrcpy" "%SCRCPY_EXE%"

echo [3/6] Building debug APK...
call android\gradlew.bat -p android assembleDebug
if errorlevel 1 (
  echo ERROR: Gradle build failed.
  echo NOTE: If gradle-wrapper.jar is missing, open android\ in Android Studio once and sync.
  exit /b 1
)

echo [4/6] Installing APK...
adb install -r "%APK_PATH%"
if errorlevel 1 (
  echo ERROR: APK install failed.
  exit /b 1
)

echo [5/6] Launching app...
adb shell am start -n %APP_ID%/%MAIN_ACTIVITY%
if errorlevel 1 (
  echo ERROR: Launch command failed.
  exit /b 1
)

echo [6/6] Done. App should be visible in scrcpy.
endlocal
