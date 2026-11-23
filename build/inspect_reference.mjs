import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/thomas-illiet/Documents/Codex/2026-11-03/dans-ce-repo-je-voudrais-que/outputs/Agentic-Platform-BNP-Paribas.pptx";
const out = path.resolve("build/reference-theme");
await fs.mkdir(out, { recursive: true });
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
async function save(file, blob) { await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer())); }
await save(path.join(out, "montage.webp"), await deck.export({ format: "webp", montage: true, scale: 0.35 }));
for (let i = 0; i < deck.slides.items.length; i++) {
  await save(path.join(out, `slide-${String(i + 1).padStart(2, "0")}.png`), await deck.export({ slide: deck.slides.getItem(i), format: "png", scale: 1 }));
}
const inspection = await deck.inspect({ kind: "slide,textbox,shape,image,layout", maxChars: 12000 });
await fs.writeFile(path.join(out, "inspect.ndjson"), inspection.ndjson ?? JSON.stringify(inspection, null, 2));
console.log(JSON.stringify({ slides: deck.slides.items.length, out }));
