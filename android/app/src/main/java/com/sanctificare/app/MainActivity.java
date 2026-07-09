package com.sanctificare.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);
        // Pinta o WebView com a mesma cor do splash nativo (#050B1E) para
        // eliminar o flash branco do WebView antes do carregamento do HTML/CSS.
        getBridge().getWebView().setBackgroundColor(Color.parseColor("#050B1E"));
    }
}
