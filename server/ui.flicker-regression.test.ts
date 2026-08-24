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
});
