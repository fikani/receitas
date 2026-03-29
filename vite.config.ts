import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["data/**/*.json", "sounds/**/*", "icons/**/*"],
      manifest: {
        name: "Meal Prep Planner",
        short_name: "MealPrep",
        description: "Planeje seu meal prep semanal",
        theme_color: "#FAF7F2",
        background_color: "#FAF7F2",
        display: "standalone",
        orientation: "portrait",
        start_url: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  base: "/receitas/",
});
