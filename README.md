# Somkid Vittaya School Website

เว็บไซต์โรงเรียนสมคิดวิทยาแบบ static-first สำหรับ deploy บน Netlify ตาม implementation plan ที่อนุมัติแล้ว

## Run locally

```bash
npm run assets
npm run build
python3 -m http.server 4173 --directory dist
```

เปิด `http://localhost:4173`

## Structure

- `content/pages/` - เนื้อหาหน้าเว็บ 3 ภาษา แก้ผ่าน Admin ได้
- `content/settings/` - เบอร์โทร อีเมล ที่อยู่ social links และ SV Portal
- `src/admin/` - Decap CMS สำหรับแก้เนื้อหาผ่าน `/admin/`
- `src/css/components.css` - design system, layout และ responsive UI
- `src/main.js` - menu, FAQ accordion, slideshow และ language helper
- `tools/build-site.mjs` - template, SEO, sitemap และ static build
- `tools/generate-assets.py` - สร้าง/อัปเดต asset พื้นฐาน เช่น favicon
- `dist/` - ไฟล์ build สำหรับ Netlify

## Before Launch Checklist

- เปลี่ยน/อัปเดตรูปจริงผ่าน `src/assets/images/` หรือหน้า `/admin/`
- ตรวจเบอร์โทร อีเมล ที่อยู่ social links และ URL ของ SV Portal ใน `content/settings/site.yml`
- ตั้งค่า Netlify Identity และ Git Gateway เพื่อเปิดใช้งาน `/admin/` บน production
- ตั้งค่า `SITE_URL` ตอน build หากโดเมนจริงไม่ใช่ `https://somkidvittaya.ac.th`
- เชื่อม Google Analytics 4 และ Google Search Console
- ตรวจคำแปล EN/ZH โดยผู้ตรวจภาษาก่อนเผยแพร่จริง
