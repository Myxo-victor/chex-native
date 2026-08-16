import UIKit
import WebKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var webView: WKWebView!
  // VenjsXEngine is retained as the internal bridge type during the Chex migration.
  var chexEngine: VenjsXEngine!
  private var chexNavigationDelegate: WKNavigationDelegate?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    window = UIWindow(frame: UIScreen.main.bounds)
    let rootVC = UIViewController()
    rootVC.view.backgroundColor = .white
    window?.rootViewController = rootVC
    window?.makeKeyAndVisible()

    let contentController = WKUserContentController()
    let config = WKWebViewConfiguration()
    config.userContentController = contentController

    webView = WKWebView(frame: .zero, configuration: config)
    webView.isHidden = true

    // Native Chex content belongs inside the safe area on iPhone and iPad.
    // The bridge WebView remains invisible and only transports JS messages.
    let nativeRoot = UIView()
    nativeRoot.backgroundColor = .systemBackground
    nativeRoot.translatesAutoresizingMaskIntoConstraints = false
    rootVC.view.addSubview(nativeRoot)
    NSLayoutConstraint.activate([
      nativeRoot.leadingAnchor.constraint(equalTo: rootVC.view.safeAreaLayoutGuide.leadingAnchor),
      nativeRoot.trailingAnchor.constraint(equalTo: rootVC.view.safeAreaLayoutGuide.trailingAnchor),
      nativeRoot.topAnchor.constraint(equalTo: rootVC.view.safeAreaLayoutGuide.topAnchor),
      nativeRoot.bottomAnchor.constraint(equalTo: rootVC.view.safeAreaLayoutGuide.bottomAnchor)
    ])
    webView.translatesAutoresizingMaskIntoConstraints = false
    rootVC.view.addSubview(webView)
    NSLayoutConstraint.activate([
      webView.widthAnchor.constraint(equalToConstant: 1),
      webView.heightAnchor.constraint(equalToConstant: 1),
      webView.leadingAnchor.constraint(equalTo: rootVC.view.leadingAnchor),
      webView.topAnchor.constraint(equalTo: rootVC.view.topAnchor)
    ])

    chexEngine = VenjsXEngine(controller: rootVC, container: nativeRoot, bridgeWebView: webView)
    webView.uiDelegate = chexEngine
    contentController.add(chexEngine, name: "processUINode")
    contentController.add(chexEngine, name: "openExternalURL")
    contentController.add(chexEngine, name: "deviceRequest")

    UNUserNotificationCenter.current().delegate = self

    if let localUrl = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "app") {
      #if DEBUG && targetEnvironment(simulator)
      let devUrl = URL(string: "http://localhost:5173/index.html")
      let delegate = VenjsXDevFallbackNavigationDelegate(webView: webView, devUrl: devUrl, localUrl: localUrl)
      chexNavigationDelegate = delegate
      webView.navigationDelegate = delegate
      if let devUrl {
        webView.load(URLRequest(url: devUrl, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData))
      } else {
        webView.loadFileURL(localUrl, allowingReadAccessTo: localUrl.deletingLastPathComponent())
      }
      #else
      webView.loadFileURL(localUrl, allowingReadAccessTo: localUrl.deletingLastPathComponent())
      #endif
    }

    return true
  }

  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    chexEngine.setApnsToken(token)
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Chex: failed to register for remote notifications: \(error.localizedDescription)")
  }

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    chexEngine.emitNotificationReceived(userInfo, title: nil, body: nil)
    completionHandler(.noData)
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let content = notification.request.content
    chexEngine.emitNotificationReceived(content.userInfo, title: content.title, body: content.body)
    completionHandler([.banner, .sound, .badge])
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let content = response.notification.request.content
    chexEngine.emitNotificationTapped(content.userInfo)
    completionHandler()
  }
}

final class VenjsXDevFallbackNavigationDelegate: NSObject, WKNavigationDelegate {
  private weak var webView: WKWebView?
  private let devUrl: URL?
  private let localUrl: URL
  private var attemptedDev = false

  init(webView: WKWebView, devUrl: URL?, localUrl: URL) {
    self.webView = webView
    self.devUrl = devUrl
    self.localUrl = localUrl
    self.attemptedDev = devUrl != nil
  }

  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    fallbackIfNeeded(webView)
  }

  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    fallbackIfNeeded(webView)
  }

  private func fallbackIfNeeded(_ webView: WKWebView) {
    guard attemptedDev else { return }
    attemptedDev = false
    webView.loadFileURL(localUrl, allowingReadAccessTo: localUrl.deletingLastPathComponent())
  }
}



