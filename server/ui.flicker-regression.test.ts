import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("flicker regression guards", () => {
  it("only activates an OTA bundle before React renders", () => {
    const source = readSource("client/src/main.tsx");
    const activationIndex = source.indexOf("CapacitorUpdater.set(");
    const renderIndex = source.indexOf("createRoot(");

    expect(activationIndex).toBeGreaterThan(-1);
    expect(activationIndex).toBeLessThan(renderIndex);
    expect(source).not.toMatch(/CapacitorUpdater\.next\s*\(/);
  });

  it("shares one import promise between route preload and React.lazy", () => {
    const source = readSource("client/src/App.tsx");

    expect(source).toContain("modulePromise ??= factory()");
    expect(source).toContain("lazy(load)");
    expect(source).toContain("Component.preload = load");
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
    const source = readSource("client/src/hooks/useUserTemplate.ts");
    expect(source).toContain("sanctificare_user_template");
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
  });

  it("ensures HTML boot splash and CSS viewports use consistent background variables", () => {
    const indexHtml = readSource("client/index.html");
    expect(indexHtml).toContain("background-color: #faf7f2");
    expect(indexHtml).not.toContain(".is-native, .is-native body");

    const indexCss = readSource("client/src/index.css");
    expect(indexCss).toContain("background-color: var(--background)");
    expect(indexCss).not.toContain(".mobile-app-viewport {\n    min-height: 100%;\n    min-height: 100svh;\n    min-height: 100dvh;\n    width: 100%;\n    max-width: 100%;\n    overflow-x: hidden;\n    background-color: oklch(0.12 0.03 260);");
  });

  it("defines and uses ALL_ROUTES consistently for idle preloading", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).toContain("const ALL_ROUTES: PreloadableComponent<React.ComponentType<any>>[] = [");
    expect(source).toContain("preloadRoutes(ALL_ROUTES)");
    expect(source).not.toContain("preloadRoutes(CRITICAL_PRELOAD_ROUTES)");
  });

  it("ensures SuspenseLoader and HomeRoute transitions are instant and non-collapsing", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).toMatch(/function SuspenseLoader\(\)\s*\{\s*return null;\s*\}/);
    expect(source).toContain('<Redirect to="/dashboard" replace />');
  });
});
