
# Keep JavaScript bridge method names used by WebView.addJavascriptInterface.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep source/line info for easier crash debugging in release.
-keepattributes SourceFile,LineNumberTable
