# venjsX Android Shell

This folder contains a runnable Android app shell for venjsX.

## Build options

1. Android Studio (recommended)
- Open this `android/` folder in Android Studio.
- Let Android Studio sync and generate missing Gradle wrapper artifacts if needed.
- Run the `app` module.

2. CLI
- Ensure `gradle/wrapper/gradle-wrapper.jar` exists.
- Run `./gradlew assembleDebug` (or `gradlew.bat assembleDebug` on Windows).

## Notes
- JS entry: `app/src/main/assets/app/main.js`
- Framework core: `app/src/main/assets/js/venjsX.js`
