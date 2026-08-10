import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const pageMap = new Map();

for (const file of readdirSync('content/pages')) {
  if (!file.endsWith('.yml')) continue;
  const data = yaml.load(readFileSync(join('content/pages', file), 'utf8'));
  const l = data.lang;
  
  if (!pageMap.has(data.id)) {
    pageMap.set(data.id, {
      id: data.id,
      path: data.path,
      type: data.type || null,
      sections: {}
    });
  }
  const p = pageMap.get(data.id);
  if (data.type && !p.type) p.type = data.type;
}

console.log("About page type:", pageMap.get('about').type);
