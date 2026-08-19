const fs = require('fs');
const path = '/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/task.md';
let task = fs.readFileSync(path, 'utf8');

task = task.replace('- `[ ]` **F2: Font Optimization**', '- `[x]` **F2: Font Optimization**');
task = task.replace('- `[ ]` **F3: CSS Minification**', '- `[x]` **F3: CSS Minification**');
task = task.replace('- `[ ]` **F4: Image Pipeline**', '- `[x]` **F4: Image Pipeline** (Skipped)');
task = task.replace('- `[ ]` **F11: View Transitions API**', '- `[x]` **F11: View Transitions API**');
task = task.replace('- `[ ]` **F13: Language Popover Animation**', '- `[x]` **F13: Language Popover Animation** (Skipped/Already implemented in CSS)');
task = task.replace('- `[ ]` **F14: Cookie Consent Banner**', '- `[x]` **F14: Cookie Consent Banner**');
task = task.replace('- `[ ]` **F12: Scroll-Driven Timeline**', '- `[x]` **F12: Scroll-Driven Timeline**');
task = task.replace('- `[ ]` **F5: Dropdown Navigation (Mega Menu)**', '- `[x]` **F5: Dropdown Navigation (Mega Menu)**');
task = task.replace('- `[ ]` Build and test locally (`npm run build`).', '- `[x]` Build and test locally (`npm run build`).');
task = task.replace('- `[ ]` Manual verification of all applied changes.', '- `[x]` Manual verification of all applied changes.');

fs.writeFileSync(path, task);
