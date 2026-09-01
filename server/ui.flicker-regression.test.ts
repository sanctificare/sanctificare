import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("flicker regression guards", () => {
  it("does not invoke automatic OTA activation or download", () => {
    const source = readSource("client/src/main.tsx");
    expect(source).not.toContain("void activatePendingOtaBeforeRender(");
    expect(source).not.toContain("void checkForOtaUpdate(");
    expect(source).toContain("const isOtaEnabled = false");
    expect(source).toContain('localStorage.removeItem("sanctificare_ota_pending_version")');
  });

  it("does not preload every route and stall low-memory WebViews", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).not.toContain("ALL_ROUTES");
    expect(source).not.toContain("preloadRoutes(");
  });

  it("does not animate the boot splash opacity", () => {
    const source = readSource("client/index.html");

    expect(source).not.toContain("boot-pulse");
  });

  it("does not intercept clicks globally with double popstate dispatch", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).not.toContain("handleDocumentClick");
    expect(source).not.toContain("new PopStateEvent(\"popstate\")");
  });

  it("excludes heavy offline cache keys from cloud state sync", () => {
    const source = readSource("client/src/lib/userStateSync.ts");
    expect(source).toContain("sanctificare_offline_");
    expect(source).toContain("sanctificare_liturgy_cache_");
  });

  it("caches template locally to prevent runtime restyle flicker", () => {
    const hookSource = readSource("client/src/hooks/useUserTemplate.ts");
    const mainSource = readSource("client/src/main.tsx");
    expect(hookSource).toContain("sanctificare_user_template");
    expect(mainSource.indexOf("applyCachedUserTemplate()"))
      .toBeLessThan(mainSource.indexOf("createRoot("));
  });

  it("keeps MobileBottomNav stable without authentication pop-in", () => {
    const source = readSource("client/src/components/MobileBottomNav.tsx");
    expect(source).not.toMatch(/if\s*\(!isAuthenticated\)\s*return\s*null/);
  });

  it("unifies Android native WebView background color with light theme cream", () => {
    const mainActivity = readSource("android/app/src/main/java/com/sanctificare/app/MainActivity.java");
    expect(mainActivity).toContain('Color.parseColor("#faf7f2")');
    expect(mainActivity).not.toContain('Color.parseColor("#050B1E")');

    const capConfigTs = readSource("capacitor.config.ts");
    expect(capConfigTs).toContain("backgroundColor: '#faf7f2'");

    const capConfigJson = readSource("android/app/src/main/assets/capacitor.config.json");
    expect(capConfigJson).toContain('"backgroundColor": "#faf7f2"');

    const stylesXml = readSource("android/app/src/main/res/values/styles.xml");
    expect(stylesXml).toContain('<item name="android:background">#faf7f2</item>');
    expect(stylesXml).toContain('<item name="android:windowBackground">#faf7f2</item>');
    expect(stylesXml).toContain('<item name="windowSplashScreenBackground">#faf7f2</item>');
  });

  it("ensures HTML boot splash and CSS viewports use consistent background variables", () => {
    const indexHtml = readSource("client/index.html");
    expect(indexHtml).toContain("background-color: #faf7f2");
    expect(indexHtml).not.toContain(".is-native, .is-native body");

    const indexCss = readSource("client/src/index.css");
    expect(indexCss).toContain("background-color: var(--background)");
    expect(indexCss).not.toContain(".mobile-app-viewport {\n    min-height: 100%;\n    min-height: 100svh;\n    min-height: 100dvh;\n    width: 100%;\n    max-width: 100%;\n    overflow-x: hidden;\n    background-color: oklch(0.12 0.03 260);");
  });

  it("keeps lazy-route loading non-collapsing and on the same background", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).toContain('className="min-h-[var(--app-viewport-height)] bg-background"');
    expect(source).toContain('<Redirect to="/dashboard" replace />');
  });

  it("ensures scroll stability and avoids resetting scroll during in-page interaction", () => {
    const appSource = readSource("client/src/App.tsx");
    expect(appSource).not.toContain("window.scrollTo");

    const cssSource = readSource("client/src/index.css");
    expect(cssSource).not.toMatch(/body,\s*#root\s*\{[^}]*overflow-y:\s*auto/);
    expect(cssSource).not.toContain("content-visibility: auto");
    expect(cssSource).not.toContain("100dvh");
    expect(cssSource).toContain("--app-viewport-height: 100svh");

    const dashboardSource = readSource("client/src/pages/Dashboard.tsx");
    expect(dashboardSource).not.toMatch(/<div className="min-h-screen[^"]*overflow-hidden/);
  });

  it("keeps production WebView diagnostics off and disables updater auto checks", () => {
    const activity = readSource("android/app/src/main/java/com/sanctificare/app/MainActivity.java");
    expect(activity).toContain("ApplicationInfo.FLAG_DEBUGGABLE");
    expect(activity).toContain("WebView.setWebContentsDebuggingEnabled(isDebuggable)");

    const config = readSource("capacitor.config.ts");
    expect(config).toContain("autoUpdate: 'off'");
    expect(config).toContain("resetWhenUpdate: true");
  });
});
