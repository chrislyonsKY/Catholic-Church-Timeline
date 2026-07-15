import { copyFile, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const buildRoot = fileURLToPath(new URL("../dist/", import.meta.url));
const publishedAssets = fileURLToPath(new URL("../assets/", import.meta.url));

await rm(publishedAssets, { force: true, recursive: true });
await cp(`${buildRoot}/assets`, publishedAssets, { recursive: true });
await copyFile(`${buildRoot}/index.html`, `${repositoryRoot}/index.html`);
await copyFile(`${buildRoot}/favicon.svg`, `${repositoryRoot}/favicon.svg`);

console.log("Prepared the versioned GitHub Pages bundle in the repository root.");
