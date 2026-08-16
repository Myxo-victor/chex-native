#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/android"
if [ -f ./gradlew ]; then
  ./gradlew clean assembleDebug
else
  echo "gradlew not found. Open ./android in Android Studio and generate wrapper." >&2
  exit 1
fi
