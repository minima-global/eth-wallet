import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";
import legacy from "@vitejs/plugin-legacy";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default ({ mode }) => {
  let devEnv = "";
  const env = Object.assign(
    globalThis.process.env,
    loadEnv(mode, globalThis.process.cwd())
  );

  if (mode === "development") {
    devEnv = `
      <script>
        var DEBUG = "${env.VITE_DEBUG}" === 'true';
        var DEBUG_HOST = "${env.VITE_DEBUG_HOST}";
        var DEBUG_PORT = "${env.VITE_DEBUG_MDS_PORT}";
        var DEBUG_UID = "${env.VITE_DEBUG_UID}";
      </script>
    `;
  }

  return defineConfig({
    base: "",
    build: {
      outDir: "build",
    },
    plugins: [
      react(),
      legacy({
        targets: ["defaults", "not IE 11", "Android >= 9"],
      }),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
      createHtmlPlugin({
        inject: {
          data: {
            devEnv,
          },
        },
      }),
    ],
  });
};
