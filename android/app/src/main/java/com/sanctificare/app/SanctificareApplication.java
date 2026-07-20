package com.sanctificare.app;

import android.app.Activity;
import android.app.Application;
import android.app.AlertDialog;
import android.os.Bundle;
import android.util.Log;
import com.onesignal.OneSignal;
import com.onesignal.Continue;
import com.onesignal.user.subscriptions.IPushSubscriptionObserver;
import com.onesignal.user.subscriptions.PushSubscriptionChangedState;

public class SanctificareApplication extends Application {
    private static final String TAG = "SanctificareApp";
    private static final String ONESIGNAL_APP_ID = "c07a7a80-e44b-4087-bfbc-8d2c843bfbeb";
    
    private Activity currentActivity = null;
    private boolean dialogShown = false;
    private IPushSubscriptionObserver pushObserver;

    @Override
    public void onCreate() {
        super.onCreate();

        // 1. Inicializar logs de depuração (VERBOSE)
        OneSignal.getDebug().setLogLevel(com.onesignal.debug.LogLevel.VERBOSE);

        // 2. Inicializar OneSignal
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // 3. Rastrear a Activity ativa para poder exibir o diálogo nativo
        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}
            @Override public void onActivityStarted(Activity activity) { currentActivity = activity; checkAndShowDialog(); }
            @Override public void onActivityResumed(Activity activity) { currentActivity = activity; checkAndShowDialog(); }
            @Override public void onActivityPaused(Activity activity) { if (currentActivity == activity) currentActivity = null; }
            @Override public void onActivityStopped(Activity activity) {}
            @Override public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}
            @Override public void onActivityDestroyed(Activity activity) {}
        });

        // 4. Registrar o Observer de Inscrição para verificação do Push
        pushObserver = new IPushSubscriptionObserver() {
            @Override
            public void onPushSubscriptionChange(PushSubscriptionChangedState state) {
                checkAndShowDialog();
            }
        };
        OneSignal.getUser().getPushSubscription().addObserver(pushObserver);

        // 5. Primeira avaliação imediata
        checkAndShowDialog();
    }

    private synchronized void checkAndShowDialog() {
        if (dialogShown || currentActivity == null) {
            return;
        }

        String subscriptionId = OneSignal.getUser().getPushSubscription().getId();
        if (subscriptionId != null && !subscriptionId.isEmpty() && !subscriptionId.startsWith("local-")) {
            dialogShown = true;
            
            currentActivity.runOnUiThread(() -> {
                new AlertDialog.Builder(currentActivity)
                    .setTitle("Your OneSignal SDK integration is complete!")
                    .setMessage("You can now send Push Notifications & In-App Messages through OneSignal. Tap below to enable push notifications.")
                    .setCancelable(false)
                    .setPositiveButton("Got it", (dialog, which) -> {
                        // Solicitar permissão de push nativa
                        OneSignal.getNotifications().requestPermission(true, Continue.none());
                    })
                    .show();
            });
        }
    }
}
