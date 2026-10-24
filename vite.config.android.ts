// Build SPA estático (sem servidor) para empacotar no Android via Capacitor.
// Uso: bun run build:android (não afeta o build web normal, que usa vite.config.ts).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: { enabled: true },
  },
  vite: {
    build: {
      target: "es2020",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
      assetsInlineLimit: 4096,
      reportCompressedSize: false,
    },
    esbuild: { drop: ["debugger"], legalComments: "none" },
  },
});
