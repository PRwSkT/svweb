function languageSelect(page, locale) {
  const globeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  const chevronIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  const langNames = { th: "ภาษาไทย (TH)", en: "English (EN)", zh: "中文 (ZH)" };
  const shortNames = { th: "TH", en: "EN", zh: "ZH" };
  const options = Object.keys(locales).map((code) => {
    const active = code === locale ? ' active' : '';
    return `<a href="${localizedPath(page.path, code)}" class="lang-option${active}"><span>${langNames[code]}</span></a>`;
  }).join("");
  
  return `
    <details class="language-switch">
      <summary aria-label="Language Selector">${globeIcon} <span style="font-size: 0.9em; font-weight: 600;">${shortNames[locale]}</span> ${chevronIcon}</summary>
      <div class="lang-dropdown">
        ${options}
      </div>
    </details>
  `;
}

function header(page, locale) {
  const l = locales[locale];
  const navLinks = navItems.map(([key, href], index) => {
    const active = page.nav === key ? " aria-current=\"page\"" : "";
    return `<a href="${localizedPath(href, locale)}"${active}>${escapeHtml(l.nav[index])}</a>`;
  }).join("");

  return `<header class="site-header">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="utility-bar">
      <span>Somkidvittaya School</span>
      <span>66 Years of Learning</span>
      <a href="${portalUrl}">${l.portal}</a>
    </div>
    <div class="topbar">
      <a class="brand" href="${l.home}" aria-label="Somkidvittaya School home">
        <img src="/assets/images/logo.png" alt="Somkidvittaya School Logo" class="brand-logo" width="60" height="60">
      </a>
      <nav id="site-nav" class="site-nav" data-site-nav>${navLinks}</nav>
      <div class="header-actions">${languageSelect(page, locale)}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary small")}</div>
      <button class="menu-button" data-menu-button aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
    </div>
  </header>`;
