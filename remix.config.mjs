import path from "node:path";

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  cacheDirectory: path.join(process.cwd(), "node_modules", ".cache", "remix"),
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  serverBuildPath: "build/index.js",
  publicPath: "/build/",
  future: {
    unstable_cssSideEffectImports: true,
    unstable_dev: true,
    v2_routeConvention: true,
    unstable_tailwind: true,
  },
};