# venjsX iOS Shell

This folder now includes a native Xcode project:
- `venjsX.xcodeproj`
- `AppDelegate.swift`
- `VenjsXEngine.swift`
- bundled JS app under `app/`

## Build
1. Open `venjsX.xcodeproj` in Xcode (macOS).
2. Select the `venjsX` scheme.
3. Run on iOS simulator or device.

## Runtime flow
- JS app executes in hidden `WKWebView`.
- JS sends UI tree JSON through `processUINode`.
- `VenjsXEngine.swift` renders UIKit views.
