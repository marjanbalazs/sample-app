const esbuild = require("esbuild");

esbuild
  .build({
    treeShaking: true,
    minify: true,
    outdir: "./dist",
    entryPoints: ["./src/app.tsx"],
    bundle: true,
    platform: "browser",
  })
  .then(() => console.log("Client built!"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
