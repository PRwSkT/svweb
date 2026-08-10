import { mkdirSync, copyFileSync, writeFileSync, existsSync, rmSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const siteUrl = (process.env.SITE_URL || "https://somkidvittaya.ac.th").replace(/\/$/, "");
const portalUrl = process.env.SV_PORTAL_URL || "https://portal.somkidvittaya.ac.th";

const locales = {
  th: {
    label: "ไทย",
    dir: "",
    home: "/",
    nav: ["เกี่ยวกับเรา", "หลักสูตร", "รับสมัคร", "ชีวิตในโรงเรียน", "ผู้ปกครอง", "ข่าวสาร", "ติดต่อ"],
    ctaTour: "นัดเยี่ยมชม",
    ctaApply: "สมัครเรียน",
    ctaGuide: "ดาวน์โหลดคู่มือ",
    portal: "เข้าสู่ SV Portal",
    readMore: "อ่านเพิ่มเติม",
    formName: "ชื่อ-นามสกุล",
    formPhone: "เบอร์โทร",
    formEmail: "อีเมล",
    formLevel: "ระดับชั้นที่สนใจ",
    formMessage: "ข้อความ",
    submit: "ส่งข้อมูล",
    footer: "โรงเรียนสองภาษา เตรียมอนุบาล-ประถมศึกษา จ.ระยอง",
    langTitle: "ภาษา",
    address: "80/5 ถ.หลังวัดป่าประดู่ ต.ท่าประดู่ อ.เมืองระยอง จ.ระยอง 21000"
  },
  en: {
    label: "English",
    dir: "/en",
    home: "/en/",
    nav: ["About", "Academics", "Admissions", "Student Life", "Parents", "News", "Contact"],
    ctaTour: "Book a Tour",
    ctaApply: "Apply Now",
    ctaGuide: "Download Guide",
    portal: "SV Portal",
    readMore: "Read more",
    formName: "Full name",
    formPhone: "Phone",
    formEmail: "Email",
    formLevel: "Interested level",
    formMessage: "Message",
    submit: "Submit",
    footer: "Bilingual school for Pre-Kindergarten to Primary in Rayong",
    langTitle: "Language",
    address: "80/5 Lhang Wat Pa Pradu Rd., Tha Pradu, Mueang Rayong, Rayong 21000"
  },
  zh: {
    label: "中文",
    dir: "/zh",
    home: "/zh/",
    nav: ["关于我们", "课程", "招生", "校园生活", "家长", "新闻", "联系"],
    ctaTour: "预约参观",
    ctaApply: "立即申请",
    ctaGuide: "下载手册",
    portal: "SV Portal",
    readMore: "阅读更多",
    formName: "姓名",
    formPhone: "电话",
    formEmail: "电子邮件",
    formLevel: "意向年级",
    formMessage: "留言",
    submit: "提交",
    footer: "位于罗勇府的双语学校，涵盖幼儿预备班至小学",
    langTitle: "语言",
    address: "罗勇府直辖县 Tha Pradu 区 Lhang Wat Pa Pradu 路 80/5 号，邮编 21000"
  }
};

const navItems = [
  ["about", "/about/"],
  ["academics", "/academics/"],
  ["admissions", "/admissions/"],
  ["student-life", "/student-life/"],
  ["parents", "/parents/"],
  ["news", "/news/"],
  ["contact", "/contact/"]
];

const siteSettings = yaml.load(readFileSync(join(root, 'content/settings/site.yml'), 'utf8'));
const globals = yaml.load(readFileSync(join(root, 'content/settings/globals.yml'), 'utf8'));

const pageMap = new Map();
for (const file of readdirSync(join(root, 'content/pages'))) {
  if (!file.endsWith('.yml')) continue;
  const data = yaml.load(readFileSync(join(root, 'content/pages', file), 'utf8'));
  
  if (!pageMap.has(data.id)) {
    pageMap.set(data.id, {
      id: data.id,
      path: data.path,
      image: data.image,
      nav: data.nav || null,
      type: data.type || null,
      title: {},
      eyebrow: {},
      summary: {},
      seo: {},
      sections: {}
    });
  }
  
  const p = pageMap.get(data.id);
  const l = data.lang;
  
  if (data.title) p.title[l] = data.title;
  if (data.eyebrow) p.eyebrow[l] = data.eyebrow;
  if (data.summary) p.summary[l] = data.summary;
  if (data.seo) p.seo[l] = data.seo;
  if (data.sections) p.sections[l] = data.sections;
  if (data.epilogue) p.epilogue = p.epilogue || {};
  if (data.epilogue) p.epilogue[l] = data.epilogue;
  if (data.intro) p.intro = p.intro || {};
  if (data.intro) p.intro[l] = data.intro;
  if (data.chart) {
    p.chart = p.chart || {};
    p.chart[l] = data.chart[l] || data.chart;
  }
  if (data.type && !p.type) p.type = data.type;
  
  // Get file modification time for sitemap
  const stat = statSync(join(root, 'content/pages', file));
  if (!p.lastmod || stat.mtime > p.lastmod) {
    p.lastmod = stat.mtime;
  }
}

const pages = Array.from(pageMap.values());

const seoFallback = {
  th: ["โรงเรียนสมคิดวิทยา | Somkidvittaya School", "โรงเรียนสมคิดวิทยา โรงเรียนสองภาษา จ.ระยอง สำหรับเตรียมอนุบาล อนุบาล และประถมศึกษา"],
  en: ["Somkidvittaya School", "Somkidvittaya School is a bilingual school in Rayong for Pre-Kindergarten, Kindergarten, and Primary."],
  zh: ["Somkidvittaya School", "Somkidvittaya School 是罗勇府双语学校，提供幼儿预备班、幼儿园和小学课程。"]
};

function t(page, key, locale) {
  return page[key]?.[locale] || page[key]?.th || "";
}

function localizedPath(path, locale) {
  if (locale === "th") return path;
  return `${locales[locale].dir}${path === "/" ? "/" : path}`;
}

function pageUrl(path, locale) {
  return `${siteUrl}${localizedPath(path, locale)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function button(label, href, variant = "primary") {
  return `<a class="button ${variant}" href="${href}">${escapeHtml(label)}</a>`;
}

function languageSelect(page, locale) {
  const flags = {
    th: `<svg viewBox="0 0 900 600" width="24" height="16" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 2px;"><rect fill="#A51931" width="900" height="600"/><rect fill="#F4F5F8" y="100" width="900" height="400"/><rect fill="#2D2A4A" y="200" width="900" height="200"/></svg>`,
    en: `<img src="/assets/images/flag-en.png" alt="English Flag" width="24" height="16" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 2px; object-fit: cover;">`,
    zh: `<img src="/assets/images/flag-zh.jpg" alt="China Flag" width="24" height="16" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 2px; object-fit: cover;">`
  };
  
  const options = Object.keys(locales).map((code) => {
    const active = code === locale ? ' active' : '';
    return `<a href="${localizedPath(page.path, code)}" class="lang-option${active}">${flags[code]}<span>${locales[code].label}</span></a>`;
  }).join("");
  
  return `
    <details class="language-switch">
      <summary aria-label="Language Selector">${flags[locale]}</summary>
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
}

function footer(locale) {
  const l = locales[locale];
  const schoolAddress = escapeHtml(l.address || siteSettings.address).replace(/\n/g, " ");
  const companyAddressLine = locale === "th" 
    ? "อาคาร The 1960 Bldg., " + schoolAddress
    : "The 1960 Bldg., " + schoolAddress;
  
  return `<footer class="site-footer">
    <div class="footer-top">
      <div class="footer-links">
        <a href="${localizedPath("/admissions/", locale)}">${l.ctaApply}</a>
        <a href="${localizedPath("/parents/", locale)}">${l.portal}</a>
        <a href="${localizedPath("/contact/", locale)}">${l.ctaTour}</a>
        <a href="${localizedPath("/privacy/", locale)}">${locale === "th" ? "ประกาศความเป็นส่วนตัว" : locale === "en" ? "Privacy Policy" : "隐私声明"}</a>
      </div>
    </div>
    <div class="footer-grid">
      <div class="footer-col">
        <img src="/assets/images/logo-white.png" alt="Somkidvittaya School" height="55" style="height: 55px; width: auto; margin-bottom: 15px;">
        <strong>${locale === "th" ? "โรงเรียนสมคิดวิทยา" : "Somkidvittaya School"}</strong>
        <p>${schoolAddress}<br>Tel: <a href="tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}">${escapeHtml(siteSettings.phone)}</a><br>Email: <a href="mailto:${siteSettings.email}">${escapeHtml(siteSettings.email)}</a></p>
        <div class="footer-social" style="margin-top: 20px;">
          <a href="${escapeHtml(siteSettings.facebook)}" target="_blank" aria-label="Facebook"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
          <a href="${escapeHtml(siteSettings.instagram)}" target="_blank" aria-label="Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
          ${siteSettings.youtube ? `<a href="${escapeHtml(siteSettings.youtube)}" target="_blank" aria-label="YouTube"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>` : ''}
        </div>
      </div>
      <div class="footer-col">
        <a href="https://siritham.com" target="_blank">
          <img src="/assets/images/siritham-logo.png" alt="Siritham Co., Ltd." height="55" style="height: 55px; width: auto; margin-bottom: 15px;">
        </a>
        <strong>${locale === "th" ? "บริษัท ศิริธรรม จำกัด" : "Siritham Co., Ltd."}</strong>
        <p>${companyAddressLine}<br>Email: <a href="mailto:mail@siritham.com">mail@siritham.com</a></p>
      </div>
    </div>
    
    <div class="footer-bottom" style="position: relative; z-index: 2; padding: 20px 20px 30px; width: min(100%, var(--max)); margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 20px;">
      <p class="copyright" style="font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 0;">COPYRIGHT © SIRITHAM CO., LTD. ALL RIGHTS RESERVED.</p>
    </div>
    
    <div class="footer-giant-graphic">
      <img src="/assets/images/sv-graphic.png" alt="" aria-hidden="true">
    </div>
  </footer>
  <div class="mobile-cta">${button(locale === "th" ? "โทร" : locale === "en" ? "Call" : "电话", `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`, "ghost")}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary")}${button(l.ctaTour, localizedPath("/contact/", locale), "secondary")}</div>`;
}

function hero(page, locale) {
  const l = locales[locale];
  const feature = locale === "th"
    ? ["Bilingual Program", "Active Learning", "PBL", "AI Integration"]
    : locale === "en"
      ? ["Bilingual Program", "Active Learning", "PBL", "AI Integration"]
      : ["Bilingual Program", "主动学习", "项目式学习", "AI 应用"];

  const isHome = page.id === "home";
  const slides = ["/assets/images/real-1.jpg","/assets/images/real-2.jpg","/assets/images/real-3.jpg","/assets/images/real-4.jpg","/assets/images/real-5.jpg","/assets/images/real-6.png"];
  const pageImage = page.image || 'real-1.jpg';
  
  const slidesHtml = isHome 
    ? slides.map((src, i) => {
        const cls = `hero-bg ${i === 0 ? 'active' : ''}`;
        return src.endsWith(".mp4")
          ? `<video src="${src}" class="${cls}" muted playsinline ${i === 0 ? 'autoplay' : ''}></video>`
          : `<img src="${src}" class="${cls}" alt="" aria-hidden="true" width="1920" height="1080">`;
      }).join("")
    : `<img src="/assets/images/${pageImage}" class="hero-bg active" alt="" aria-hidden="true" width="1920" height="1080">`;

  return `<section class="hero ${isHome ? "home" : ""}" ${isHome ? `data-slides='${JSON.stringify(slides)}'` : ""}>
    ${slidesHtml}
    <div class="hero-content">
      <div class="hero-copy" data-animate="reveal-stagger">
        <p class="eyebrow">${escapeHtml(t(page, "eyebrow", locale))}</p>
        <h1>${escapeHtml(t(page, "title", locale))}</h1>
        <p class="lead">${escapeHtml(t(page, "summary", locale))}</p>
        ${page.type !== 'success' ? `<div class="hero-actions">${button(l.ctaTour, localizedPath("/contact/", locale), "secondary")}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary")}${button(l.ctaGuide, localizedPath("/academics/", locale), "ghost inverse")}</div>` : ""}
        ${isHome ? `<div class="slider-controls">
          <span class="slider-indicator">01 / 06</span>
          <div class="slider-arrow prev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
          <div class="slider-pause"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></div>
          <div class="slider-arrow next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
        </div>` : ""}
      </div>
      ${page.type !== 'success' ? `<aside class="hero-index" aria-label="Program highlights" data-animate="fade-up">
        ${feature.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </aside>` : ""}
    </div>
  </section>`;
}

function stats(locale) {
  return `<section class="stats" aria-label="School highlights" data-animate="fade-up">${globals.stats.map(([n, th, en, zh]) => `<div><strong>${n}</strong><span>${escapeHtml(locale === "th" ? th : locale === "en" ? en : zh)}</span></div>`).join("")}</section>`;
}

function quickLinks(locale) {
  const heading = locale === "th" ? "เริ่มจากสิ่งที่คุณต้องการ" : locale === "en" ? "Start with What You Need" : "从您的需求开始";
  const icons = [
    `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`
  ];
  return `<div class="floating-quick-links" data-animate="fade-up">
    ${globals.quickLinks[locale].map(([title, body, href], i) => `<a class="quick-link-box" href="${localizedPath(href, locale)}">
      ${icons[i]}
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
    </a>`).join("")}
    <a class="quick-link-box" href="${localizedPath('/contact/', locale)}">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <strong>${locale === "th" ? "ติดต่อสอบถาม" : locale === "en" ? "Contact Us" : "联系我们"}</strong>
      <span>${locale === "th" ? "สอบถามข้อมูลเพิ่มเติม" : locale === "en" ? "Get in touch with us" : "获取更多信息"}</span>
    </a>
  </div>`;
}

function textSections(page, locale) {
  const sections = page.sections?.[locale] || page.sections?.th || page.sections || [];
  if (sections.length === 0) return "";
  const eyebrowText = page.eyebrow?.[locale] || page.eyebrow?.th || page.eyebrow || (locale === "th" ? "รายละเอียด" : locale === "en" ? "Details" : "详情");
  
  const chart = page.chart?.[locale] || page.chart?.th || page.chart;
  let chartHtml = "";
  
  if (chart && chart.data && chart.data.length > 0) {
    const total = chart.data.reduce((sum, item) => sum + item.value, 0);
    let currentOffset = 0;
    const radius = 15.9155;
    
    const paths = chart.data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const strokeDasharray = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = 100 - currentOffset + 25;
      currentOffset += percentage;
      return `<circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="${item.color}" stroke-width="8" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" class="chart-segment" style="animation-delay: ${index * 0.15}s" />`;
    }).join("");

    chartHtml = `
      <div class="chart-container" data-animate="fade-in">
        <div class="donut-wrapper">
          <svg viewBox="0 0 42 42" class="donut-chart">
            <circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="rgba(0,0,0,0.05)" stroke-width="8" />
            ${paths}
          </svg>
          <div class="donut-center">
            <strong><span class="counter" data-target="100">0</span>%</strong>
            <span>${locale === "th" ? "พัฒนาการ" : "Development"}</span>
          </div>
        </div>
        <div class="chart-legend">
          <h3>${escapeHtml(chart.title)}</h3>
          ${chart.data.map(item => `
            <div class="legend-item">
              <span class="legend-color" style="background: ${item.color};"></span>
              <span class="legend-label">${escapeHtml(item.label)}</span>
              <strong class="legend-value" style="color: ${item.color};">${item.value}%</strong>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  let contentHtml = "";
  
  if (chartHtml && sections.length > 0) {
    const featuredSection = sections[0];
    const restSections = sections.slice(1);
    
    contentHtml = `
      <div class="featured-program-card">
        <div class="text-item featured-text" style="animation: none; transform: none; opacity: 1;">
          <div class="text-item-header">
            ${featuredSection.icon ? `<i data-feather="${featuredSection.icon}"></i>` : ""}
            <h3 style="font-size: 1.8rem; margin: 0; color: var(--sv-deep);">${escapeHtml(featuredSection.title || featuredSection[0])}</h3>
          </div>
          <p style="font-size: 1.15rem; margin-top: 16px; color: var(--muted); line-height: 1.7;">${escapeHtml(featuredSection.body || featuredSection[1])}</p>
        </div>
        ${chartHtml}
      </div>
      
      ${restSections.length > 0 ? `
        <div class="text-list secondary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; margin-top: 60px;">
          ${restSections.map((sec, i) => `
            <div class="text-item" style="animation-delay: ${(i+1) * 0.1}s;">
              <div class="text-item-header">
                ${sec.icon ? `<i data-feather="${sec.icon}"></i>` : ""}
                <h3 style="font-size: 1.5rem; margin: 0; color: var(--sv-deep);">${escapeHtml(sec.title || sec[0])}</h3>
              </div>
              <p style="margin-top: 12px; color: var(--muted); line-height: 1.7;">${escapeHtml(sec.body || sec[1])}</p>
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;
  } else {
    contentHtml = `
      <div class="text-list secondary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
        ${sections.map((sec, i) => `
          <div class="text-item" style="animation-delay: ${i * 0.1}s;">
            <div class="text-item-header">
              ${sec.icon ? `<i data-feather="${sec.icon}"></i>` : ""}
              <h3 style="font-size: 1.5rem; margin: 0; color: var(--sv-deep);">${escapeHtml(sec.title || sec[0])}</h3>
            </div>
            <p style="margin-top: 12px; color: var(--muted); line-height: 1.7;">${escapeHtml(sec.body || sec[1])}</p>
          </div>
        `).join("")}
      </div>
    `;
  }

  return `<section class="section curriculum-section" data-animate="fade-up">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(eyebrowText)}</p>
      <h2>${escapeHtml(t(page, "title", locale))}</h2>
    </div>
    ${contentHtml}
  </section>`;
}

function programCards(locale) {
  return `<section class="section" data-animate="fade-up"><div class="section-heading"><p class="eyebrow">Academics</p><h2>${locale === "th" ? "เลือกดูหลักสูตรตามช่วงวัย" : locale === "en" ? "Explore by Program" : "按学段了解课程"}</h2></div><div class="card-grid programs-grid reveal-stagger" data-animate="reveal-stagger">${globals.programCards[locale].map(([title, body, href, image]) => `<a class="program-card" href="${localizedPath(href, locale)}">
  <div class="program-card-img"><img src="/images/${image || 'real-1.jpg'}" alt="${escapeHtml(title)}" loading="lazy"></div>
  <div class="program-card-content">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
    <span>${locale === "th" ? "ดูรายละเอียด →" : locale === "en" ? "Learn More →" : "了解更多 →"}</span>
  </div>
</a>`).join("")}</div></section>`;
}

function admissions(locale) {
  return `<section class="section"><div class="section-heading"><p class="eyebrow">Admissions</p><h2>${locale === "th" ? "สมัครง่ายใน 4 ขั้นตอน" : locale === "en" ? "Apply in Four Steps" : "四步完成申请"}</h2></div><div class="steps">${globals.admissionsSteps[locale].map((s, i) => `<div><strong>${i + 1}</strong><span>${escapeHtml(s)}</span></div>`).join("")}</div></section>${formSection(locale, "admissions-inquiry")}`;
}

function fees(locale) {
  const heads = globals.fees[locale].heads;
  const rows = globals.fees[locale].rows;
  return `<section class="section"><div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td>${r}</td><td>${locale === "th" ? "รออัปเดตจากฝ่ายทะเบียน" : "To be updated by admissions"}</td><td>${locale === "th" ? "โปรดติดต่อโรงเรียนเพื่อข้อมูลล่าสุด" : "Please contact the school for the latest information."}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function faq(locale) {
  return `<section class="section faq-list">${globals.faq[locale].map(([q, a], i) => `<article class="faq-item${i === 0 ? " is-open" : ""}" data-faq-item><button data-faq-trigger aria-expanded="${i === 0 ? "true" : "false"}">${escapeHtml(q)}<span>+</span></button><p data-faq-panel${i === 0 ? "" : " hidden"}>${escapeHtml(a)}</p></article>`).join("")}</section>`;
}

function news(locale) {
  const items = globals.news[locale];
  const listItems = items.slice(1);
  return `<section class="section" data-animate="fade-up">
    <div class="section-heading">
      <p class="eyebrow">News & Updates</p>
      <h2>${locale === "th" ? "ข่าวสารและกิจกรรม" : locale === "en" ? "Latest Announcements" : "最新动态"}</h2>
    </div>
    <div class="news-board">
      <a href="${localizedPath("/news/", locale)}" class="news-featured">
        <img src="/assets/images/${items[0][3] || 'real-4.jpg'}" alt="${escapeHtml(items[0][0])}" width="800" height="500" loading="lazy">
        <div class="news-featured-content">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--sv-gold); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(items[0][1])}</span>
          <h3>${escapeHtml(items[0][0])}</h3>
        </div>
      </a>
      <div class="news-list">
        ${listItems.map(([title, tag, body]) => `<a href="${localizedPath("/news/", locale)}" class="news-row">
          <div class="news-date">Jul 15</div>
          <div class="news-title">${escapeHtml(title)}</div>
        </a>`).join("")}
        <a href="${localizedPath("/news/", locale)}" class="news-row" style="margin-top: auto; border: none;">
          <div class="news-title" style="color: var(--sv-crimson);">${locales[locale].readMore} &rarr;</div>
        </a>
      </div>
    </div>
  </section>`;
}

function parents(locale) {
  return `<section class="section split">
    <div><p class="eyebrow">SV Portal</p><h2>${locale === "th" ? "ทุกข้อมูลสำคัญในที่เดียว" : locale === "en" ? "Everything Important in One Place" : "重要信息集中一处"}</h2><p>${locale === "th" ? "ใช้สำหรับประกาศ เอกสาร ปฏิทินกิจกรรม และทางเข้า SV Portal ระบบภายในของโรงเรียน" : locale === "en" ? "Notices, downloads, activity calendar, and a direct link to the school SV Portal." : "用于公告、下载、活动日历以及进入学校 SV Portal。"}</p>${button(locales[locale].portal, portalUrl, "primary")}</div>
    <div class="mini-calendar"><strong>July 2026</strong><span>Parent Orientation</span><span>English Activity Day</span><span>Portfolio Review</span></div>
  </section>`;
}

function life(locale) {
  return `<section class="section"><div class="card-grid">${globals.lifeCards[locale].map(([title, body]) => `<article class="info-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join("")}</div></section>`;
}

function formSection(locale, name = "contact") {
  const l = locales[locale];
  return `<section class="section form-section"><div><p class="eyebrow">${locale === "th" ? "ส่งข้อความ" : locale === "en" ? "Send Inquiry" : "发送咨询"}</p><h2>${locale === "th" ? "ให้ทีมโรงเรียนติดต่อกลับ" : locale === "en" ? "Let the School Team Follow Up" : "让学校团队联系您"}</h2></div><form name="${name}" method="POST" data-netlify="true" action="${localizedPath('/success/', locale)}" netlify>
    <input type="hidden" name="form-name" value="${name}">
    <div><label for="${name}-name">${l.formName}</label><input id="${name}-name" name="name" required autocomplete="name"></div>
    <div><label for="${name}-phone">${l.formPhone}</label><input id="${name}-phone" name="phone" required autocomplete="tel"></div>
    <div><label for="${name}-email">${l.formEmail}</label><input id="${name}-email" name="email" type="email" autocomplete="email"></div>
    <div><label for="${name}-level">${l.formLevel}</label><select id="${name}-level" name="level"><option>Pre-Kindergarten</option><option>Kindergarten</option><option>Primary</option></select></div>
    <div class="full"><label for="${name}-message">${l.formMessage}</label><textarea id="${name}-message" name="message" rows="4"></textarea></div>
    <button class="button primary" type="submit">${l.submit}</button>
  </form></section>`;
}

function contact(locale) {
  const l = locales[locale];
  return `<section class="section contact-grid">
    <div class="contact-card"><h2>${locale === "th" ? "ข้อมูลติดต่อ" : locale === "en" ? "Contact Information" : "联系方式"}</h2><p>Somkidvittaya School<br>${escapeHtml(l.address || siteSettings.address).replace(/\n/g, "<br>")}<br>Tel: ${escapeHtml(siteSettings.phone)}<br>Email: ${escapeHtml(siteSettings.email)}</p><div class="hero-actions">${button(locales[locale].ctaTour, "#contact-form", "primary")}${button(locale === "th" ? "โทรหาเรา" : locale === "en" ? "Call Us" : "致电", `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`, "secondary")}</div></div>
    <div class="map-wrapper" style="width: 100%; height: 100%; min-height: 400px; background: #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow);">
      <iframe title="Map to Somkidvittaya School Rayong" loading="lazy" style="width:100%; height:100%; border:0;" src="https://maps.google.com/maps?q=Somkidvittaya%20School%20Rayong&t=&z=16&ie=UTF8&iwloc=&output=embed" allowfullscreen="" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </section><div id="contact-form">${formSection(locale, "contact")}</div>`;
}

function homeSections(page, locale) {
  return `${stats(locale)}${quickLinks(locale)}${programCards(locale)}${textSections(page, locale)}${news(locale)}${formSection(locale, "quick-inquiry")}`;
}

function aboutSections(page, locale) {
  const sections = page.sections?.[locale] || page.sections?.th || page.sections || [];
  const epilogue = page.epilogue?.[locale] || page.epilogue?.th || page.epilogue || null;
  
  return `<section class="section about-history">
    ${page.intro ? `
    <div class="section-heading">
      <p class="lead">${escapeHtml(t(page, "intro", locale))}</p>
    </div>` : ""}
    <div class="history-timeline">
      ${sections.map(sec => `
        <div class="history-chapter">
          <div class="chapter-header">
            ${sec.subtitle ? `<p class="chapter-subtitle">${escapeHtml(sec.subtitle)}</p>` : ""}
            <h3>${escapeHtml(sec.title || "")}</h3>
            ${sec.body ? `<p class="chapter-body">${escapeHtml(sec.body)}</p>` : ""}
          </div>
          <div class="chapter-events">
            ${(sec.events || []).map(ev => `
              <div class="event-item">
                <div class="event-year">${escapeHtml(ev.year || "")}</div>
                <div class="event-content">
                  ${ev.title ? `<h4>${escapeHtml(ev.title)}</h4>` : ""}
                  <p>${ev.text ? ev.text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") : ""}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
    ${epilogue ? `
    <div class="epilogue-section">
      <h3>${escapeHtml(epilogue.title || "")}</h3>
      <div class="epilogue-body">${(epilogue.body || "").replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>
    </div>
    ` : ""}
  </section>`;
}

function bodyContent(page, locale) {
  if (page.type === "success") return "";
  if (page.type === "home") return homeSections(page, locale);
  if (page.type === "about") return aboutSections(page, locale);
  if (page.type === "programs") return `${programCards(locale)}${textSections({ ...page, sections: { [locale]: [[locale === "th" ? "ภาพรวมหลักสูตร" : "Overview", t(page, "summary", locale)]] } }, locale)}`;
  if (page.type === "admissions") return admissions(locale);
  if (page.type === "steps") return admissions(locale);
  if (page.type === "fees") return fees(locale);
  if (page.type === "form") return formSection(locale, "admissions-apply");
  if (page.type === "faq") return faq(locale);
  if (page.type === "life") return life(locale);
  if (page.type === "parents") return parents(locale);
  if (page.type === "news") return news(locale);
  if (page.type === "contact") return contact(locale);
  return textSections(page, locale);
}

function structuredData(page, locale) {
  const l = locales[locale];
  const org = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "Somkidvittaya School",
    alternateName: "โรงเรียนสมคิดวิทยา",
    url: pageUrl("/", locale),
    logo: `${siteUrl}/assets/images/logo.png`,
    image: `${siteUrl}/assets/images/real-1.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rayong",
      addressCountry: "TH",
      streetAddress: l.address || siteSettings.address
    },
    telephone: siteSettings.phone,
    email: siteSettings.email,
    sameAs: [siteSettings.facebook, siteSettings.instagram, siteSettings.youtube].filter(Boolean)
  };
  
  const scripts = [`<script type="application/ld+json">${JSON.stringify(org)}</script>`];
  
  if (page.id !== "home") {
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t(pages[0], "title", locale),
          item: pageUrl("/", locale)
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t(page, "title", locale),
          item: pageUrl(page.path, locale)
        }
      ]
    };
    scripts.push(`<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`);
  }
  
  return scripts.join("\n  ");
}

function html(page, locale) {
  const fallbackTitle = `${t(page, "title", locale)} | Somkidvittaya School`;
  const fallbackDescription = `${t(page, "summary", locale)} ${seoFallback[locale][1]}`;
  const [title, description] = page.seo?.[locale] || [fallbackTitle, fallbackDescription.slice(0, 230)];
  
  const alternates = Object.keys(locales).map((code) => `<link rel="alternate" hreflang="${code}" href="${pageUrl(page.path, code)}">`).join("\n  ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${pageUrl(page.path, "th")}">`;
  
  return `<!doctype html>
<html lang="${locale}"${locale === "zh" ? " class=\"lang-zh\"" : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${pageUrl(page.path, locale)}">
  ${alternates}
  ${xDefault}
  ${Object.keys(locales).filter(l => l !== locale).map(l => `<meta property="og:locale:alternate" content="${l === "th" ? "th_TH" : l === "en" ? "en_US" : "zh_CN"}">`).join("\n  ")}
  
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl(page.path, locale)}">
  <meta property="og:image" content="${siteUrl}/assets/images/${page.image || "real-1.jpg"}">
  <meta property="og:locale" content="${locale === "th" ? "th_TH" : locale === "en" ? "en_US" : "zh_CN"}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${siteUrl}/assets/images/${page.image || "real-1.jpg"}">
  
  <link rel="preload" as="image" href="/assets/images/${page.image || "real-1.jpg"}">
  <link rel="icon" href="/favicon.ico?v=2">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="stylesheet" href="/styles.css">
  ${structuredData(page, locale)}
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body class="${page.path === '/' ? 'is-home' : ''}">
  ${header(page, locale)}
  <main id="main">
    ${hero(page, locale)}
    ${bodyContent(page, locale)}
    ${page.type !== 'success' ? `<section class="closing-cta">
      <p class="eyebrow">Somkidvittaya School</p>
      <h2>${locale === "th" ? "พร้อมเริ่มต้นเส้นทางใหม่กับ SV?" : locale === "en" ? "Ready to Begin with SV?" : "准备加入 SV 吗？"}</h2>
      <div class="hero-actions">${button(locales[locale].ctaTour, localizedPath("/contact/", locale), "secondary")}${button(locales[locale].ctaApply, localizedPath("/admissions/apply/", locale), "primary")}</div>
    </section>` : ""}
  </main>
  ${footer(locale)}
  <script src="/main.js" defer></script>
  <script src="https://unpkg.com/feather-icons"></script>
  <script>window.addEventListener('DOMContentLoaded', () => feather.replace());</script>
</body>
</html>`;
}

function outputPath(path, locale) {
  const clean = localizedPath(path, locale).replace(/^\/|\/$/g, "");
  return clean ? join(dist, clean, "index.html") : join(dist, "index.html");
}

function writePage(page, locale) {
  const file = outputPath(page.path, locale);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html(page, locale));
}

function copyAsset(src, destName) {
  const dest = join(dist, destName);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(root, src), dest);
}

function buildSitemap() {
  const urls = pages.flatMap((page) => Object.keys(locales).map((locale) => {
    const lastmod = page.lastmod ? page.lastmod.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `<url><loc>${pageUrl(page.path, locale)}</loc><lastmod>${lastmod}</lastmod></url>`;
  })).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
mkdirSync(join(dist, "assets", "images"), { recursive: true });

for (const page of pages) {
  for (const locale of Object.keys(locales)) writePage(page, locale);
}

  
  // Concatenate CSS partials
  const cssOrder = ['variables.css', 'reset.css', 'typography.css', 'layout.css', 'components.css', 'animations.css'];
  let combinedCss = '';
  for (const file of cssOrder) {
    const filePath = join(root, "src", "css", file);
    if (existsSync(filePath)) {
      combinedCss += readFileSync(filePath, "utf8") + "\n";
    }
  }
  writeFileSync(join(dist, "styles.css"), combinedCss);
copyAsset("src/main.js", "main.js");
copyAsset("src/assets/favicon.ico", "favicon.ico");
copyAsset("src/assets/apple-touch-icon.png", "apple-touch-icon.png");
for (const image of readdirSync(join(root, "src/assets/images"))) {
  if (image.startsWith('.')) continue;
  copyAsset(`src/assets/images/${image}`, `assets/images/${image}`);
}

copyAsset("src/admin/index.html", "admin/index.html");
copyAsset("src/admin/config.yml", "admin/config.yml");

writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(dist, "sitemap.xml"), buildSitemap());
writeFileSync(join(dist, "_redirects"), `/th/* /:splat 301\n`);

console.log(`Built ${pages.length * Object.keys(locales).length} pages to dist`);
