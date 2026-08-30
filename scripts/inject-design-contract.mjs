import { promises as fs } from "node:fs";
import path from "node:path";

const contract = `<!--
THESIS: Admin home behaves like a control ledger; it refuses the generic summary-card dashboard.
OWN-WORLD: Cool technical paper, near-black structure, inspection green, fine rules, and sharp ledger controls.
STORY: Admin enters a permitted task, then scans live access activity from Supabase.
FIRST VIEWPORT: Narrow dark rail; dominant shift brief; right inspection rail; entry rows; activity ledger below; manage-users is the primary action.
FORM: Control Ledger, grounded direction 7, seed 14d74052.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

const serverApp = path.join(process.cwd(), ".next", "server", "app");
const files = await walk(serverApp).catch(() => []);

for (const file of files) {
  const html = await fs.readFile(file, "utf8");
  if (!html.includes("14d74052")) {
    await fs.writeFile(file, html.replace("<body>", `<body>${contract}`));
  }
}

console.log(`Design contract injected into ${files.length} HTML artifact(s).`);
