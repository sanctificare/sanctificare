import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

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
    // Ensure a single React copy is bundled (prevents duplicate React/scheduler instances)
    dedupe: ["react", "react-dom"],
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
          const normalized = id.replace(/\\/g, "/");
          if (!normalized.includes("/node_modules/")) return;

          // 1. React core runtime
          if (
            normalized.includes("/node_modules/react/") ||
            normalized.includes("/node_modules/react-dom/") ||
            normalized.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react-core";
          }

          // 2. Client-side routing
          if (normalized.includes("/node_modules/wouter/")) {
            return "vendor-wouter";
          }

          // 3. UI primitives and icons
          if (
            normalized.includes("/node_modules/@radix-ui/") ||
            normalized.includes("/node_modules/lucide-react/")
          ) {
            return "vendor-ui";
          }

          // 4. API, caching and serialization (tRPC, React Query, SuperJSON)
          if (
            normalized.includes("/node_modules/@tanstack/") ||
            normalized.includes("/node_modules/@trpc/") ||
            normalized.includes("/node_modules/superjson/")
          ) {
            return "vendor-query";
          }

          // 5. Heavy optional bundles
          if (
            normalized.includes("/node_modules/recharts/") ||
            normalized.includes("/node_modules/d3-")
          ) {
            return "vendor-charts";
          }
          if (
            normalized.includes("/node_modules/firebase/") ||
            normalized.includes("/node_modules/@firebase/")
          ) {
            return "vendor-firebase";
          }
          if (normalized.includes("/node_modules/date-fns/")) {
            return "vendor-date";
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
