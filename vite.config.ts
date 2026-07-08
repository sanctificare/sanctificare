import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const isProd = process.env.NODE_ENV === "production";
const plugins = [react(), tailwindcss(), ...(isProd ? [] : [jsxLocPlugin()])];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("recharts")) return "vendor-charts";
          if (id.includes("@capacitor")) return "vendor-capacitor";

          if (id.includes("react-dom")) return "vendor-react-dom";
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";

          if (id.includes("@radix-ui")) return "vendor-radix";

          if (
            id.includes("@trpc") ||
            id.includes("@tanstack/react-query") ||
            id.includes("superjson")
          ) {
            return "vendor-data";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
