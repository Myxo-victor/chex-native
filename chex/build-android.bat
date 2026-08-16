@echo off
setlocal
cd /d "%~dp0android"
if exist gradlew.bat (
  call gradlew.bat clean assembleDebug
) else (
  echo gradlew.bat not found. Open ./android in Android Studio and run the Gradle wrapper task.
  exit /b 1
)
endlocal
