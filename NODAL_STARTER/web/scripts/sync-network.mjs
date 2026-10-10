// Copies the READ-ONLY shared contract (../shared/network.json) into web/src/data/network.json
// so the Next build can import it. It never edits the shared file and never alters IDs/positions.
// If the shared file is missing (e.g. web/ deployed alone), the committed copy is used as-is.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shared = resolve(here, "../../shared/network.json");
const local = resolve(here, "../src/data/network.json");

if (!existsSync(shared)) {
  console.warn(`[sync-network] ${shared} not found — using committed copy at src/data/network.json`);
  process.exit(existsSync(local) ? 0 : 1);
}
const text = readFileSync(shared, "utf8");
JSON.parse(text); // fail loudly on invalid JSON
mkdirSync(dirname(local), { recursive: true });
if (!existsSync(local) || readFileSync(local, "utf8") !== text) {
  writeFileSync(local, text);
  console.log("[sync-network] updated src/data/network.json from shared/network.json");
} else {
  console.log("[sync-network] src/data/network.json already matches shared/network.json");
}
