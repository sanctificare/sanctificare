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
});
