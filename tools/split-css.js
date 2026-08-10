const fs = require('fs');

const css = fs.readFileSync('src/styles.css', 'utf8');

// Rough split
const rootRegex = /:root\s*\{[\s\S]*?\}/;
const rootMatch = css.match(rootRegex);
const variables = rootMatch ? rootMatch[0] : '';

let rest = css.replace(rootRegex, '');

fs.mkdirSync('src/css', { recursive: true });
fs.writeFileSync('src/css/variables.css', variables + '\n');
fs.writeFileSync('src/css/reset.css', '/* Global resets and base tags */\n');
fs.writeFileSync('src/css/typography.css', '/* Typography and headings */\n');
fs.writeFileSync('src/css/layout.css', '/* Layout components like Header and Footer */\n');
fs.writeFileSync('src/css/animations.css', '/* Keyframes and animation utilities */\n');
fs.writeFileSync('src/css/components.css', rest);

console.log("CSS architecture created.");
