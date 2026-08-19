const fs = require('fs');

let buildSite = fs.readFileSync('tools/build-site.mjs', 'utf8');

// Font Optimization
buildSite = buildSite.replace(
  '<link rel="preload" as="image" href="${assetPath(page.image, "real-1.jpg")}">',
  `<link rel="preload" as="image" href="\${assetPath(page.image, "real-1.jpg")}">
  <link rel="preload" as="font" type="font/ttf" href="/assets/fonts/SukhumvitSet-Text.ttf" crossorigin>
  <link rel="preload" as="font" type="font/ttf" href="/assets/fonts/SukhumvitSet-SemiBold.ttf" crossorigin>`
);

// F3 CSS Minification
buildSite = buildSite.replace(
  'const cssHash = crypto.createHash(\'md5\').update(combinedCss).digest(\'hex\').substring(0, 8);',
  `const minifiedCss = combinedCss.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '').replace(/\\s+/g, ' ').replace(/\\s*([\\{\\}\\:\\;\\,])\\s*/g, '$1').trim();\nconst cssHash = crypto.createHash('md5').update(minifiedCss).digest('hex').substring(0, 8);`
);
buildSite = buildSite.replace(
  'writeFileSync(join(dist, "styles.css"), combinedCss);',
  'writeFileSync(join(dist, "styles.css"), minifiedCss);'
);

// F14 Cookie Banner HTML
buildSite = buildSite.replace(
  '${footer(locale)}',
  `\${footer(locale)}
  <div id="cookie-banner" class="cookie-banner">
    <div class="cookie-banner-content">
      <p>\${locale === 'th' ? 'เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน' : 'We use cookies to improve your experience.'}</p>
      <button id="accept-cookies" class="button primary small">\${locale === 'th' ? 'ยอมรับ' : 'Accept'}</button>
    </div>
  </div>`
);

// F12 Scroll Driven Timeline
buildSite = buildSite.replace(
  '<div class="event-item">',
  '<div class="event-item" data-animate="fade-up">'
);
// replace globally for event-item
buildSite = buildSite.replace(
  /<div class="event-item">/g,
  '<div class="event-item" data-animate="fade-up">'
);

// Fix Font copying path
buildSite = buildSite.replace(
  "if (existsSync(join(root, font))) {",
  "if (existsSync(join(root, 'src', 'assets', 'fonts', font))) {"
);
buildSite = buildSite.replace(
  "copyFileSync(join(root, font), join(dist, \"assets\", \"fonts\", font));",
  "copyFileSync(join(root, 'src', 'assets', 'fonts', font), join(dist, \"assets\", \"fonts\", font));"
);


// F5 Mega Menu
const megaMenuCode = `    if (key === "academics") {
      return \`<div class="nav-item-dropdown">
        <a href="\${localizedPath(href, locale)}"\${active}>\${escapeHtml(l.nav[index])}</a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>\${locale === 'th' ? 'หลักสูตรทั้งหมด' : 'All Programs'}</h4>
              <ul>
                <li><a href="\${localizedPath('/academics/', locale)}">\${locale === 'th' ? 'เตรียมอนุบาล' : 'Pre-Kindergarten'}</a></li>
                <li><a href="\${localizedPath('/academics/', locale)}">\${locale === 'th' ? 'อนุบาล' : 'Kindergarten'}</a></li>
                <li><a href="\${localizedPath('/academics/', locale)}">\${locale === 'th' ? 'ประถมศึกษา' : 'Primary'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>\`;
    } else if (key === "admissions") {
      return \`<div class="nav-item-dropdown">
        <a href="\${localizedPath(href, locale)}"\${active}>\${escapeHtml(l.nav[index])}</a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>\${locale === 'th' ? 'การรับสมัคร' : 'Admissions'}</h4>
              <ul>
                <li><a href="\${localizedPath('/admissions/', locale)}">\${locale === 'th' ? 'ขั้นตอนการสมัคร' : 'Process'}</a></li>
                <li><a href="\${localizedPath('/admissions/apply/', locale)}">\${locale === 'th' ? 'กรอกใบสมัคร' : 'Apply Now'}</a></li>
                <li><a href="\${localizedPath('/admissions/fees/', locale)}">\${locale === 'th' ? 'ค่าธรรมเนียม' : 'Fees'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>\`;
    }`;

buildSite = buildSite.replace(
  'const active = page.nav === key ? " aria-current=\\"page\\"" : "";',
  'const active = page.nav === key ? " aria-current=\\"page\\"" : "";\n' + megaMenuCode
);

fs.writeFileSync('tools/build-site.mjs', buildSite);
