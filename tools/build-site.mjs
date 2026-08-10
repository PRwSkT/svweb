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
    langTitle: "ภาษา"
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
    langTitle: "Language"
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
    langTitle: "语言"
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

const sharedStats = [
  ["66", "ปีแห่งความไว้วางใจ", "Years of trust", "年办学传承"],
  ["200+", "นักเรียนในชุมชน SV", "Students in the SV community", "SV 学习社区学生"],
  ["3", "ภาษาเพื่อโลกกว้าง", "Languages for global readiness", "三语学习环境"],
  ["MEP", "Modern English Program", "Modern English Program", "现代英语课程"]
];

const siteSettings = yaml.load(readFileSync(join(root, 'content/settings/site.yml'), 'utf8'));

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
  const options = Object.keys(locales).map((code) => {
    const selected = code === locale ? " selected" : "";
    return `<option value="${localizedPath(page.path, code)}"${selected}>${locales[code].label}</option>`;
  }).join("");
  return `<label class="language-switch"><span>${locales[locale].langTitle}</span><select data-language-select aria-label="${locales[locale].langTitle}">${options}</select></label>`;
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
        <img src="/assets/images/logo.png" alt="Somkidvittaya School Logo" class="brand-logo">
      </a>
      <button class="menu-button" data-menu-button aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
      <nav id="site-nav" class="site-nav" data-site-nav>${navLinks}</nav>
      <div class="header-actions">${languageSelect(page, locale)}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary small")}</div>
    </div>
  </header>`;
}

function footer(locale) {
  const l = locales[locale];
  return `<footer class="site-footer">
    <div class="footer-grid">
      <div>
        <img src="/assets/images/logo-white.png" alt="Somkidvittaya School" style="height: 80px; width: auto; max-width: 100%; display: block; margin-bottom: 1rem;">
        <p style="margin-bottom: 2rem; font-size: 0.95rem; opacity: 0.9; line-height: 1.5;">${escapeHtml(l.footer)}</p>
        
        <img src="/assets/images/siritham-logo.png" alt="Siritham Co., Ltd." style="height: 80px; width: auto; max-width: 100%; display: block; margin-bottom: 1rem;">
        <p style="font-size: 0.95rem; opacity: 0.9; line-height: 1.5;">${locale === "th" ? "บริษัท ศิริธรรม จำกัด" : "Siritham Co., Ltd."}</p>
      </div>
      <div>
        <h3>${locale === "th" ? "ติดต่อ" : locale === "en" ? "Contact" : "联系"}</h3>
        <p>${escapeHtml(siteSettings.address).replace(/\n/g, "<br>")}<br>Tel: ${escapeHtml(siteSettings.phone)}<br>Email: ${escapeHtml(siteSettings.email)}</p>
      </div>
      <div>
        <h3>${locale === "th" ? "ทางลัด" : locale === "en" ? "Quick Links" : "快捷链接"}</h3>
        <a href="${localizedPath("/admissions/", locale)}">${l.ctaApply}</a>
        <a href="${localizedPath("/parents/", locale)}">${l.portal}</a>
        <a href="${localizedPath("/contact/", locale)}">${l.ctaTour}</a>
        <a href="${localizedPath("/privacy/", locale)}">${locale === "th" ? "ประกาศความเป็นส่วนตัว" : locale === "en" ? "Privacy Policy" : "隐私声明"}</a>
      </div>
    </div>
    <p class="footer-note">© 2026 Somkidvittaya School.</p>
  </footer>
  <div class="mobile-cta">${button(locale === "th" ? "โทร" : locale === "en" ? "Call" : "电话", `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`, "ghost")}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary")}${button(l.ctaTour, localizedPath("/contact/", locale), "secondary")}</div>`;
}

function hero(page, locale) {
  const l = locales[locale];
  const feature = locale === "th"
    ? ["MEP", "Active Learning", "PBL", "AI Integration"]
    : locale === "en"
      ? ["MEP", "Active Learning", "PBL", "AI Integration"]
      : ["MEP", "主动学习", "项目式学习", "AI 应用"];

  const isHome = page.id === "home";
  const slidesHtml = isHome ? `data-slides='["/assets/images/real-1.jpg","/assets/images/real-2.jpg","/assets/images/real-3.jpg","/assets/images/real-4.jpg","/assets/images/real-5.jpg","/assets/images/real-6.png"]'` : "";
  const pageImage = page.image || 'real-1.jpg';

  return `<section class="hero" style="--hero-image: url('/assets/images/${pageImage}')" ${slidesHtml}>
    <div class="hero-content">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(t(page, "eyebrow", locale))}</p>
        <h1>${escapeHtml(t(page, "title", locale))}</h1>
        <p class="lead">${escapeHtml(t(page, "summary", locale))}</p>
        <div class="hero-actions">${button(l.ctaTour, localizedPath("/contact/", locale), "secondary")}${button(l.ctaApply, localizedPath("/admissions/apply/", locale), "primary")}${button(l.ctaGuide, localizedPath("/academics/", locale), "ghost inverse")}</div>
      </div>
      <aside class="hero-index" aria-label="Program highlights">
        ${feature.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </aside>
    </div>
  </section>`;
}

function stats(locale) {
  return `<section class="stats" aria-label="School highlights">${sharedStats.map(([n, th, en, zh]) => `<div><strong>${n}</strong><span>${escapeHtml(locale === "th" ? th : locale === "en" ? en : zh)}</span></div>`).join("")}</section>`;
}

function quickLinks(locale) {
  const heading = locale === "th" ? "เริ่มจากสิ่งที่คุณต้องการ" : locale === "en" ? "Start with What You Need" : "从您的需求开始";
  const items = {
    th: [
      ["ว่าที่ผู้ปกครอง", "หลักสูตร ค่าใช้จ่าย และนัดเยี่ยมชม", "/admissions/"],
      ["ผู้ปกครองปัจจุบัน", "SV Portal ปฏิทิน และเอกสาร", "/parents/"],
      ["สำรวจหลักสูตร", "MEP เตรียมอนุบาล อนุบาล ประถม", "/academics/"]
    ],
    en: [
      ["Prospective Parents", "Programs, fees, and tours", "/admissions/"],
      ["Current Parents", "SV Portal, calendar, and documents", "/parents/"],
      ["Explore Academics", "MEP, early years, kindergarten, primary", "/academics/"]
    ],
    zh: [
      ["准家长", "课程、费用与预约参观", "/admissions/"],
      ["在校家长", "SV Portal、日历与文件", "/parents/"],
      ["了解课程", "MEP、幼儿阶段、幼儿园、小学", "/academics/"]
    ]
  };
  return `<section class="quick-links"><div><p class="eyebrow">SV Pathways</p><h2>${escapeHtml(heading)}</h2></div><div class="quick-link-grid">${items[locale].map(([title, body, href]) => `<a href="${localizedPath(href, locale)}"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></a>`).join("")}</div></section>`;
}

function textSections(page, locale) {
  const sections = page.sections?.[locale] || page.sections?.th || [];
  return `<section class="section"><div class="section-heading"><p class="eyebrow">${locale === "th" ? "รายละเอียด" : locale === "en" ? "Details" : "详情"}</p><h2>${escapeHtml(t(page, "title", locale))}</h2></div><div class="card-grid">${sections.map(sec => `<article class="info-card"><h3>${escapeHtml(sec.title || sec[0])}</h3><p>${escapeHtml(sec.body || sec[1])}</p></article>`).join("")}</div></section>`;
}

function programCards(locale) {
  const copy = {
    th: [["MEP Program", "ใช้ภาษาอังกฤษในบริบทจริงควบคู่หลักสูตรไทย", "/academics/mep/"], ["เตรียมอนุบาล", "ดูแลก้าวแรกอย่างอบอุ่นผ่านการเล่น", "/academics/pre-kindergarten/"], ["อนุบาล", "สำรวจ สร้างสรรค์ และสื่อสารอย่างมั่นใจ", "/academics/kindergarten/"], ["ประถมศึกษา", "วางรากฐานวิชาการ ภาษา และทักษะอนาคต", "/academics/primary/"]],
    en: [["MEP Program", "English in real contexts with Thai foundations.", "/academics/mep/"], ["Pre-Kindergarten", "Gentle first steps through play.", "/academics/pre-kindergarten/"], ["Kindergarten", "Explore, create, and communicate.", "/academics/kindergarten/"], ["Primary", "Academics, language, and future skills.", "/academics/primary/"]],
    zh: [["MEP 课程", "真实语境英语与泰国课程基础。", "/academics/mep/"], ["幼儿预备班", "通过游戏温和开启学习。", "/academics/pre-kindergarten/"], ["幼儿园", "探索、创造与沟通。", "/academics/kindergarten/"], ["小学", "学术、语言与未来技能。", "/academics/primary/"]]
  };
  return `<section class="section"><div class="section-heading"><p class="eyebrow">Academics</p><h2>${locale === "th" ? "เลือกดูหลักสูตรตามช่วงวัย" : locale === "en" ? "Explore by Program" : "按学段了解课程"}</h2></div><div class="card-grid">${copy[locale].map(([title, body, href]) => `<a class="info-card link-card" href="${localizedPath(href, locale)}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><span>→</span></a>`).join("")}</div></section>`;
}

function admissions(locale) {
  const steps = locale === "th" ? ["ส่งข้อมูล", "นัดเยี่ยมชม", "ประเมินความพร้อม", "ยืนยันสิทธิ์"] : locale === "en" ? ["Inquiry", "School Tour", "Readiness Review", "Confirm"] : ["提交咨询", "预约参观", "入学评估", "确认入学"];
  return `<section class="section"><div class="section-heading"><p class="eyebrow">Admissions</p><h2>${locale === "th" ? "สมัครง่ายใน 4 ขั้นตอน" : locale === "en" ? "Apply in Four Steps" : "四步完成申请"}</h2></div><div class="steps">${steps.map((s, i) => `<div><strong>${i + 1}</strong><span>${escapeHtml(s)}</span></div>`).join("")}</div></section>${formSection(locale, "admissions-inquiry")}`;
}

function fees(locale) {
  const heads = locale === "th" ? ["ระดับชั้น", "ค่าธรรมเนียม", "หมายเหตุ"] : locale === "en" ? ["Level", "Fee", "Notes"] : ["年级", "费用", "备注"];
  const rows = locale === "th" ? ["เตรียมอนุบาล", "อนุบาล", "ประถมศึกษา"] : locale === "en" ? ["Pre-Kindergarten", "Kindergarten", "Primary"] : ["幼儿预备班", "幼儿园", "小学"];
  return `<section class="section"><div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td>${r}</td><td>${locale === "th" ? "รออัปเดตจากฝ่ายทะเบียน" : "To be updated by admissions"}</td><td>${locale === "th" ? "โปรดติดต่อโรงเรียนเพื่อข้อมูลล่าสุด" : "Please contact the school for the latest information."}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function faq(locale) {
  const items = {
    th: [["เปิดรับสมัครระดับใดบ้าง?", "เตรียมอนุบาล อนุบาล และประถมศึกษา โดยจำนวนที่นั่งขึ้นอยู่กับปีการศึกษา"], ["ต้องนัดเยี่ยมชมก่อนสมัครหรือไม่?", "แนะนำให้นัดเยี่ยมชมเพื่อให้ครอบครัวเห็นห้องเรียน สภาพแวดล้อม และพูดคุยกับทีมโรงเรียน"], ["มีหลักสูตรสองภาษาหรือไม่?", "มี MEP Program ที่ออกแบบให้เด็กใช้ภาษาอังกฤษในกิจกรรมและบริบทจริง"]],
    en: [["Which levels are open?", "Pre-Kindergarten, Kindergarten, and Primary, depending on seat availability."], ["Should we book a tour first?", "A tour is recommended so families can see the classrooms and meet the team."], ["Is there a bilingual program?", "Yes. The MEP Program helps children use English in meaningful contexts."]],
    zh: [["开放哪些年级？", "幼儿预备班、幼儿园与小学，名额视学年而定。"], ["申请前需要参观吗？", "建议预约参观，以了解教室、环境并与学校团队交流。"], ["是否有双语课程？", "有。MEP 课程帮助孩子在真实语境中使用英语。"]]
  };
  return `<section class="section faq-list">${items[locale].map(([q, a], i) => `<article class="faq-item${i === 0 ? " is-open" : ""}" data-faq-item><button data-faq-trigger aria-expanded="${i === 0 ? "true" : "false"}">${escapeHtml(q)}<span>+</span></button><p data-faq-panel${i === 0 ? "" : " hidden"}>${escapeHtml(a)}</p></article>`).join("")}</section>`;
}

function news(locale) {
  const items = {
    th: [["เตรียมพื้นที่ข่าวเปิดภาคเรียน", "ข่าวสาร", "ใช้สำหรับสรุปกิจกรรมต้อนรับนักเรียนและผู้ปกครอง"], ["กิจกรรมภาษาอังกฤษประจำเดือน", "กิจกรรม", "พื้นที่สำหรับเล่ากิจกรรม MEP และภาพบรรยากาศ"], ["บทความเลือกโรงเรียนสองภาษา", "บทความ", "คอนเทนต์ SEO สำหรับผู้ปกครองในระยอง"]],
    en: [["New Term Updates", "News", "A place for welcome activities and family updates."], ["Monthly English Activities", "Events", "Stories from the MEP classroom."], ["Choosing a Bilingual School", "Article", "SEO content for families in Rayong."]],
    zh: [["新学期动态", "新闻", "发布迎新活动与家庭信息。"], ["每月英语活动", "活动", "展示 MEP 课堂故事。"], ["如何选择双语学校", "文章", "面向罗勇家庭的 SEO 内容。"]]
  };
  return `<section class="section"><div class="news-grid">${items[locale].map(([title, tag, body]) => `<article class="news-card"><span>${escapeHtml(tag)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><a href="${localizedPath("/news/", locale)}">${locales[locale].readMore}</a></article>`).join("")}</div></section>`;
}

function parents(locale) {
  return `<section class="section split">
    <div><p class="eyebrow">SV Portal</p><h2>${locale === "th" ? "ทุกข้อมูลสำคัญในที่เดียว" : locale === "en" ? "Everything Important in One Place" : "重要信息集中一处"}</h2><p>${locale === "th" ? "ใช้สำหรับประกาศ เอกสาร ปฏิทินกิจกรรม และทางเข้า SV Portal ระบบภายในของโรงเรียน" : locale === "en" ? "Notices, downloads, activity calendar, and a direct link to the school SV Portal." : "用于公告、下载、活动日历以及进入学校 SV Portal。"}</p>${button(locales[locale].portal, portalUrl, "primary")}</div>
    <div class="mini-calendar"><strong>July 2026</strong><span>Parent Orientation</span><span>English Activity Day</span><span>Portfolio Review</span></div>
  </section>`;
}

function life(locale) {
  const cards = locale === "th" ? [["A Day at SV", "เช้าอบอุ่น ห้องเรียนมีส่วนร่วม กิจกรรมหลังเลิกเรียน"], ["ชมรมและกิจกรรม", "ภาษา ศิลปะ กีฬา วิทยาศาสตร์ และกิจกรรมชุมชน"], ["แกลเลอรี", "พื้นที่สำหรับภาพถ่ายจริงและวิดีโอสั้นใน Phase 2"]] : locale === "en" ? [["A Day at SV", "Warm mornings, active classrooms, and after-school activities."], ["Clubs", "Languages, arts, sports, science, and community."], ["Gallery", "A future home for real photos and short videos."]] : [["SV 的一天", "温暖早晨、主动课堂与课后活动。"], ["社团活动", "语言、艺术、体育、科学与社区活动。"], ["图库", "未来展示真实照片与短视频。"]];
  return `<section class="section"><div class="card-grid">${cards.map(([title, body]) => `<article class="info-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join("")}</div></section>`;
}

function formSection(locale, name = "contact") {
  const l = locales[locale];
  return `<section class="section form-section"><div><p class="eyebrow">${locale === "th" ? "ส่งข้อความ" : locale === "en" ? "Send Inquiry" : "发送咨询"}</p><h2>${locale === "th" ? "ให้ทีมโรงเรียนติดต่อกลับ" : locale === "en" ? "Let the School Team Follow Up" : "让学校团队联系您"}</h2></div><form name="${name}" method="POST" data-netlify="true" action="${localizedPath('/success/', locale)}" netlify>
    <input type="hidden" name="form-name" value="${name}">
    <label>${l.formName}<input name="name" required autocomplete="name"></label>
    <label>${l.formPhone}<input name="phone" required autocomplete="tel"></label>
    <label>${l.formEmail}<input name="email" type="email" autocomplete="email"></label>
    <label>${l.formLevel}<select name="level"><option>Pre-Kindergarten</option><option>Kindergarten</option><option>Primary</option></select></label>
    <label class="full">${l.formMessage}<textarea name="message" rows="4"></textarea></label>
    <button class="button primary" type="submit">${l.submit}</button>
  </form></section>`;
}

function contact(locale) {
  return `<section class="section contact-grid">
    <div class="contact-card"><h2>${locale === "th" ? "ข้อมูลติดต่อ" : locale === "en" ? "Contact Information" : "联系方式"}</h2><p>Somkidvittaya School<br>${escapeHtml(siteSettings.address).replace(/\n/g, "<br>")}<br>Tel: ${escapeHtml(siteSettings.phone)}<br>Email: ${escapeHtml(siteSettings.email)}</p><div class="hero-actions">${button(locales[locale].ctaTour, "#contact-form", "primary")}${button(locale === "th" ? "โทรหาเรา" : locale === "en" ? "Call Us" : "致电", `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`, "secondary")}</div></div>
    <iframe title="Map to Somkidvittaya School Rayong" loading="lazy" src="https://www.google.com/maps?q=Somkid%20Vittaya%20School%20Rayong&output=embed"></iframe>
  </section><div id="contact-form">${formSection(locale, "contact")}</div>`;
}

function homeSections(locale) {
  return `${stats(locale)}${quickLinks(locale)}${programCards(locale)}${textSections(pages[0], locale)}${news(locale)}${formSection(locale, "quick-inquiry")}`;
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
  if (page.type === "home") return homeSections(locale);
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
  const org = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "Somkidvittaya School",
    alternateName: "โรงเรียนสมคิดวิทยา",
    url: pageUrl("/", locale),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rayong",
      addressCountry: "TH",
      streetAddress: siteSettings.address
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
<body>
  ${header(page, locale)}
  <main id="main">
    ${hero(page, locale)}
    ${bodyContent(page, locale)}
    <section class="closing-cta">
      <p class="eyebrow">Somkidvittaya School</p>
      <h2>${locale === "th" ? "พร้อมเริ่มต้นเส้นทางใหม่กับ SV?" : locale === "en" ? "Ready to Begin with SV?" : "准备加入 SV 吗？"}</h2>
      <div class="hero-actions">${button(locales[locale].ctaTour, localizedPath("/contact/", locale), "secondary")}${button(locales[locale].ctaApply, localizedPath("/admissions/apply/", locale), "primary")}</div>
    </section>
  </main>
  ${footer(locale)}
  <script src="/main.js" defer></script>
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

copyAsset("src/styles.css", "styles.css");
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
