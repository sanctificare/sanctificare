import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
  const assetsDir = path.resolve("assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log("Created assets directory");
  }

  const logoSrc = path.resolve("client/public/assets/logo-sanctificare.webp");
  console.log("Source logo path:", logoSrc);

  try {
    // 1. icon-only.png (1024x1024, transparent background, centered)
    console.log("Generating icon-only.png...");
    await sharp(logoSrc)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(path.join(assetsDir, "icon-only.png"));

    // 2. icon-foreground.png (1024x1024, transparent background, centered at 600x600 for safe zone)
    console.log("Generating icon-foreground.png...");
    await sharp(logoSrc)
      .resize(600, 600, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: 212,
        bottom: 212,
        left: 212,
        right: 212,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(path.join(assetsDir, "icon-foreground.png"));

    // 3. icon-background.png (1024x1024, solid navy #0f172a background)
    console.log("Generating icon-background.png...");
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .png()
      .toFile(path.join(assetsDir, "icon-background.png"));

    // 4. splash.png (2732x2732, centered logo on navy background)
    console.log("Generating splash.png...");
    const logoResized = await sharp(logoSrc)
      .resize(800, 800, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    await sharp({
      create: {
        width: 2732,
        height: 2732,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .composite([{ input: logoResized, gravity: "center" }])
      .png()
      .toFile(path.join(assetsDir, "splash.png"));

    // 5. splash-dark.png (2732x2732, identical to splash.png)
    console.log("Generating splash-dark.png...");
    await sharp({
      create: {
        width: 2732,
        height: 2732,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .composite([{ input: logoResized, gravity: "center" }])
      .png()
      .toFile(path.join(assetsDir, "splash-dark.png"));

    console.log("All assets generated successfully in assets/ directory!");
  } catch (err) {
    console.error("Error generating assets:", err);
  }
}

main();
