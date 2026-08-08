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

- `tools/build-site.mjs` - ข้อมูล sitemap, เนื้อหา, SEO และ template
- `tools/generate-assets.py` - สร้างภาพ bitmap placeholder สำหรับใช้แทนภาพจริงชั่วคราว
- `src/styles.css` - design system และ responsive UI
- `src/main.js` - menu, FAQ accordion, language helper
- `dist/` - ไฟล์ build สำหรับ Netlify

## Before Launch Checklist

- เปลี่ยนภาพ placeholder ใน `dist/assets/images/` เป็นภาพโรงเรียนจริง
- ใส่เบอร์โทร อีเมล ที่อยู่ และ URL ของ SV Portal จริง
- ตั้งค่า `SITE_URL` ตอน build หากโดเมนจริงไม่ใช่ `https://somkidvittaya.ac.th`
- เชื่อม Google Analytics 4 และ Google Search Console
- ตรวจคำแปล EN/ZH โดยผู้ตรวจภาษาก่อนเผยแพร่จริง
