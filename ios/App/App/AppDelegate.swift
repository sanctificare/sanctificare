import UIKit
import Capacitor
import OneSignalFramework

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, IPushSubscriptionObserver {

    var window: UIWindow?
    private var dialogShown = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 1. Inicializar logs de depuração do OneSignal (VERBOSE)
        OneSignal.Debug.setLogLevel(.LL_VERBOSE)
        
        // 2. Inicializar o SDK do OneSignal
        OneSignal.initialize("c07a7a80-e44b-4087-bfbc-8d2c843bfbeb", withLaunchOptions: launchOptions)
        
        // 3. Adicionar o AppDelegate como observador de inscrição de Push
        OneSignal.User.pushSubscription.addObserver(self)
        
        // 4. Avaliação imediata (caso o ID já esteja disponível)
        checkAndShowDialog()
        
        return true
    }

    // Callback executado quando o status de inscrição do Push muda
    func onPushSubscriptionChange(state: PushSubscriptionChangedState) {
        checkAndShowDialog()
    }

    private func checkAndShowDialog() {
        guard !dialogShown else { return }
        
        if let subscriptionId = OneSignal.User.pushSubscription.id,
           !subscriptionId.isEmpty,
           !subscriptionId.hasPrefix("local-") {
            
            dialogShown = true
            
            DispatchQueue.main.async {
                guard let rootViewController = self.window?.rootViewController else { return }
                
                let alert = UIAlertController(
                    title: "Your OneSignal SDK integration is complete!",
                    message: "You can now send Push Notifications & In-App Messages through OneSignal. Tap below to enable push notifications.",
                    preferredStyle: .alert
                )
                
                alert.addAction(UIAlertAction(title: "Got it", style: .default, handler: { _ in
                    // Solicita a permissão do sistema e redireciona para as configurações caso já tenha sido negada anteriormente
                    OneSignal.Notifications.requestPermission({ accepted in
                        print("User accepted notifications: \(accepted)")
                    }, fallbackToSettings: true)
                }))
                
                // Garantir que apresentamos o alerta no topo do controlador atual
                var topController = rootViewController
                while let presented = topController.presentedViewController {
                    topController = presented
                }
                
                topController.present(alert, animated: true, completion: nil)
            }
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
