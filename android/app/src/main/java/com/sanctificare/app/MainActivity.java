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
        // Pinta o WebView com a mesma cor do tema claro (#faf7f2 creme) para
        // eliminar o flash escuro→claro entre o splash nativo e o conteúdo React.
        getBridge().getWebView().setBackgroundColor(Color.parseColor("#faf7f2"));
    }
}
