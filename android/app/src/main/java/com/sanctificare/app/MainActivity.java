package com.sanctificare.app;

import android.graphics.Color;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        WebView.setWebContentsDebuggingEnabled(isDebuggable);
        // Pinta o WebView com a mesma cor do tema claro (#faf7f2 creme) para
        // eliminar o flash escuro→claro entre o splash nativo e o conteúdo React.
        getBridge().getWebView().setBackgroundColor(Color.parseColor("#faf7f2"));
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
        disableSystemDarkening(getBridge().getWebView());
    }

    // O tema claro/escuro é controlado pelo app; impede que o Android (modo
    // escuro do sistema ou "forçar escuro" de fabricantes) escureça o WebView.
    @SuppressWarnings("deprecation")
    private void disableSystemDarkening(WebView webView) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            webView.setForceDarkAllowed(false);
        }
        WebSettings settings = webView.getSettings();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            settings.setAlgorithmicDarkeningAllowed(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        }
    }
}
