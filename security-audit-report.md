# รายงานตรวจสอบความปลอดภัยเว็บไซต์ Somkidvittaya

**วันที่ตรวจสอบ:** 16 สิงหาคม 2026
**ขอบเขต:** โค้ดทั้งหมดใน repository (src, tools, content, dist, config) รวมถึง dependencies, build pipeline, หน้า admin, ฟอร์ม, security headers และ git history
**วิธี:** Static code analysis + npm audit + ตรวจ config ด้วยมือ

---

## สรุปผลโดยรวม

เว็บไซต์เป็น **Static Site** (HTML/CSS/JS ล้วน ไม่มี server-side code) build ด้วย Node script ของตัวเอง และ deploy บน Netlify พื้นผิวการโจมตี (attack surface) จึงค่อนข้างเล็ก

| หมวด | ผลการตรวจ |
|---|---|
| Known vulnerabilities (CVE) ใน dependencies | ✅ ไม่พบ (npm audit = 0) |
| Zero-day / ช่องโหว่ร้ายแรงในโค้ดตัวเอง | ✅ ไม่พบช่องโหว่ระดับ critical |
| Secrets รั่วไหลใน repo / git history | ✅ ไม่พบ |
| ประเด็นความเสี่ยงที่ควรแก้ไข | ⚠️ พบ 4 ข้อหลัก + 5 ข้อย่อย |

> หมายเหตุเรื่อง "zero-day": ตามนิยาม zero-day คือช่องโหว่ที่ยังไม่มีใครรู้จัก/ไม่มี patch การอ่านโค้ดแบบ static ไม่สามารถรับประกันได้ 100% ว่าไม่มี แต่จากการตรวจทุกไฟล์โค้ด ไม่พบรูปแบบโค้ดที่เสี่ยง (ไม่มี eval, ไม่มี dynamic code execution, ไม่มี SQL/backend ให้โจมตี)

---

## ประเด็นที่ควรแก้ไข (เรียงตามความรุนแรง)

### 🔴 1. สคริปต์จาก CDN ไม่มี SRI และไม่ pin เวอร์ชัน (Supply Chain Risk) — ความเสี่ยงสูง

พบสคริปต์ภายนอก 3 ตัวที่โหลดโดยไม่มี Subresource Integrity (`integrity="sha384-..."`):

| สคริปต์ | ตำแหน่ง | ความเสี่ยง |
|---|---|---|
| `https://unpkg.com/decap-cms@^3.1.2/...` | หน้า `/admin/` | **สูงสุด** — ใช้ `^` range (เวอร์ชันลอยตัว) รันบนหน้าที่จับ token ของ Netlify Identity |
| `https://unpkg.com/feather-icons` | ทุกหน้าของเว็บ | ไม่ pin เวอร์ชันเลย รันทุกหน้า |
| `https://identity.netlify.com/v1/netlify-identity-widget.js` | ทุกหน้า | โดเมนทางการของ Netlify แต่ก็ไม่มี SRI |

**ผลกระทบ:** ถ้า unpkg.com ถูก compromise หรือแพ็กเกจถูกปล่อยเวอร์ชันอันตราย (เคยเกิดจริงในระบบ npm) สคริปต์แปลงปลวนจะรันบนเว็บทันที โดยเฉพาะหน้า admin ที่ขโมย session ผู้ดูแลได้

**วิธีแก้:** pin เวอร์ชันแน่นอน (เช่น `decap-cms@3.8.4`, `feather-icons@4.29.2`) และเพิ่ม `integrity` + `crossorigin="anonymous"` หรือดาวน์โหลดมา host เองใน `/assets/`

### 🟠 2. Content-Security-Policy อนุญาต `'unsafe-inline'` และขาด directive สำคัญ — ความเสี่ยงปานกลาง

ที่ `netlify.toml` บรรทัด 12:

- `script-src 'self' 'unsafe-inline' ...` — การมี `'unsafe-inline'` ทำให้ CSP แทบกัน XSS ไม่ได้เลย (มี inline script ของ feather.replace() อยู่จริง ต้องย้ายไปไฟล์ภายนอกหรือใช้ nonce)
- ขาด `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors` (ปัจจุบันมี X-Frame-Options ชดเชย แต่ควรใส่ใน CSP ด้วย)
- `img-src 'self' data: https:` — อนุญาตรูปจากทุกโดเมน HTTPS กว้างเกินไป (เปิดช่อง tracking/pixel injection ถ้ามี XSS สำเร็จ)

### 🟠 3. Build script มีช่อง HTML/Attribute Injection จากเนื้อหา CMS — ความเสี่ยงปานกลาง

`tools/build-site.mjs` มี `escapeHtml()` ที่ใช้ครอบคลุมดีมาก แต่พบจุดที่ **ไม่ escape** ค่าจากไฟล์ YAML (ซึ่งแก้ไขได้ผ่าน Decap CMS):

| จุด | บรรทัด | ปัญหา |
|---|---|---|
| `button()` — `href="${href}"` | ~176 | href ไม่ escape → แทรก `"` หลุดจาก attribute ได้ |
| `<img src="/assets/images/${image ...}">` | ~466, ~500 | ชื่อไฟล์รูปจาก YAML ไม่ escape |
| `fees()` — `<th>${h}</th>`, `<td>${r}</td>` | ~484 | เนื้อหาตารางค่าเทอม render เป็น HTML ดิบ |

**ผลกระทบ:** คนที่มีสิทธิ์แก้ content ผ่าน CMS (หรือ commit เข้า repo) สามารถฝัง script ลงทุกหน้าของเว็บได้ (Stored XSS ผ่าน content pipeline) — แม้ต้องเป็นผู้มีสิทธิ์อยู่แล้ว แต่เป็นการเพิ่มสิทธิ์จาก "แก้เนื้อหา" เป็น "รันโค้ดบนเว็บ" ซึ่งไม่ควรเกิด

**วิธีแก้:** escape ทุกค่าที่มาจาก YAML รวมถึง URL (และ validate ว่า URL ขึ้นต้นด้วย `https://` หรือ `/` เท่านั้น เพื่อกัน `javascript:` URL)

### 🟡 4. ฟอร์มไม่มี CAPTCHA — ความเสี่ยงต่ำ-ปานกลาง

ฟอร์มทั้งหมด (`contact`, `quick-inquiry`, `admissions-inquiry`, `admissions-apply`) ใช้ Netlify Forms + honeypot (`bot-field`) ซึ่งดี แต่ไม่มี reCAPTCHA — เสี่ยงสแปม/ส่งขยะเข้าระบบฝ่ายทะเบียน
**วิธีแก้:** เพิ่ม `data-netlify-recaptcha="true"` (Netlify รองรับในตัว)

---

## ประเด็นย่อย / ข้อสังเกต

5. **iframe ไม่มี `sandbox`** — Google Maps และ YouTube embed ไม่มี attribute `sandbox` (ต่ำ — เป็น embed จาก Google แต่ best practice ควรจำกัดสิทธิ์)
6. **`escapeHtml` ไม่ escape single quote** — ปัจจุบันปลอดภัยเพราะ attribute ทั้งหมดใช้ double quote แต่เปราะต่อการแก้โค้ดในอนาคต (ต่ำ)
7. **Netlify Identity widget โหลดทุกหน้า** — จำเป็นสำหรับ flow เชิญผู้ใช้ admin แต่เพิ่ม attack surface; พิจารณาโหลดเฉพาะเมื่อมี `#invite_token` / `#confirmation_token` ใน URL (ต่ำ)
8. **ไฟล์ชั่วคราวค้างใน repo** — `test-map.html`, `temp_header.js`, `temp_check.txt`, `diff.txt`, `test-css.css`, `old_components.css`, `replace_terms*.py` ไม่ถูก publish (publish เฉพาะ `dist/`) จึงไม่ใช่ช่องโหว่ แต่ควรลบออก (info)
9. **Decap CMS ใช้ `git-gateway`** — การป้องกันหน้า admin ขึ้นกับการตั้งค่าฝั่ง Netlify (Identity: แนะนำตั้งเป็น **Invite only** + เปิด 2FA ให้ผู้ดูแลทุกคน) ตรวจจาก repo ไม่ได้ ต้องตรวจใน Netlify dashboard (info)

## จุดที่ทำได้ดี (ไม่ต้องแก้)

- ✅ `npm audit` ผ่าน — dependencies เพียง 2 ตัว (`js-yaml 5.2.3` เวอร์ชันทางการล่าสุด + `argparse`) ไม่มี CVE
- ✅ ไม่พบ secrets/password/API key ในไฟล์หรือ git history
- ✅ Security headers พื้นฐานครบ: HSTS (preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- ✅ เนื้อหาจาก CMS ส่วนใหญ่ผ่าน `escapeHtml` อย่างสม่ำเสมอ
- ✅ ลิงก์ `target="_blank"` ทุกจุดมี `rel="noopener noreferrer"`
- ✅ ฟอร์มมี honeypot, หน้า admin มี `noindex`, `.gitignore` ครอบ `node_modules`/`dist` แล้ว
- ✅ `main.js` สะอาด — ไม่มี eval/innerHTML กับข้อมูลภายนอก (innerHTML ที่ใช้เป็น SVG คงที่เท่านั้น)

## บั๊กที่พบระหว่างตรวจ (ไม่ใช่ช่องโหว่)

- วันที่ข่าวในหน้าแรก hardcode เป็น "Jul 15" ทุกรายการ (`build-site.mjs` ~509)
- ภาษาอังกฤษที่ `locales.en.address` รหัสไปรษณีย์เขียน "2100" (ควรเป็น 21000 — ตรวจซ้ำกับไฟล์จริง)

---

## ลำดับความสำคัญในการแก้ไข

1. pin เวอร์ชัน + เพิ่ม SRI ให้สคริปต์ CDN (โดยเฉพาะหน้า admin)
2. escape ค่า YAML ทุกจุดใน build script + validate URL
3. เข้ม CSP: เอา `'unsafe-inline'` ออกจาก script-src, เพิ่ม `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`
4. เพิ่ม reCAPTCHA ให้ฟอร์ม
5. ตรวจ Netlify Identity ว่าตั้ง Invite-only และเปิด 2FA
