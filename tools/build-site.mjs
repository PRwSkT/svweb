import { mkdirSync, copyFileSync, writeFileSync, existsSync, rmSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createClient } from '@supabase/supabase-js';
import crypto from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const siteUrl = (process.env.SITE_URL || "https://somkidvittaya.ac.th").replace(/\/$/, "");
const defaultPortalUrl = process.env.SV_PORTAL_URL || "https://sv-portal.somkidvittaya.ac.th";

const supabaseUrl = process.env.SUPABASE_URL || 'https://ufsqavndpjphowuacxfi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc3Fhdm5kcGpwaG93dWFjeGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTM4NzgsImV4cCI6MjA5NjY4OTg3OH0.fpaVZY8i7YQLRewcv3cuEZR_P9wNz1rWs5Q1UOk3Hz0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch dynamic data for build
let dynamicData = { personnel: [], news: [], albums: [], calendar: [], documents: [] };
try {
  console.log("Fetching dynamic data from Supabase...");
  const results = await Promise.allSettled([
    supabase.from('personnel').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(20),
    supabase.from('albums').select('*, album_photos(*)').order('event_date', { ascending: false }).limit(20),
    supabase.from('calendar_events').select('*').order('start_date', { ascending: true }),
    supabase.from('documents').select('*').order('created_at', { ascending: false })
  ]);
  
  if (results[0].status === 'fulfilled' && results[0].value.data) dynamicData.personnel = results[0].value.data;
  if (results[1].status === 'fulfilled' && results[1].value.data) dynamicData.news = results[1].value.data;
  if (results[2].status === 'fulfilled' && results[2].value.data) dynamicData.albums = results[2].value.data;
  if (results[3].status === 'fulfilled' && results[3].value.data) dynamicData.calendar = results[3].value.data;
  if (results[4].status === 'fulfilled' && results[4].value.data) dynamicData.documents = results[4].value.data;
  console.log(`Fetched ${dynamicData.personnel.length} personnel, ${dynamicData.news.length} news, ${dynamicData.albums.length} albums, ${dynamicData.calendar.length} events, ${dynamicData.documents.length} docs.`);
} catch (e) {
  console.error("Failed to fetch Supabase data:", e.message);
}


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
    formPhone: "หมายเลขโทรศัพท์",
    formEmail: "อีเมล",
    formLevel: "ระดับชั้นที่สนใจ",
    formMessage: "ข้อความ",
    submit: "ส่งข้อมูล",
    footer: "โรงเรียนสองภาษา เตรียมอนุบาล-ประถมศึกษา จ.ระยอง",
    langTitle: "ภาษา",
    address: "80/5 ถ.หลังวัดป่า ต.ท่าประดู่ อ.เมืองระยอง จ.ระยอง 21000 ประเทศไทย"
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
    formLevel: "Grade Level of Interest",
    formMessage: "Message",
    submit: "Submit",
    footer: "Bilingual school for Pre-Kindergarten to Primary in Rayong",
    langTitle: "Language",
    address: "80/5 Lang Wat Pa Rd, Tha Pradu, Mueang Rayong, Rayong 21000, Thailand"
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
    address: "泰国罗勇市 Tha Pradu 区 Lang Wat Pa 路 80/5 号，邮政编码：21000"
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
const portalUrl = siteSettings.portal_url || defaultPortalUrl;

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
  const l = data.lang || 'th';
  
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
  th: ["โรงเรียนสมคิดวิทยา | Somkidvittaya School", "โรงเรียนสมคิดวิทยา โรงเรียนสองภาษา จ.ระยอง สำหรับเตรียมอนุบาล ปฐมวัย และประถมศึกษา"],
  en: ["Somkidvittaya School", "Somkidvittaya School is a bilingual school in Rayong for Pre-Kindergarten, Kindergarten, and Primary."],
  zh: ["Somkidvittaya学校", "Somkidvittaya学校是罗勇府双语学校，提供幼儿预备班、幼儿园和小学课程。"]
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

function assetPath(value, fallback = "real-1.jpg") {
  const image = String(value || fallback);
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) return validateUrl(image);
  return validateUrl(`/assets/images/${image}`);
}

function absoluteAssetUrl(value, fallback = "real-1.jpg") {
  const image = assetPath(value, fallback);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${siteUrl}${image}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("`", "&#x60;");
}

function validateUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return "#";
  }
  return escapeHtml(trimmed);
}

function button(label, href, variant = "primary") {
  const arrow = variant.includes("primary") || variant.includes("secondary") ? '<span class="arrow" aria-hidden="true">→</span>' : '';
  return `<a class="button ${variant}" href="${href}">${escapeHtml(label)}${arrow}</a>`;
}

function languageSelect(page, locale) {
  const globeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  
  const langNames = { th: "ภาษาไทย (TH)", en: "English (EN)", zh: "中文 (ZH)" };
  const options = Object.keys(locales).map((code) => {
    const active = code === locale ? ' active' : '';
    return `<a href="${localizedPath(page.path, code)}" class="lang-option${active}"><span>${langNames[code]}</span></a>`;
  }).join("");
  
  return `
    <div class="lang-wrapper" style="position: relative; display: inline-flex;">
      <button class="language-switch" type="button" aria-haspopup="true" aria-label="${escapeHtml(locales[locale].langTitle)}">
        ${globeIcon} <span>${locale.toUpperCase()}</span>
      </button>
      <div id="lang-menu" style="position: absolute; top: 100%; right: 0; margin-top: 8px; z-index: 100;">
        <div class="lang-dropdown">
          ${options}
        </div>
      </div>
    </div>
  `;
}

function header(page, locale) {
  const l = locales[locale];
  const navLinks = navItems.map(([key, href], index) => {
    const active = page.nav === key ? " aria-current=\"page\"" : "";
    
    
    if (key === "student-life") {
      return `<div class="nav-item-dropdown">
        <a href="${localizedPath(href, locale)}"${active} class="has-dropdown"><span>${escapeHtml(l.nav[index])}</span> <i data-feather="chevron-down" class="dropdown-icon"></i></a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>${locale === 'th' ? 'ชีวิตในโรงเรียน' : locale === 'zh' ? '校园生活' : 'Student Life'}</h4>
              <ul>
                <li><a href="${localizedPath('/student-life/', locale)}">${locale === 'th' ? 'กิจกรรมและสิ่งแวดล้อม' : locale === 'zh' ? '活动与环境' : 'Activities & Environment'}</a></li>
                <li><a href="${localizedPath('/student-life/gallery/', locale)}">${locale === 'th' ? 'แกลเลอรีภาพกิจกรรม' : locale === 'zh' ? '活动图库' : 'Photo Gallery'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    }

    if (key === "parents") {
      return `<div class="nav-item-dropdown">
        <a href="${localizedPath(href, locale)}"${active} class="has-dropdown"><span>${escapeHtml(l.nav[index])}</span> <i data-feather="chevron-down" class="dropdown-icon"></i></a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>${locale === 'th' ? 'สำหรับผู้ปกครอง' : locale === 'zh' ? '家长专区' : 'For Parents'}</h4>
              <ul>
                <li><a href="${localizedPath('/parents/', locale)}">${locale === 'th' ? 'คำแนะนำสำหรับผู้ปกครอง' : locale === 'zh' ? '家长指南' : 'Parent Guide'}</a></li>
                <li><a href="${localizedPath('/parents/documents/', locale)}">${locale === 'th' ? 'ศูนย์ดาวน์โหลดเอกสาร' : locale === 'zh' ? '文档下载中心' : 'Document Hub'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    }
    if (key === "about") {
      return `<div class="nav-item-dropdown">
        <a href="${localizedPath(href, locale)}"${active} class="has-dropdown"><span>${escapeHtml(l.nav[index])}</span> <i data-feather="chevron-down" class="dropdown-icon"></i></a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>${locale === 'th' ? 'เกี่ยวกับโรงเรียน' : locale === 'zh' ? '关于学校' : 'About the School'}</h4>
              <ul>
                <li><a href="${localizedPath('/about/', locale)}">${locale === 'th' ? 'ประวัติโรงเรียน' : locale === 'zh' ? '学校历史' : 'Our History'}</a></li>
                <li><a href="${localizedPath('/director/', locale)}">${locale === 'th' ? 'สารจากผู้บริหาร' : locale === 'zh' ? '校长致辞' : 'Message from the Director'}</a></li>
                <li><a href="${localizedPath('/about/faculty/', locale)}">${locale === 'th' ? 'ทำเนียบบุคลากร' : locale === 'zh' ? '教职员工' : 'Faculty Directory'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    }
    if (key === "academics") {
      return `<div class="nav-item-dropdown">
        <a href="${localizedPath(href, locale)}"${active} class="has-dropdown"><span>${escapeHtml(l.nav[index])}</span> <i data-feather="chevron-down" class="dropdown-icon"></i></a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>${locale === 'th' ? 'หลักสูตรทั้งหมด' : locale === 'zh' ? '所有课程' : 'All Programs'}</h4>
              <ul>
                <li><a href="${localizedPath('/academics/', locale)}">${locale === 'th' ? 'ข้อมูลหลักสูตรทั้งหมด' : locale === 'zh' ? '所有课程信息' : 'All Programs'}</a></li>
                <li><a href="${localizedPath('/academics/', locale)}#pre-k">${locale === 'th' ? 'เตรียมอนุบาล' : locale === 'zh' ? '学前班' : 'Pre-Kindergarten'}</a></li>
                <li><a href="${localizedPath('/academics/', locale)}#kindergarten">${locale === 'th' ? 'อนุบาล' : locale === 'zh' ? '幼儿园' : 'Kindergarten'}</a></li>
                <li><a href="${localizedPath('/academics/', locale)}#primary">${locale === 'th' ? 'ประถมศึกษา' : locale === 'zh' ? '小学' : 'Primary'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    } else if (key === "admissions") {
      return `<div class="nav-item-dropdown">
        <a href="${localizedPath(href, locale)}"${active} class="has-dropdown"><span>${escapeHtml(l.nav[index])}</span> <i data-feather="chevron-down" class="dropdown-icon"></i></a>
        <div class="mega-menu">
          <div class="mega-menu-content">
            <div class="mega-column">
              <h4>${locale === 'th' ? 'การรับสมัคร' : locale === 'zh' ? '招生' : 'Admissions'}</h4>
              <ul>
                <li><a href="${localizedPath('/admissions/', locale)}">${locale === 'th' ? 'ข้อมูลการรับสมัคร' : locale === 'zh' ? '招生信息' : 'Admissions Info'}</a></li>
                <li><a href="${localizedPath('/admissions/apply/', locale)}">${locale === 'th' ? 'กรอกใบสมัคร' : locale === 'zh' ? '立即申请' : 'Apply Now'}</a></li>
                <li><a href="${localizedPath('/admissions/fees/', locale)}">${locale === 'th' ? 'ค่าธรรมเนียม' : locale === 'zh' ? '学费' : 'Fees'}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    }
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
      <div class="header-actions" style="position: relative;">${languageSelect(page, locale)}${button(l.ctaTour, localizedPath("/contact/", locale), "primary small")}</div>
      <button class="menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="site-nav" aria-label="${locale === "th" ? "เปิดเมนูหลัก" : locale === "en" ? "Open main menu" : "打开主菜单"}"><span></span><span></span><span></span></button>
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
        <img src="/assets/images/logo-white.png" loading="lazy" alt="Somkidvittaya School" width="55" height="55" style="height: 55px; width: auto; margin-bottom: 15px;">
        <strong>${locale === "th" ? "โรงเรียนสมคิดวิทยา" : locale === "zh" ? "Somkidvittaya学校" : "Somkidvittaya School"}</strong>
        <p>${escapeHtml(schoolAddress)}<br>Tel: <a href="tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}">${escapeHtml(siteSettings.phone)}</a><br>Email: <a href="mailto:${siteSettings.email}">${escapeHtml(siteSettings.email)}</a></p>
        <div class="footer-social" style="margin-top: 20px;">
          <a href="${escapeHtml(siteSettings.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
          <a href="${escapeHtml(siteSettings.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
          ${siteSettings.youtube ? `<a href="${escapeHtml(siteSettings.youtube)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>` : ''}
          ${siteSettings.tiktok ? `<a href="${escapeHtml(siteSettings.tiktok)}" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg></a>` : ''}
          ${siteSettings.line ? `<a href="https://line.me/R/ti/p/${siteSettings.line.startsWith('@') ? siteSettings.line : '@' + siteSettings.line}" target="_blank" rel="noopener noreferrer" aria-label="LINE"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.365 9.863c0-3.968-3.961-7.228-8.851-7.228-4.89 0-8.852 3.26-8.852 7.228 0 3.567 3.123 6.608 7.391 7.152.288.062.68.179.778.435.09.231.029.588-.037.818-.112.387-.528 2.062-.647 2.585-.152.658.337.859.852.545.986-.6 5.311-3.269 7.288-5.385C18.665 14.195 19.365 12.186 19.365 9.863zM9.467 11.233H7.815V8.125c0-.236-.182-.418-.418-.418s-.418.182-.418.418v3.526c0 .236.182.418.418.418h2.07c.236 0 .418-.182.418-.418s-.182-.418-.418-.418zm1.942.418H10.57v-3.526c0-.236.182-.418.418-.418s.418.182.418.418v3.526zM15.42 8.125c0-.236-.182-.418-.418-.418h-1.637c-.236 0-.418.182-.418.418v3.526c0 .236.182.418.418.418h1.637c.236 0 .418-.182.418-.418s-.182-.418-.418-.418h-1.219v-1.139h1.219c.236 0 .418-.182.418-.418s-.182-.418-.418-.418h-1.219V8.543h1.219c.236 0 .418-.182.418-.418zm4.61-3.957H20.03v3.526c0 .236-.182.418-.418.418h-2.07c-.236 0-.418-.182-.418-.418s.182-.418.418-.418h1.652V8.125c0-.236.182-.418.418-.418s.418.182.418.418z"/></svg></a>` : ''}
        </div>
      </div>
      <div class="footer-col">
        <a href="https://siritham.com" target="_blank" rel="noopener noreferrer">
          <img src="/assets/images/siritham-logo.png" loading="lazy" alt="Siritham Co., Ltd." width="120" height="55" style="height: 55px; width: auto; margin-bottom: 15px;">
        </a>
        <strong>${locale === "th" ? "บริษัท ศิริธรรม จำกัด" : locale === "zh" ? "Siritham 有限公司" : "Siritham Co., Ltd."}</strong>
        <p>${companyAddressLine}<br>Email: <a href="mailto:mail@siritham.com">mail@siritham.com</a></p>
      </div>
    </div>
    
    <div class="footer-bottom" style="position: relative; z-index: 2; padding: 20px 20px 30px; width: min(100%, var(--max)); margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 20px;">
      <p class="copyright" style="font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 0;">COPYRIGHT © SIRITHAM CO., LTD. ALL RIGHTS RESERVED.</p>
    </div>
    
    <div class="footer-giant-graphic">
      <img src="/assets/images/sv-graphic.png" loading="lazy" alt="" aria-hidden="true" width="500" height="500">
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
      : ["双语课程", "主动学习", "项目式学习", "AI 应用"];

  const isHome = page.id === "home";
  const slides = ["/assets/images/real-1.jpg","/assets/images/real-2.jpg","/assets/images/real-3.jpg","/assets/images/real-4.jpg","/assets/images/real-5.jpg","/assets/images/real-6.jpg"];
  const pageImage = assetPath(page.image, "real-1.jpg");
  
  const slidesHtml = isHome 
    ? slides.map((src, i) => {
        const cls = `hero-bg ${i === 0 ? 'active' : ''}`;
        const loading = i === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
        return src.endsWith(".mp4")
          ? `<video src="${src}" class="${cls}" muted playsinline ${i === 0 ? 'autoplay' : ''}></video>`
          : `<img src="${src}" class="${cls}" alt="" aria-hidden="true" width="1920" height="1080" ${loading}>`;
      }).join("")
    : `<img src="${pageImage}" class="hero-bg active" alt="" aria-hidden="true" width="1920" height="1080" fetchpriority="high">`;

  return `<section class="hero ${isHome ? "home" : ""}" ${isHome ? `data-slides='${JSON.stringify(slides)}'` : ""}>
    ${slidesHtml}
    <div class="hero-content">
      <div class="hero-copy" data-animate="reveal-stagger">
        <p class="eyebrow">${escapeHtml(t(page, "eyebrow", locale))}</p>
        <h1>${escapeHtml(t(page, "title", locale))}</h1>
        <p class="lead">${escapeHtml(t(page, "summary", locale))}</p>
        ${page.type !== 'success' ? `<div class="hero-actions">${button(l.ctaTour, localizedPath("/contact/", locale), "primary")}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "secondary")}${button(l.ctaGuide, localizedPath("/academics/", locale), "ghost inverse")}</div>` : ""}
        ${isHome ? `<div class="slider-controls">
          <span class="slider-indicator">01 / 06</span>
          <button class="slider-arrow prev" type="button" aria-label="${locale === "th" ? "ภาพก่อนหน้า" : locale === "en" ? "Previous slide" : "上一张"}"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button class="slider-pause" type="button" aria-label="${locale === "th" ? "หยุดสไลด์ชั่วคราว" : locale === "en" ? "Pause slideshow" : "暂停轮播"}"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></button>
          <button class="slider-arrow next" type="button" aria-label="${locale === "th" ? "ภาพถัดไป" : locale === "en" ? "Next slide" : "下一张"}"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>` : ""}
      </div>
      ${page.type !== 'success' ? `<aside class="hero-index" aria-label="Program highlights" data-animate="fade-up">
        ${feature.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </aside>` : ""}
    </div>
  </section>`;
}

function stats(locale) {
  return `<section class="stats" aria-label="School highlights" data-animate="fade-up">${globals.stats.map(([n, th, en, zh]) => {
    let numStr = typeof n === "object" ? (locale === "th" ? n.th : locale === "en" ? n.en : n.zh) : n;
    const numMatch = String(numStr).match(/^(\d+)(.*)$/);
    const num = numMatch ? numMatch[1] : numStr;
    const suffix = numMatch ? numMatch[2] : "";
    return `<div><strong><span class="counter" data-target="${num}">${num}</span>${suffix}</strong><span>${escapeHtml(locale === "th" ? th : locale === "en" ? en : zh)}</span></div>`;
  }).join("")}</section>`;
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
  const rawSections = page.sections?.[locale] || page.sections?.th || page.sections;
  const sections = Array.isArray(rawSections) ? rawSections : [];
  if (sections.length === 0) return "";
  const eyebrowText = page.eyebrow?.[locale] || page.eyebrow?.th || page.eyebrow || (locale === "th" ? "รายละเอียด" : locale === "en" ? "Details" : "详情");
  
  const chart = page.chart?.[locale] || page.chart?.th || page.chart;
  let chartHtml = "";
  
  if (chart && chart.data && chart.data.length > 0) {
    const total = chart.data.reduce((sum, item) => sum + item.value, 0);
    let currentOffset = 0;
    const radius = 15.9155;
    
    // Calculate sizes and cumulative sizes for layering
    const sizes = chart.data.map(item => (item.value / total) * 100);
    const cumulatives = [];
    let currentSum = 0;
    for (let i = 0; i < sizes.length; i++) {
      currentSum += sizes[i];
      cumulatives.push(currentSum);
    }
    
    const pathsArray = [];
    // Render in reverse so the largest cumulative (100%) is at the bottom (rendered first)
    for (let i = chart.data.length - 1; i >= 0; i--) {
      const item = chart.data[i];
      const length = cumulatives[i];
      const strokeDasharray = `${length} ${100 - length}`;
      pathsArray.push(`<circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="${item.color}" stroke-width="8" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="0" class="chart-segment" style="animation-delay: ${i * 0.15}s" />`);
    }
    const paths = pathsArray.join("");

    chartHtml = `
      <div class="chart-container" data-animate="fade-in">
        <div class="donut-wrapper">
          <svg viewBox="0 0 42 42" class="donut-chart">
            <circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="rgba(0,0,0,0.05)" stroke-width="8" />
            ${paths}
          </svg>
          <div class="donut-center">
            <strong><span class="counter" data-target="100">0</span>%</strong>
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
            ${featuredSection.icon ? `<div class="icon-wrapper"><i data-feather="${featuredSection.icon}"></i></div>` : ""}
            <h3 style="font-size: 1.8rem; margin: 0; color: var(--sv-deep);">${escapeHtml(featuredSection.title || featuredSection[0])}</h3>
          </div>
          <p style="font-size: 1.15rem; margin-top: 16px; color: var(--muted); line-height: 1.7;">${escapeHtml(featuredSection.body || featuredSection[1])}</p>
        </div>
        ${chartHtml}
      </div>
      
      ${restSections.length > 0 ? `
        <div class="secondary-grid">
          ${restSections.map((sec, i) => `
            <div class="text-item" style="animation-delay: ${(i+1) * 0.1}s;">
              <div class="text-item-header">
                ${sec.icon ? `<div class="icon-wrapper"><i data-feather="${sec.icon}"></i></div>` : ""}
                <h3 style="margin: 0; color: var(--sv-deep);">${escapeHtml(sec.title || sec[0])}</h3>
              </div>
              <p style="margin-top: 12px; color: var(--muted); line-height: 1.7; flex-grow: 1;">${escapeHtml(sec.body || sec[1])}</p>
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;
  } else {
    contentHtml = `
      <div class="text-list ${sections.length === 1 ? 'cards-grid-1' : (sections.length === 2 ? 'cards-grid-2' : 'secondary-grid')}">
        ${sections.map((sec, i) => `
          <div class="text-item" style="animation-delay: ${i * 0.1}s;">
            <div class="text-item-header">
              ${sec.icon ? `<div class="icon-wrapper"><i data-feather="${sec.icon}"></i></div>` : ""}
              <h3 style="margin: 0; color: var(--sv-deep);">${escapeHtml(sec.title || sec[0])}</h3>
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
  <div class="program-card-img"><img src="${assetPath(image)}" alt="${escapeHtml(title)}" loading="lazy" width="600" height="400"></div>
  <div class="program-card-content">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
    <span>${locale === 'th' ? 'ดูรายละเอียด →' : locale === 'zh' ? '了解更多 →' : 'Learn More →'}</span>
  </div>
</a>`).join("")}</div></section>`;
}

function admissions(locale) {
  const cta = button(locale === 'th' ? 'ดูโครงสร้างค่าธรรมเนียม' : locale === 'zh' ? '查看学费' : 'View Tuition & Fees', localizedPath("/admissions/fees/", locale), "secondary");
  return `<section class="section"><div class="section-heading"><p class="eyebrow">Admissions</p><h2>${locale === 'th' ? 'สมัครง่ายใน 4 ขั้นตอน' : locale === 'zh' ? '四步完成申请' : 'Apply in Four Steps'}</h2></div><div class="steps">${globals.admissionsSteps[locale].map((s, i) => `<div><strong>${i + 1}</strong><span>${escapeHtml(s)}</span></div>`).join("")}</div><div style="margin-top: 40px; text-align: center;">${cta}</div></section>${formSection(locale, "admissions-inquiry")}`;
}

function fees(locale) {
  const heads = globals.fees[locale].heads;
  const rows = globals.fees[locale].rows;
  return `<section class="section"><div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td>${escapeHtml(r)}</td><td>${locale === "th" ? "รออัปเดตจากฝ่ายทะเบียน" : locale === "zh" ? "待招生办更新" : "To be updated by Admissions"}</td><td>${locale === "th" ? "โปรดติดต่อโรงเรียนเพื่อข้อมูลล่าสุด" : locale === "zh" ? "请联系学校获取最新信息。" : "Please contact the school for the latest information."}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function faq(locale) {
  return `<section class="section faq-list">${globals.faq[locale].map(([q, a], i) => `<article class="faq-item${i === 0 ? " is-open" : ""}" data-faq-item><button data-faq-trigger aria-expanded="${i === 0 ? "true" : "false"}">${escapeHtml(q)}<span>+</span></button><div class="faq-panel" data-faq-panel><div><p>${escapeHtml(a)}</p></div></div></article>`).join("")}</section>`;
}

function news(locale) {
  let items = dynamicData.news;
  if (!items || items.length === 0) {
     // fallback to static globals if db is empty
     items = globals.news[locale].map(arr => ({
         title_th: arr[0], title_en: arr[0], title_zh: arr[0],
         content_th: arr[2], content_en: arr[2], content_zh: arr[2],
         cover_image_url: assetPath(arr[3], 'real-4.jpg'),
         published_at: new Date().toISOString()
     }));
  }
  
  const featured = items[0];
  const listItems = items.slice(1, 4); // show next 3
  
  // Try to find album collage for featured
  let collageHtml = '';
  if (featured.album_id) {
     const album = dynamicData.albums.find(a => a.id === featured.album_id);
     if (album && album.album_photos && album.album_photos.length > 0) {
        const photos = album.album_photos.slice(0, 3); // take up to 3 photos
        collageHtml = `<div class="news-collage" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
           ${photos.map(p => `<img src="${escapeHtml(p.photo_url)}" alt="Album photo" loading="lazy" width="400" height="300" style="width:100%; height:auto; aspect-ratio:4/3; object-fit:cover; border-radius:8px;">`).join('')}
        </div>
        <div style="margin-top: 10px; font-size: 0.85rem; color: var(--sv-gold);"><i class="fas fa-images"></i> ${locale === "th" ? "ดูรูปภาพทั้งหมดในอัลบั้ม →" : "View all photos in album →"}</div>`;
     }
  }

  return `<section class="section" data-animate="fade-up">
    <div class="section-heading">
      <p class="eyebrow">News & Updates</p>
      <h2>${locale === "th" ? "ข่าวสารและกิจกรรม" : locale === "en" ? "Latest Announcements" : "最新动态"}</h2>
    </div>
    <div class="news-board">
      <a href="${localizedPath("/news/", locale)}" class="news-featured" style="display:flex; flex-direction:column;">
        <img src="${featured.cover_image_url || assetPath('', 'real-4.jpg')}" alt="${escapeHtml(featured[`title_${locale}`] || featured.title_th)}" width="800" height="500" loading="lazy" style="height:350px; object-fit:cover;">
        <div class="news-featured-content" style="position:relative; background: var(--white); padding: 30px; flex-grow: 1;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--sv-gold); letter-spacing: 1px; text-transform: uppercase;">${new Date(featured.published_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {month:'short', day:'numeric'})}</span>
          <h3 style="margin: 10px 0; color: var(--sv-deep);">${escapeHtml(featured[`title_${locale}`] || featured.title_th)}</h3>
          <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 0;">${escapeHtml((featured[`content_${locale}`] || featured.content_th || "").substring(0, 100))}...</p>
          ${collageHtml}
        </div>
      </a>
      <div class="news-list">
        ${listItems.length > 0 ? listItems.map((item) => `<a href="${localizedPath("/news/", locale)}" class="news-row">
          <div class="news-date">${new Date(item.published_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {month:'short', day:'numeric'})}</div>
          <div class="news-title">${escapeHtml(item[`title_${locale}`] || item.title_th)}</div>
        </a>`).join("") : ""}
        <a href="${localizedPath("/news/", locale)}" class="news-row" style="margin-top: auto; border: none;">
          <div class="news-title" style="color: var(--sv-crimson);">${locales[locale].readMore} &rarr;</div>
        </a>
      </div>
    </div>
  </section>`;
}

function parents(page, locale) {
  const now = new Date();
  const currentMonthEvents = dynamicData.calendar ? dynamicData.calendar.filter(e => new Date(e.start_date).getMonth() === now.getMonth()).slice(0, 3) : [];
  
  const calendarTitle = locale === "th" 
    ? now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
    : now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const eventsHtml = currentMonthEvents.length > 0 
    ? currentMonthEvents.map(e => `<span>${escapeHtml(locale === "th" ? e.title_th : (e.title_en || e.title_th))}</span>`).join("")
    : (locale === "th" ? "<span>ไม่มีกิจกรรมในเดือนนี้</span>" : "<span>No events this month</span>");

  return `<section class="section split">
    <div><p class="eyebrow">SV Portal</p><h2>${locale === "th" ? "ทุกข้อมูลสำคัญในที่เดียว" : locale === "en" ? "Everything Important in One Place" : "重要信息集中一处"}</h2><p>${locale === "th" ? "ใช้สำหรับประกาศ เอกสาร ปฏิทินกิจกรรม และทางเข้า SV Portal ระบบภายในของโรงเรียน" : locale === "en" ? "Notices, downloads, activity calendar, and a direct link to the school SV Portal." : "用于公告、下载、活动日历以及进入学校 SV Portal。"}</p>${button(locales[locale].portal, portalUrl, "primary")}</div>
    <div class="mini-calendar"><strong>${escapeHtml(calendarTitle)}</strong>${eventsHtml}</div>
  </section>${textSections(page, locale)}`;
}

function life(page, locale) {
  return `<section class="section"><div class="card-grid">${globals.lifeCards[locale].map(([title, body]) => `<article class="info-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join("")}</div></section>${textSections(page, locale)}`;
}

function formSection(locale, name = "contact") {
  const l = locales[locale];
  return `<section class="section form-section"><div><p class="eyebrow">${locale === "th" ? "ส่งข้อความ" : locale === "en" ? "Send Inquiry" : "发送咨询"}</p><h2>${locale === "th" ? "ให้ทีมโรงเรียนติดต่อกลับ" : locale === "en" ? "Have Our Team Contact You" : "让学校团队联系您"}</h2></div><form name="${name}" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-netlify-recaptcha="true" action="${localizedPath('/success/', locale)}" netlify>
    <p class="visually-hidden" style="opacity:0;position:absolute;z-index:-1;height:1px;width:1px;overflow:hidden;pointer-events:none;"><label>Don't fill this out: <input name="bot-field" tabindex="-1" aria-hidden="true"></label></p>
    <input type="hidden" name="form-name" value="${name}">
    <div><label for="${name}-name">${l.formName}</label><input id="${name}-name" name="name" required autocomplete="name"></div>
    <div><label for="${name}-phone">${l.formPhone}</label><input id="${name}-phone" name="phone" required autocomplete="tel"></div>
    <div><label for="${name}-email">${l.formEmail}</label><input id="${name}-email" name="email" type="email" autocomplete="email"></div>
    <div><label for="${name}-level">${l.formLevel}</label><select id="${name}-level" name="level">${locale === 'th' ? '<option>เตรียมอนุบาล</option><option>อนุบาล</option><option>ประถมศึกษา</option>' : locale === 'zh' ? '<option>学前班</option><option>幼儿园</option><option>小学</option>' : '<option>Pre-Kindergarten</option><option>Kindergarten</option><option>Primary</option>'}</select></div>
    <div class="full"><label for="${name}-message">${l.formMessage}</label><textarea id="${name}-message" name="message" rows="4"></textarea></div>
    <div data-netlify-recaptcha="true"></div>
    <button class="button primary" type="submit">${l.submit}</button>
  </form></section>`;
}

function contact(locale) {
  const l = locales[locale];
  return `<section class="section contact-grid">
    <div class="contact-card"><h2>${locale === "th" ? "ข้อมูลติดต่อ" : locale === "en" ? "Contact Information" : "联系方式"}</h2><p>${locale === "th" ? "โรงเรียนสมคิดวิทยา" : locale === "zh" ? "Somkidvittaya学校" : "Somkidvittaya School"}<br>${escapeHtml(l.address || siteSettings.address).replace(/\n/g, "<br>")}<br>Tel: ${escapeHtml(siteSettings.phone)}<br>Email: ${escapeHtml(siteSettings.email)}${siteSettings.line ? `<br>LINE: ${escapeHtml(siteSettings.line)}` : ''}</p><div class="hero-actions">${button(locales[locale].ctaTour, "#contact-form", "primary")}${button(locale === "th" ? "โทรหาเรา" : locale === "en" ? "Call Us" : "致电", `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`, "secondary")}</div></div>
    <div class="map-wrapper" style="width: 100%; height: 100%; min-height: 400px; background: #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow);">
      <iframe title="Map to Somkidvittaya School Rayong" loading="lazy" style="width:100%; height:100%; border:0;" src="https://maps.google.com/maps?q=${encodeURIComponent('โรงเรียนสมคิดวิทยา')}&t=&z=16&ie=UTF8&iwloc=B&output=embed" allowfullscreen="" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
    </div>
  </section><div id="contact-form">${formSection(locale, "contact")}</div>`;
}

function directorQuote(locale) {
  const quote = locale === "th" ? "“ทุกความตั้งใจของเราในวันนี้ คือการสร้างสรรค์พื้นที่แห่งอนาคตที่ดีที่สุดให้กับลูกหลานของเรา เพราะความสำเร็จที่ยิ่งใหญ่ที่สุดของโรงเรียนสมคิดวิทยา คือการได้เห็นเด็ก ๆ เติบโตอย่างงดงามและมีความสุขในทุก ๆ วัน”" : locale === "en" ? "\"Every effort we make today is dedicated to creating the best future environment for our children. The greatest success of Somkidvittaya School is seeing our students grow beautifully and happily every single day.\"" : "“我们今天所付出的每一份努力，都是为了给孩子创造最好的未来空间。Somkidvittaya学校最大的成功，就是看到孩子们每天都在美丽和快乐中成长。”";
  const name = locale === "th" ? "นาย ณัฐวัฒน์ สงเคราะห์ธรรม" : locale === "en" ? "Mr. Nattawat Songkrotham" : "Nattawat Songkrotham 先生";
  const title = locale === "th" ? "ผู้อำนวยการโรงเรียนสมคิดวิทยา" : locale === "en" ? "Director of Somkidvittaya School" : "Somkidvittaya学校校长";
  const cta = locale === "th" ? "อ่านสารฉบับเต็ม" : locale === "en" ? "Read Full Message" : "阅读全文";

  return `<section class="director-quote-section" data-animate="fade-up">
    <div class="director-quote-container">
      <div class="director-image-wrapper">
        <img src="/assets/images/director.png" alt="${escapeHtml(name)}" class="director-img" loading="lazy" width="400" height="400">
        <div class="director-gradient-fade"></div>
      </div>
      <div class="director-quote-content">
        <svg class="quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <blockquote class="director-quote-text">${quote}</blockquote>
        <div class="director-quote-author">
          <strong>${name}</strong>
          <span>${title}</span>
        </div>
        ${button(cta, localizedPath("/director/", locale), "secondary")}
      </div>
    </div>
  </section>`;
}

function directorFullMessage(page, locale) {
  let sections = page.sections?.[locale] || page.sections?.th || page.sections || [];
  if (!Array.isArray(sections)) sections = [];
  return `<section class="director-full-message">
    <div class="director-message-container" data-animate="fade-up">
      ${sections.map((sec, i) => {
        if (sec.highlight) {
          return `<blockquote class="message-highlight" style="animation-delay: ${i * 0.1}s">${escapeHtml(sec.highlight)}</blockquote>`;
        }
        return `<p class="${i === 0 ? 'drop-cap' : ''}" style="animation-delay: ${i * 0.1}s">${escapeHtml(sec.text || "")}</p>`;
      }).join("")}
      ${(() => {
        const signoff = page.signoff?.[locale] || page.signoff?.th || page.signoff;
        if (!signoff) return "";
        return `
      <div class="message-signoff" style="animation-delay: ${sections.length * 0.1}s">
        <img src="${assetPath(signoff.image, "director.png")}" alt="${escapeHtml(signoff.name)}" class="signoff-avatar" loading="lazy" width="64" height="64">
        <div class="signoff-details">
          <strong>${escapeHtml(signoff.name)}</strong>
          <span>${escapeHtml(signoff.title)}</span>
        </div>
      </div>
      `;
      })()}
    </div>
  </section>`;
}

function homeVideoSection(locale) {
  const title = locale === "th" ? "แนะนำโรงเรียน" : locale === "en" ? "School Introduction" : "学校介绍";
  const subtitle = locale === "th" ? "Somkidvittaya School" : locale === "en" ? "Somkidvittaya School" : "Somkidvittaya 学校";
  const desc = locale === "th" ? "รับชมวิดีโอแนะนำโรงเรียน เพื่อทำความรู้จักกับแนวทางการจัดการเรียนการสอน สภาพแวดล้อม และความตั้งใจของเราในการสร้างพื้นที่แห่งการเรียนรู้สำหรับเด็ก ๆ" : locale === "en" ? "Watch our school introduction video to learn more about our teaching approach, environment, and our dedication to creating a wonderful learning space for children." : "观看我们的学校介绍视频，了解我们的教学方法、环境以及我们致力于为孩子们创造美好学习空间的决心。";

  return `<section class="section video-section" style="padding-top: 2rem; padding-bottom: 4rem;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 4rem; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 5vw;">
    <div data-animate="fade-up">
      <p class="eyebrow">${subtitle}</p>
      <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">${title}</h2>
      <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem;">${desc}</p>
    </div>
    <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative; padding-bottom: 56.25%; height: 0;" data-animate="fade-up" class="video-container">
      <iframe src="https://www.youtube-nocookie.com/embed/HBVkXyl8GVw?si=TE8888H4bXtYiacA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
    </div>
  </div>
</section>`;
}

function parentVoices(locale) {
  const reviews = [
    {
      img: "Baibua.png",
      quote: {
        th: "“ตอนแรกที่เข้าโรงเรียน แม่มีความกังวลมาก ว่าน้องจะปรับตัวได้ไหม ร้องไห้ทุกวันรึเปล่า แต่ปรากฏว่าคุณครูที่นี่ทำให้แม่ประทับใจมาก เพราะมีความใส่ใจเด็ก จำรายละเอียดเล็กๆน้อยๆของเด็กได้ และตัวน้องเองก็มีความสุขในการไปโรงเรียนทุกวัน มีพัฒนาการที่ดีขึ้นเรื่อยๆ ช่วยเหลือตัวเองได้ และมีสังคมที่ดี ประทับใจคุณครูและโรงเรียนมากๆค่ะ”",
        en: "\"At first, I was very worried if my child would adapt or cry every day. However, the teachers here impressed me immensely with their attentiveness. They remember every little detail about the kids. My child is happy going to school every day, shows continuous development, has become more self-reliant, and enjoys a good social environment. I am deeply impressed with the teachers and the school.\"",
        zh: "“刚入学时，我非常担心孩子能否适应，会不会每天哭闹。但结果这里的老师让我印象深刻，因为他们对孩子非常用心，能记住孩子的每一个小细节。孩子每天都很开心地去上学，各方面都在不断进步，不仅能照顾自己，还拥有了很好的社交环境。我对老师和学校感到非常满意。”"
      },
      name: { th: "คุณแม่น้องใจบุญ", en: "Jaiboon's Mother", zh: "Jaiboon的母亲" },
      grade: { th: "อนุบาล 3", en: "Kindergarten 3", zh: "幼儿园大班" }
    },
    {
      img: "Phoenix.png",
      quote: {
        th: "“มีความเปลี่ยนแปลงไปในทางที่ดีขึ้นในหลายๆด้าน ตั้งแต่ย้ายมาเรียนที่สมคิดวิทยา ลูกมีความสุขในการไปโรงเรียนทุกวัน ลูกกลับบ้านมาเล่าเรื่องโรงเรียนด้วยความสนุกสนาน กล้าคิด กล้าแสดงออก มีความชอบและอยากทำกิจกรรมกับทางโรงเรียนทุกกิจกรรม เป็นการตัดสินใจที่ดีและคุ้มค่าที่สุดในการหาสังคมโรงเรียนที่ดี สำหรับอนาคตของลูกค่ะ”",
        en: "\"We have seen positive changes in many aspects since moving to Somkidvittaya. My child is happy to go to school every day, comes home excitedly sharing stories, and has become more confident in expressing thoughts. They are eager to participate in every school activity. Choosing this school was the best and most worthwhile decision to provide a great social environment for my child's future.\"",
        zh: "“自从转到Somkidvittaya学校后，我们在很多方面都看到了积极的变化。孩子每天都很开心地去上学，回家后总是兴奋地分享学校里的趣事，变得更加自信，勇于表达自己的想法，并且渴望参与学校的各项活动。为了孩子未来的良好社交环境，选择这所学校是我们做出的最明智、最有价值的决定。”"
      },
      name: { th: "คุณแม่น้องฟินิกซ์", en: "Phoenix's Mother", zh: "Phoenix的母亲" },
      grade: { th: "อนุบาล 3", en: "Kindergarten 3", zh: "幼儿园大班" }
    },
    {
      img: "Rakaeoy.png",
      quote: {
        th: "“ตั้งแต่ตัดสินใจส่งลูกสาวมาเรียนที่โรงเรียนสมคิดวิทยา รู้สึกได้ถึงการเปลี่ยนแปลงในทางที่ดีขึ้นอย่างชัดเจน ลูกมีความสุขกับการไปโรงเรียนทุกวัน กลับมาเล่าเรื่องราวต่าง ๆ ด้วยความสนุกสนาน และมีความมั่นใจ กล้าคิด กล้าแสดงออกมากขึ้น ลูกเป็นเด็กขยัน ตั้งใจเรียน และมีผลการเรียนที่ดีขึ้นอย่างต่อเนื่อง ที่สำคัญคือคุณครูทุกท่านตั้งใจสอน ดูแล และอบรมนักเรียนด้วยความเอาใจใส่ ทำให้ผู้ปกครองรู้สึกมั่นใจและประทับใจเป็นอย่างมาก การตัดสินใจเลือกโรงเรียนสมคิดวิทยาให้ลูก ถือเป็นการตัดสินใจที่ดีและคุ้มค่าที่สุด เพราะได้เห็นลูกมีความสุข เติบโตอย่างมีคุณภาพ และมีพัฒนาการที่ดีขึ้นในทุก ๆ ด้านค่ะ”",
        en: "\"Since we decided to enroll our daughter at Somkidvittaya School, we've clearly noticed positive changes. She is happy going to school every day, enthusiastically shares stories, and has grown more confident and expressive. She is diligent, attentive in class, and her academic performance keeps improving. Most importantly, all the teachers are dedicated, caring, and nurture the students with great attention, giving parents immense confidence and satisfaction. Choosing Somkidvittaya was the best and most rewarding decision, as we see our child happy, growing with quality, and developing well in every aspect.\"",
        zh: "“自从决定把女儿送到Somkidvittaya学校以来，我们清楚地感受到了积极的变化。她每天都很开心地去上学，回家后兴高采烈地分享各种故事，变得更加自信和敢于表达。她现在很勤奋，学习专心，成绩也在不断进步。最重要的是，所有的老师都非常尽责，用心教导和照顾学生，这让家长感到无比安心和满意。选择Somkidvittaya是我们做出的最好、最值得的决定，因为我们看到孩子不仅快乐，而且在各方面都得到了高质量的成长和发展。”"
      },
      name: { th: "คุณแม่น้องรักเอย", en: "Rakaeoy's Mother", zh: "Rakaeoy的母亲" },
      grade: { th: "ประถมศึกษาปีที่ 6", en: "Grade 6", zh: "小学六年级" }
    }
  ];

  const eyebrow = locale === "th" ? "เสียงจากผู้ปกครอง" : locale === "en" ? "Parent Voices" : "家长心声";

  const slidesHtml = reviews.map((r, i) => `
    <div class="review-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div class="director-quote-container reversed">
        <div class="director-image-wrapper">
          <img src="/assets/images/${r.img}" alt="${escapeHtml(r.name[locale])}" class="director-img" width="280" height="280" loading="lazy" style="border-radius: 50%; max-width: 280px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); object-fit: cover; aspect-ratio: 1/1;">
        </div>
        <div class="director-quote-content">
          <p class="eyebrow">${eyebrow}</p>
          <svg class="quote-icon" style="color: var(--sv-gold); margin-top: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
          <blockquote class="director-quote-text" style="font-size: 1.25rem;">${escapeHtml(r.quote[locale])}</blockquote>
          <div class="director-quote-author">
            <strong>${escapeHtml(r.name[locale])}</strong>
            <span style="font-size: 0.9rem; color: var(--muted);">${escapeHtml(r.grade[locale])}</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  return `<section class="director-quote-section review-carousel-section" data-animate="fade-up" style="background: var(--sv-stone); padding: 4rem 0; overflow: hidden; position: relative;">
    <div class="review-carousel-track" style="position: relative; width: 100%; min-height: 500px;">
      ${slidesHtml}
    </div>
    <div class="review-carousel-dots" style="display: flex; justify-content: center; gap: 8px; margin-top: 2rem; position: relative; z-index: 10;">
      ${reviews.map((_, i) => `<button class="review-dot ${i === 0 ? 'active' : ''}" aria-label="Go to slide ${i+1}" data-index="${i}"></button>`).join("")}
    </div>
  </section>`;
}

function whySV(locale) {
  const content = {
    th: {
      eyebrow: "จุดเด่นของ SV",
      title: "ทำไมต้องสมคิดวิทยา",
      pillars: [
        { icon: "message-circle", title: "สภาพแวดล้อม 2 ภาษา", body: "พัฒนาทักษะภาษาอังกฤษอย่างเป็นธรรมชาติผ่านการใช้งานจริงในชีวิตประจำวัน สร้างความมั่นใจในการสื่อสาร" },
        { icon: "users", title: "เรียนรู้ผ่านการลงมือทำ (PBL)", body: "ห้องเรียนแบบ Active Learning ที่เน้นให้เด็กคิดวิเคราะห์และแก้ปัญหาผ่านโครงงานที่ประยุกต์ใช้ได้ในโลกจริง" },
        { icon: "pie-chart", title: "ดูแลใส่ใจรายบุคคลด้วยข้อมูล", body: "เราใช้ข้อมูลเพื่อติดตามและสนับสนุนพัฒนาการของนักเรียนแต่ละคนอย่างใกล้ชิดและตรงจุดตามศักยภาพ" },
        { icon: "trending-up", title: "เส้นทางการเรียนรู้ที่ต่อเนื่อง", body: "เตรียมความพร้อมอย่างมั่นคงตั้งแต่ระดับเตรียมอนุบาลจนจบประถมศึกษา สู่ทักษะแห่งอนาคตอย่างไร้รอยต่อ" }
      ]
    },
    en: {
      eyebrow: "Why SV",
      title: "Why Somkidvittaya",
      pillars: [
        { icon: "message-circle", title: "Natural Bilingual Environment", body: "Develop English proficiency organically through real-world daily interactions for confident communication." },
        { icon: "users", title: "Project-Based Learning", body: "Active classrooms focused on critical thinking and problem-solving through hands-on, real-world projects." },
        { icon: "pie-chart", title: "Data-Informed Care", body: "We use data to closely monitor and support each student's unique development precisely and effectively." },
        { icon: "trending-up", title: "Seamless Academic Pathways", body: "A secure and connected foundation from Pre-K through Primary, preparing students for future skills." }
      ]
    },
    zh: {
      eyebrow: "SV 的优势",
      title: "为什么选择 Somkidvittaya",
      pillars: [
        { icon: "message-circle", title: "自然的双语环境", body: "通过日常生活中的实际运用自然地发展英语技能，实现自信交流。" },
        { icon: "users", title: "项目式学习 (PBL)", body: "活跃的课堂重点是通过能应用于现实世界的动手项目培养批判性思维。" },
        { icon: "pie-chart", title: "基于数据的个性化关怀", body: "我们使用数据密切跟踪并精确支持每位学生独特的发展轨迹。" },
        { icon: "trending-up", title: "无缝衔接的学习路径", body: "从学前班到小学阶段的坚实基础，为学生掌握未来技能做好全面准备。" }
      ]
    }
  };

  const data = content[locale] || content.th;
  
  return `<section class="section why-sv-section" data-animate="fade-up" style="position: relative; overflow: hidden; padding-top: 6rem; padding-bottom: 6rem;">
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; max-width: 800px; margin: 0 auto 60px auto; width: 100%;">
      <p style="color: var(--sv-crimson); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${data.eyebrow}</p>
      <h2 style="font-size: 2.5rem; margin-top: 12px; margin-bottom: 0; color: var(--sv-deep);">${data.title}</h2>
    </div>
    
    <div class="why-sv-grid">
      ${data.pillars.map((pillar, i) => `
        <div class="why-sv-card" style="display: flex; flex-direction: column; align-items: flex-start; animation-delay: ${i * 0.1}s; height: 100%;">
          <div class="icon-wrapper" style="width: 64px; height: 64px; background: rgba(139, 29, 50, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--sv-crimson); margin-bottom: 24px; transition: all 0.3s ease;">
            <i data-feather="${pillar.icon}" style="width: 32px; height: 32px; stroke-width: 2;"></i>
          </div>
          <h3 style="font-size: 1.3rem; color: var(--sv-deep); margin: 0 0 16px 0; font-weight: 700; line-height: 1.4;">${pillar.title}</h3>
          <p style="color: var(--muted); line-height: 1.7; margin: 0; font-size: 1.05rem;">${pillar.body}</p>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function homeSections(page, locale) {
  return `${stats(locale)}${quickLinks(locale)}${directorQuote(locale)}${homeVideoSection(locale)}${whySV(locale)}${programCards(locale)}${parentVoices(locale)}${news(locale)}${formSection(locale, "quick-inquiry")}`;
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
      <h2 class="timeline-main-title" style="margin-left: 5rem; margin-bottom: 3rem; color: var(--sv-gold); font-size: 2.2rem; font-weight: 700;">
        ${locale === "th" ? "66 ปี แห่งประวัติศาสตร์สมคิดวิทยา" : locale === "en" ? "66 Years of Somkidvittaya History" : "Somkidvittaya 66年历史"}
      </h2>
      ${sections.map(sec => `
        <div class="history-chapter">
          <div class="chapter-header">
            ${sec.subtitle ? `<p class="chapter-subtitle">${escapeHtml(sec.subtitle)}</p>` : ""}
            <h3>${escapeHtml(sec.title || "")}</h3>
            ${sec.body ? `<p class="chapter-body">${escapeHtml(sec.body)}</p>` : ""}
          </div>
          <div class="chapter-events">
            ${(sec.events || []).map(ev => `
              <div class="event-item" data-animate="fade-up">
                <div class="event-year">${escapeHtml(ev.year || "")}</div>
                <div class="event-content">
                  ${ev.title ? `<h4>${escapeHtml(ev.title)}</h4>` : ""}
                  <p>${ev.text ? escapeHtml(ev.text).replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") : ""}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
    ${epilogue ? `
    <div class="epilogue-section">
      <div class="epilogue-giant-graphic">
        <img src="/assets/images/epilogue-graphic.png" alt="Epilogue Graphic" width="800" height="800">
      </div>
      <div class="epilogue-text" style="position: relative; z-index: 2; text-align: center;">
        <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 24px auto;"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <h3>${escapeHtml(epilogue.title || "")}</h3>
        <div class="epilogue-body">${escapeHtml(epilogue.body || "").replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>
      </div>
    </div>
    ` : ""}
  </section>`;
}


function facultyDirectory(locale) {
  const personnel = dynamicData.personnel || [];
  const execs = personnel.filter(p => p.category === 'executive');
  const teachers = personnel.filter(p => p.category === 'teacher');
  const staff = personnel.filter(p => p.category === 'staff');
  
  const renderCard = (p) => {
    const name = locale === 'th' ? p.name_th : (p.name_en || p.name_th);
    const position = locale === 'th' ? p.position_th : (p.position_en || p.position_th);
    const bio = locale === 'th' ? p.bio_th : (p.bio_en || p.bio_th);
    const image = p.image_url || '/assets/images/placeholder.jpg';
    
    return `<div class="faculty-card">
      <div class="faculty-image"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" width="400" height="500" /><div class="faculty-gradient-fade"></div></div>
      <div class="faculty-info">
        <h3>${escapeHtml(name)}</h3>
        <p class="position">${escapeHtml(position)}</p>
        ${bio ? `<p class="bio">${escapeHtml(bio)}</p>` : ''}
      </div>
    </div>`;
  };

  const renderSection = (title, list) => {
    if (list.length === 0) return '';
    return `<div class="faculty-section">
      <h2 class="text-center">${title}</h2>
      <div class="faculty-grid">
        ${list.map(renderCard).join('')}
      </div>
    </div>`;
  };

  const tExecs = locale === 'th' ? 'คณะผู้บริหาร' : (locale === 'en' ? 'Executive Board' : '执行委员会');
  const tTeachers = locale === 'th' ? 'คณะครู' : (locale === 'en' ? 'Teachers' : '教师');
  const tStaff = locale === 'th' ? 'บุคลากร' : (locale === 'en' ? 'Staff' : '工作人员');

  return `<section class="section faculty-directory">
    <div class="container">
      ${renderSection(tExecs, execs)}
      ${renderSection(tTeachers, teachers)}
      ${renderSection(tStaff, staff)}
    </div>
  </section>`;
}


function documentHub(locale) {
  const docs = dynamicData.documents || [];
  
  if (docs.length === 0) {
    return `<section class="section document-hub"><div class="container text-center"><p>${locale === 'th' ? 'ยังไม่มีเอกสารในขณะนี้' : 'No documents available.'}</p></div></section>`;
  }

  const renderDoc = (doc) => {
    const title = locale === 'th' ? doc.title_th : (doc.title_en || doc.title_th);
    const date = new Date(doc.created_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const size = doc.file_size_bytes ? (doc.file_size_bytes / 1024 / 1024).toFixed(2) + ' MB' : '';
    
    return `<a href="${escapeHtml(doc.file_url)}" target="_blank" rel="noopener noreferrer" class="document-card">
      <div class="doc-icon"><i data-feather="file-text"></i></div>
      <div class="doc-info">
        <h3>${escapeHtml(title)}</h3>
        <p class="meta"><span>${escapeHtml(doc.file_type.toUpperCase())}</span> ${size ? `• <span>${size}</span>` : ''} • <span>${date}</span></p>
      </div>
      <div class="doc-action"><i data-feather="download"></i></div>
    </a>`;
  };

  return `<section class="section document-hub">
    <div class="container">
      <div class="document-list">
        ${docs.map(renderDoc).join('')}
      </div>
    </div>
  </section>`;
}


function photoGallery(locale) {
  const albums = dynamicData.albums || [];
  
  if (albums.length === 0) {
    return `<section class="section gallery-hub"><div class="container text-center"><p>${locale === 'th' ? 'ยังไม่มีอัลบั้มในขณะนี้' : 'No albums available.'}</p></div></section>`;
  }

  const renderAlbum = (album) => {
    const title = locale === 'th' ? album.title_th : (album.title_en || album.title_th);
    const date = new Date(album.event_date).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const cover = album.cover_image_url || (album.album_photos?.[0]?.image_url) || '/assets/images/placeholder.jpg';
    const count = album.album_photos ? album.album_photos.length : 0;
    
    // Using a lightbox trick or just displaying it
    // For a static site, we can just link to a lightbox or expand it. We'll use a simple grid here.
    return `<div class="album-card">
      <div class="album-cover"><img src="${cover}" alt="${title}" loading="lazy" width="600" height="400" /></div>
      <div class="album-info">
        <h3>${escapeHtml(title)}</h3>
        <p class="meta"><span>${date}</span> • ${count} ${locale === 'th' ? 'รูปภาพ' : 'Photos'}</p>
      </div>
    </div>`;
  };

  return `<section class="section gallery-hub">
    <div class="container">
      <div class="album-grid">
        ${albums.map(renderAlbum).join('')}
      </div>
    </div>
  </section>`;
}

function bodyContent(page, locale) {
  if (page.type === "success") return "";
  if (page.type === "director") return directorFullMessage(page, locale);
  if (page.type === "home") return homeSections(page, locale);
  if (page.type === "about") return aboutSections(page, locale);
  if (page.type === "programs") return `${programCards(locale)}${textSections({ ...page, sections: { [locale]: [[locale === "th" ? "ภาพรวมหลักสูตร" : "Overview", t(page, "summary", locale)]] } }, locale)}`;
  if (page.type === "admissions") return admissions(locale);
  if (page.type === "steps") return admissions(locale);
  if (page.type === "fees") return fees(locale);
  if (page.type === "form") return formSection(locale, "admissions-apply");
  if (page.type === "faq") return faq(locale);
  if (page.type === "life") return life(page, locale);
  if (page.type === "parents") return parents(page, locale);
  if (page.type === "news") return news(locale);
  if (page.type === "contact") return contact(locale);
  if (page.type === "faculty") return facultyDirectory(locale);
  if (page.type === "documents") return documentHub(locale);
  if (page.type === "gallery") return photoGallery(locale);
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
    const homePage = pages.find(p => p.id === "home") || pages[0];
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t(homePage, "title", locale),
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

function html(page, locale, cssHash) {
  let fallbackSuffix = " | Somkidvittaya School";
  if (locale === "th") fallbackSuffix = " | โรงเรียนสมคิดวิทยา";
  else if (locale === "zh") fallbackSuffix = " | Somkidvittaya学校";
  const fallbackTitle = `${t(page, "title", locale)}${fallbackSuffix}`;
  const fallbackDescription = `${t(page, "summary", locale)} ${seoFallback[locale][1]}`;
  let title, description;
  try {
    let rawSeo = page.seo?.[locale];
    if (rawSeo && !Array.isArray(rawSeo) && rawSeo[locale]) {
      rawSeo = rawSeo[locale];
    }
    const seoArray = rawSeo || [fallbackTitle, fallbackDescription.slice(0, 230)];
    title = seoArray[0];
    description = seoArray[1];
  } catch (e) {
    console.error("SEO Error:", page.id, locale, page.seo?.[locale]);
    title = fallbackTitle;
    description = fallbackDescription.slice(0, 230);
  }
  
  const alternates = Object.keys(locales).map((code) => `<link rel="alternate" hreflang="${code}" href="${pageUrl(page.path, code)}">`).join("\n  ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${pageUrl(page.path, "th")}">`;
  
  return `<!doctype html>
<html lang="${locale}"${locale === "zh" ? " class=\"lang-zh\"" : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="view-transition" content="same-origin">
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
  <meta property="og:image" content="${absoluteAssetUrl(page.image, "real-1.jpg")}">
  <meta property="og:locale" content="${locale === "th" ? "th_TH" : locale === "en" ? "en_US" : "zh_CN"}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absoluteAssetUrl(page.image, "real-1.jpg")}">
  
  <link rel="preload" as="image" href="${assetPath(page.image, "real-1.jpg")}">
  <link rel="preload" as="font" type="font/ttf" href="/assets/fonts/SukhumvitSet-Text.ttf" crossorigin>
  <link rel="preload" as="font" type="font/ttf" href="/assets/fonts/SukhumvitSet-SemiBold.ttf" crossorigin>
  <link rel="icon" href="/favicon-v3-final.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v3-final.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=${cssHash}">
  ${structuredData(page, locale)}
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
  <div id="cookie-banner" class="cookie-banner">
    <div class="cookie-banner-content">
      <p>${locale === 'th' ? 'เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน' : 'We use cookies to improve your experience.'}</p>
      <button id="accept-cookies" class="button primary small">${locale === 'th' ? 'ยอมรับ' : 'Accept'}</button>
    </div>
  </div>
  <script src="/main.js" defer></script>
  <script src="https://unpkg.com/feather-icons@4.29.2/dist/feather.min.js" integrity="sha384-qEqAs1VsN9WH2myXDbiP2wGGIttL9bMRZBKCl54ZnzpDlVqbYANP9vMaoT/wvQcf" crossorigin="anonymous"></script>
</body>
</html>`;
}

function outputPath(path, locale) {
  const clean = localizedPath(path, locale).replace(/^\/|\/$/g, "");
  return clean ? join(dist, clean, "index.html") : join(dist, "index.html");
}

function writePage(page, locale, cssHash) {
  const file = outputPath(page.path, locale);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html(page, locale, cssHash));
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

// Read CSS early to compute content hash
const cssOrder = ['variables.css', 'reset.css', 'typography.css', 'layout.css', 'components.css', 'animations.css'];
let combinedCss = '';
for (const file of cssOrder) {
  const filePath = join(root, "src", "css", file);
  if (existsSync(filePath)) {
    combinedCss += readFileSync(filePath, "utf8") + "\n";
  }
}
const minifiedCss = combinedCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([\{\}\:\;\,])\s*/g, '$1').trim();
const cssHash = crypto.createHash('md5').update(minifiedCss).digest('hex').substring(0, 8);

for (const page of pages) {
  for (const locale of Object.keys(locales)) writePage(page, locale, cssHash);
}
  
writeFileSync(join(dist, "styles.css"), minifiedCss);
copyAsset("src/main.js", "main.js");
copyAsset("src/assets/favicon-v3-final.ico", "favicon-v3-final.ico");
copyAsset("src/assets/apple-touch-icon-v3-final.png", "apple-touch-icon-v3-final.png");

// Copy Fonts
mkdirSync(join(dist, "assets", "fonts"), { recursive: true });
for (const font of ['SukhumvitSet-Light.ttf', 'SukhumvitSet-SemiBold.ttf', 'SukhumvitSet-Text.ttf', 'SukhumvitSet-Thin.ttf']) {
  if (existsSync(join(root, 'src', 'assets', 'fonts', font))) {
    copyFileSync(join(root, 'src', 'assets', 'fonts', font), join(dist, "assets", "fonts", font));
  }
}

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
