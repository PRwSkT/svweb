import { execSync } from 'child_process';
const fs = require('fs');

const code = fs.readFileSync('tools/build-site.mjs', 'utf8');
const newCode = code.replace(/const \[title, description\] = page\.seo\?\.\[locale\] \|\| \[fallbackTitle, fallbackDescription\.slice\(0, 230\)\];/, `
  let title, description;
  try {
    const seoVal = page.seo?.[locale];
    if (seoVal && typeof seoVal[Symbol.iterator] === 'function') {
      [title, description] = seoVal;
    } else {
      [title, description] = [fallbackTitle, fallbackDescription.slice(0, 230)];
    }
  } catch(e) {
    console.error('ERROR ON PAGE', page.id, locale, page.seo?.[locale]);
    throw e;
  }
`);
fs.writeFileSync('tools/build-site-debug.mjs', newCode);
