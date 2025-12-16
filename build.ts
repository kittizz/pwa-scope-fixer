#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { Glob } from "bun";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { watch } from "fs";

const isWatch = process.argv.includes("--watch");
const outdir = path.join(process.cwd(), "dist");

async function build() {
  console.log(`\n🚀 Starting build process... (${isWatch ? "WATCH MODE" : "PRODUCTION"})\n`);
  const start = performance.now();

  // Shared config
  const sharedConfig: Bun.BuildConfig = {
    entrypoints: [],
    plugins: [plugin],
    minify: !isWatch,
    target: "browser",
    sourcemap: (isWatch ? "inline" : "linked") as "inline" | "linked",
    define: {
      "process.env.NODE_ENV": JSON.stringify(isWatch ? "development" : "production"),
    },
  };

  try {
    // 1. Build Popup
    console.log("📦 Building Popup...");
    const popupBuild = await Bun.build({
      ...sharedConfig,
      entrypoints: ["src/popup/index.html"],
      outdir: outdir,
      root: "src",
    });
    if (!popupBuild.success) throw new Error("Popup Build failed: " + popupBuild.logs);

    // 2. Build Options
    console.log("📦 Building Options...");
    const optionsBuild = await Bun.build({
      ...sharedConfig,
      entrypoints: ["src/options/index.html"],
      outdir: outdir,
      root: "src",
    });
    if (!optionsBuild.success) throw new Error("Options Build failed: " + optionsBuild.logs);

    // 3. Build Background Script
    console.log("📦 Building Background Script...");
    const backgroundBuild = await Bun.build({
      entrypoints: ["src/background/index.ts"],
      outdir: outdir,
      naming: "background.js",
      minify: !isWatch,
      target: "browser",
    });
    if (!backgroundBuild.success)
      throw new Error("Background Build failed: " + backgroundBuild.logs);

    // 4. Build Content Script
    console.log("📦 Building Content Script...");
    const contentBuild = await Bun.build({
      entrypoints: ["src/content/index.ts"],
      outdir: outdir,
      naming: "content.js",
      minify: !isWatch,
      target: "browser",
    });
    if (!contentBuild.success) throw new Error("Content Build failed: " + contentBuild.logs);

    // 5. Copy Manifest and Assets
    console.log("📂 Copying Manifest and Assets...");
    await Bun.write(path.join(outdir, "manifest.json"), Bun.file("src/manifest.json"));

    // Copy icons
    const glob = new Glob("src/icons/*");
    for await (const file of glob.scan()) {
      const fileName = path.basename(file);
      await Bun.write(path.join(outdir, "icons", fileName), Bun.file(file));
    }

    const end = performance.now();
    const buildTime = (end - start).toFixed(2);
    console.log(`\n✅ Build completed in ${buildTime}ms\n`);
  } catch (error) {
    console.error(error);
    if (!isWatch) process.exit(1);
  }
}

// Initial clean
if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

await build();

if (isWatch) {
  console.log("\n👀 Watching for changes in src/...");

  let debounceTimer: Timer | null = null;

  watch("src", { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith(".")) {
      console.log(`\n📄 Detected change in ${filename}`);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        build();
      }, 100);
    }
  });

  // Keep process alive
  setInterval(() => {}, 1000000);
}
