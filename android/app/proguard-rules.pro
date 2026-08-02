# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- Rules for Glide (Image Loading & Memory Optimization) ---
-keep class com.bumptech.glide.** { *; }
-keepclassmembers class * implements com.bumptech.glide.module.GlideModule {
    public <init>(...);
}
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.bumptech.glide.annotation.GlideOption <methods>;
    @com.bumptech.glide.annotation.GlideExtension <methods>;
}
-dontwarn com.bumptech.glide.**

# --- Rules for OneSignal & Capacitor Native Utilities ---
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**

