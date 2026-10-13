import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const resolvePath = (path: string): string => {
  return fileURLToPath(new URL(path, import.meta.url));
};

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
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
      "@castorice": resolvePath("./src/modules/Castorice"),
      "@cyrene": resolvePath("./src/modules/Cyrene"),
      "@evernight": resolvePath("./src/modules/Evernight"),
      "@permansor": resolvePath("./src/modules/Permansor"),
      "@elysia": resolvePath("./src/modules/Elysia"),
    },
  },
});
