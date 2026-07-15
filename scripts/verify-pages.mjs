import { execFileSync } from "node:child_process";

const publishedPaths = ["index.html", "favicon.svg", "assets", ".nojekyll"];
const status = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all", "--", ...publishedPaths],
  { encoding: "utf8" },
);

if (status.trim()) {
  console.error("The committed Pages bundle is not current:");
  console.error(status.trimEnd());
  console.error("Run `npm run prepare:pages` and commit the generated files.");
  process.exitCode = 1;
} else {
  console.log("The committed Pages bundle matches the Vite production build.");
}
