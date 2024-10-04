import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { createRoutesFromFolders } from "@remix-run/v1-route-convention";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      routes(definedRoutes) {
        return createRoutesFromFolders(definedRoutes);
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
  },
});
