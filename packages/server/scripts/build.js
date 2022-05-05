const esbuild = require("esbuild");

esbuild
  .build({
    treeShaking: true,
    minify: true,
    outdir: "./dist",
    entryPoints: ["./src/app.ts"],
    bundle: true,
    platform: "node",
  })
  .then(() => console.log("Server built!"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
