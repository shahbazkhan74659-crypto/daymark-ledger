// Bundles the Express app (and every dependency it imports) into a single
// self-contained JS file at frontend/api/index.js. This runs as part of the
// frontend Vercel service's buildCommand: Vercel's serverless-function
// packaging only traces files inside the project's Root Directory
// (frontend/), so the backend — a sibling directory — has to be pre-bundled
// into something that lives inside that root before Vercel scans api/.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(scriptDir, "..");
const rootDir = path.resolve(backendDir, "..");
const apiDir = path.join(rootDir, "frontend/api");

await build({
  entryPoints: [path.join(backendDir, "api-entry.ts")],
  outfile: path.join(apiDir, "index.js"),
  bundle: true,
  platform: "node",
  // CJS, not ESM: several bundled CJS dependencies (e.g. cookie-signature)
  // call require("crypto") internally, which Node's ESM loader rejects as a
  // "dynamic require" when esbuild emits an ESM bundle. CJS avoids that
  // interop failure entirely since require() of a built-in is native there.
  format: "cjs",
  target: "node24",
  logLevel: "info",
});

// pdfkit (used by pdfmake) loads its standard-14-font metrics from disk at
// PDF-generation time via a __dirname-relative path. esbuild rewrites
// __dirname inside bundled CJS modules to the *output* file's directory, not
// pdfkit's own — so its data/*.afm files have to physically exist next to
// the bundle for that runtime read to succeed.
fs.cpSync(
  path.join(backendDir, "node_modules/pdfkit/js/data"),
  path.join(apiDir, "data"),
  { recursive: true }
);
console.log("Copied pdfkit font data to frontend/api/data");
