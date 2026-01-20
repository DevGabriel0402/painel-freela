import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/loader.svg"],
      manifest: {
        name: "Flowyhub",
        short_name: "Flowyhub",
        description: "Dashboard de gestão para freelancers",
        start_url: ".",
        display: "standalone",
        background_color: "#0b0b0c",
        theme_color: "#111111",
        icons: [
          {
            src: "/icons/loader.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/loader.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
