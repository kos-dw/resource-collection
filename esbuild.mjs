import * as esbuild from "esbuild";

let result = await esbuild.build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: ["node10.4"],
  outfile: "dist/app.js",
});

console.log(result);
