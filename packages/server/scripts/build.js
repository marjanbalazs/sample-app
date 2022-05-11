const esbuild = require("esbuild");

esbuild
  .build({
    treeShaking: true,
    minify: true,
    target: ["node16.15.0"],
    outdir: "./dist",
    entryPoints: ["./src/app.ts"],
    bundle: true,
    platform: "node",
    loader: {
      ".graphql": "text",
    },
  })
  .then(() => console.log("Server built!"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
