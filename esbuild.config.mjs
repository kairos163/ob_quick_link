import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron"],
  format: "cjs",
  target: "es2022",
  outfile: "main.js",
  sourcemap: prod ? false : "inline",
  minify: prod,
  platform: "node",
  logLevel: "info",
});

if (prod) {
  await context.rebuild();
  await context.dispose();
  console.log("Production build complete.");
} else {
  await context.watch();
  console.log("Watching for changes...");
}
