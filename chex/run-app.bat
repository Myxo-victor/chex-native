@echo off
setlocal

cd /d "%~dp0"

set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set APP_ID=com.venjsx.mobile
set MAIN_ACTIVITY=com.venjsx.MainActivity

echo [1/4] Building debug APK...
if not exist "android\gradlew.bat" (
  echo ERROR: android\gradlew.bat not found.
  exit /b 1
)

call android\gradlew.bat -p android assembleDebug
if errorlevel 1 (
  echo ERROR: Gradle build failed.
  echo NOTE: If gradle-wrapper.jar is missing, open android\ in Android Studio once to generate wrapper files.
  exit /b 1
)

echo [2/4] Checking device connection...
adb devices

echo [3/4] Installing APK...
adb install -r "%APK_PATH%"
if errorlevel 1 (
  echo ERROR: APK install failed.
  exit /b 1
)

echo [4/4] Launching app...
adb shell am start -n %APP_ID%/%MAIN_ACTIVITY%
if errorlevel 1 (
  echo ERROR: Launch command failed.
  exit /b 1
)

echo Done. App should now be visible (including in scrcpy if running).
endlocal
