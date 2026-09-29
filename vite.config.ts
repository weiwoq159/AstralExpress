import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { fileURLToPath } from "url";

const resolvePath = (path: string): string => {
  return fileURLToPath(new URL(path, import.meta.url));
};


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolvePath("./src"),
      "@tribios": resolvePath("./src/modules/Tribios"),
      "@aglaea": resolvePath("./src/modules/Aglaea"),
      "@cerydra": resolvePath("./src/modules/Cerydra"),
      "@cifera": resolvePath("./src/modules/Cifera"),
      "@helektra": resolvePath("./src/modules/Helektra"),
      "@hyacinthia": resolvePath("./src/modules/Hyacinthia"),
    },
  },
})
