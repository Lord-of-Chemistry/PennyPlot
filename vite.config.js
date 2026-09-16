import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        navigateFallback: "/index.html",
      },

      manifest: {
        name: "PennyPlot",
        short_name: "PennyPlot",
        description: "Personal finance tracker",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
