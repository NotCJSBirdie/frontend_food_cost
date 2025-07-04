import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Ensures correct paths for Amplify Hosting
  build: {
    outDir: "dist",
  },
});
