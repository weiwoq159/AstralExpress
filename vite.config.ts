import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const resolvePath = (path: string): string => {
  return fileURLToPath(new URL(path, import.meta.url));
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": resolvePath("./src"),
      "@tribios": resolvePath("./src/modules/Tribios"),
      "@cifera": resolvePath("./src/modules/Cifera"),
    },
  },
});
