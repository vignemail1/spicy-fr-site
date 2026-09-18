// Build : injecte data/content.yml dans assets/data.js (window.SITE_DATA)
// pour un rendu 100% statique. Aucune dépendance : node scripts/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const yaml = readFileSync(join(root, "..", "data", "content.yml"), "utf8");

const safe = yaml.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const js = `// Généré automatiquement par scripts/build.mjs — ne pas éditer. Source : data/content.yml
window.SITE_DATA = (function () {
  const lines = ${JSON.stringify(safe)}.split(/\\r?\\n/);
  let pos = 0;
  function unquote(s) {
    if (!s) return "";
    if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'"))) return s.slice(1, -1);
    return s;
  }
  function block(indent) {
    const obj = {};
    let arr = null;
    while (pos < lines.length) {
      const raw = lines[pos];
      if (!raw.trim() || raw.trim().startsWith("#")) { pos++; continue; }
      const cur = raw.match(/^\\s*/)[0].length;
      if (cur < indent) break;
      const line = raw.trim();
      if (line.startsWith("- ")) {
        if (!arr) arr = [];
        const rest = line.slice(2).trim();
        if (rest.includes(":")) {
          const item = {};
          const i = rest.indexOf(":");
          item[rest.slice(0, i).trim()] = unquote(rest.slice(i + 1).trim());
          pos++;
          const sub = block(cur + 2);
          Object.assign(item, sub.obj);
          arr.push(item);
        } else {
          arr.push(unquote(rest));
          pos++;
        }
        continue;
      }
      const idx = line.indexOf(":");
      if (idx === -1) { pos++; continue; }
      const key = line.slice(0, idx).trim();
      const val = unquote(line.slice(idx + 1).trim());
      if (val === "") {
        pos++;
        const sub = block(cur + 1);
        obj[key] = sub.arr !== null ? sub.arr : sub.obj;
      } else {
        obj[key] = val;
        pos++;
      }
    }
    return { obj, arr };
  }
  return block(0).obj;
})();
`;

writeFileSync(join(root, "..", "assets", "data.js"), js, "utf8");
console.log("✓ assets/data.js généré depuis data/content.yml");
