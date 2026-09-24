import { app } from "../src/app.js";

// Vercel's Node runtime wraps this default-exported Express app as a
// serverless function; the root vercel.json's "services.backend" config
// rewrites /api/* and /health to it.
export default app;
