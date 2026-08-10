import json

# TH
with open("content/pages/th-about.yml", "r", encoding="utf-8") as f:
    th = json.load(f)
th["title"] = "สถาบันแห่งคุณค่า สรรค์สร้างปัญญาเหนือกาลเวลา"
th["eyebrow"] = "เกี่ยวกับเรา"
th["summary"] = "โรงเรียนสมคิดวิทยา มุ่งมั่นสร้างรากฐานที่มั่นคง เพื่ออนาคตที่ไร้ขีดจำกัดของเยาวชนทุกคน"
th["intro"] = "โรงเรียนสมคิดวิทยา มิได้เป็นเพียงสถานศึกษา หากแต่เป็น “สถาบันแห่งคุณค่าและกาลเวลา” ที่ถือกำเนิดขึ้นจากหัวใจแห่งความเมตตาและวิสัยทัศน์อันลึกซึ้ง ตลอดระยะเวลากว่าหกทศวรรษ เราได้หล่อหลอมเยาวชนผ่านการผสานรากฐานทางวัฒนธรรมอันงดงาม เข้ากับนวัตกรรมการเรียนรู้แห่งอนาคต"
with open("content/pages/th-about.yml", "w", encoding="utf-8") as f:
    json.dump(th, f, ensure_ascii=False, indent=2)

# EN
with open("content/pages/en-about.yml", "r", encoding="utf-8") as f:
    en = json.load(f)
en["title"] = "An Institution of Value, Cultivating Timeless Wisdom"
en["eyebrow"] = "About Us"
en["summary"] = "Somkidvittaya School is dedicated to building a stable foundation for the limitless future of every youth."
en["intro"] = "Somkidvittaya School is more than just an educational institution; it is an “Institution of Value and Time” born from a heart of compassion and profound vision. Over the course of more than six decades, we have nurtured youth by seamlessly blending our beautiful cultural foundations with the educational innovations of the future."
with open("content/pages/en-about.yml", "w", encoding="utf-8") as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

# ZH
with open("content/pages/zh-about.yml", "r", encoding="utf-8") as f:
    zh = json.load(f)
zh["title"] = "价值之殿堂，培育永恒智慧"
zh["eyebrow"] = "关于我们"
zh["summary"] = "Somkidvittaya 学校致力于为每位青年的无限未来奠定稳固的基础。"
zh["intro"] = "Somkidvittaya 学校不仅是一所教育机构；它更是一所诞生于慈悲之心与深远愿景的“价值与时间之殿堂”。在六十多年的岁月中，我们将优美的文化底蕴与未来的教育创新完美融合，致力于培养杰出的青年一代。"
with open("content/pages/zh-about.yml", "w", encoding="utf-8") as f:
    json.dump(zh, f, ensure_ascii=False, indent=2)

