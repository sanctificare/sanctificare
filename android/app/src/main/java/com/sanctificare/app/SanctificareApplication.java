package com.sanctificare.app;

import android.app.Application;
import android.util.Log;
import com.onesignal.OneSignal;
import com.onesignal.Continue;

public class SanctificareApplication extends Application {
    private static final String TAG = "SanctificareApp";
    private static final String ONESIGNAL_APP_ID = "c07a7a80-e44b-4087-bfbc-8d2c843bfbeb";

    @Override
    public void onCreate() {
        super.onCreate();

        // 1. Inicializar logs de depuração do OneSignal
        OneSignal.getDebug().setLogLevel(com.onesignal.debug.LogLevel.WARN);

        // 2. Inicializar OneSignal
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // 3. Solicitar permissão nativa de notificações push sem caixa de diálogo de teste
        OneSignal.getNotifications().requestPermission(true, Continue.none());
    }
}
