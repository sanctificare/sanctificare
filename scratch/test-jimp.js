import { Jimp } from "jimp";

async function main() {
  try {
    const logo = await Jimp.read("client/public/assets/logo-sanctificare.webp");
    console.log("Successfully read webp logo! Dimensions:", logo.width, "x", logo.height);
  } catch (err) {
    console.error("Error reading webp logo:", err);
  }
}

main();
