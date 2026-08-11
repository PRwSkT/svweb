function directorQuote(locale) {
  const q = {
    th: ["ทุกความตั้งใจของเราในวันนี้ คือการสร้างสรรค์พื้นที่แห่งอนาคตที่ดีที่สุดให้กับลูกหลานของเรา เพราะความสำเร็จที่ยิ่งใหญ่ที่สุดของโรงเรียนสมคิดวิทยา คือการได้เห็นเด็ก ๆ เติบโตอย่างงดงามและมีความสุขในทุก ๆ วัน", "นาย ณัฐวัฒน์ สงเคราะห์ธรรม", "ผู้อำนวยการโรงเรียนสมคิดวิทยา", "อ่านสาส์นฉบับเต็ม"],
    en: ["Our dedication today is to create the best future space for our children. The greatest success of Somkidvittaya School is seeing our students grow beautifully and happily every day.", "Mr. Natthawat Songkrotham", "School Director", "Read Full Message"],
    zh: ["我们今天的奉献是为了给孩子们创造最好的未来空间。Somkidvittaya学校最大的成功就是看到我们的学生每天都在美丽和快乐中成长。", "Natthawat Songkrotham 先生", "校长", "阅读全文"]
  }[locale] || {};
  if (!q[0]) return "";
  return `<section class="director-quote-section" data-animate="fade-up" style="background: var(--sv-paper); padding: 4rem 0;">
    <div class="director-quote-container">
      <div class="director-image-wrapper">
        <img src="/assets/images/director.png" alt="Director" class="director-img">
        <div class="director-gradient-fade"></div>
      </div>
      <div class="director-quote-content">
        <svg class="quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <blockquote class="director-quote-text">“${q[0]}”</blockquote>
        <div class="director-quote-author">
          <strong>${q[1]}</strong>
          <span>${q[2]}</span>
        </div>
        <a href="${localizedPath('/director/', locale)}" class="btn primary-btn">${q[3]} &rarr;</a>
      </div>
    </div>
  </section>`;
}

function homeVideoSection(locale) {
  const d = {
    th: { eyebrow: "วีดีโอแนะนำ", title: "ทำความรู้จักกับเรา", desc: "รับชมบรรยากาศและการเรียนการสอนที่สมคิดวิทยาผ่านวีดีโอแนะนำโรงเรียน" },
    en: { eyebrow: "School Introduction", title: "Get to Know Us", desc: "Experience the atmosphere and academics at Somkidvittaya School." },
    zh: { eyebrow: "学校介绍", title: "了解我们", desc: "通过视频了解Somkidvittaya的氛围和教学。" }
  }[locale];
  return `<section class="section" data-animate="fade-up" style="background: var(--white); padding: 4rem 2rem;">
  <div class="contact-grid" style="align-items: center;">
    <div class="text-content">
      <p class="eyebrow">${d.eyebrow}</p>
      <h2>${d.title}</h2>
      <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem;">${d.desc}</p>
    </div>
    <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative; padding-bottom: 56.25%; height: 0;" data-animate="fade-up" class="video-container">
      <iframe src="https://www.youtube.com/embed/HBVkXyl8GVw?si=TE8888H4bXtYiacA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
    </div>
  </div>
</section>`;
}

function parentVoices(locale) {
  const d = {
    th: { eyebrow: "เสียงจากผู้ปกครอง", quote: "เห็นความเปลี่ยนแปลงของลูกชัดเจนมากตั้งแต่ย้ายมาเรียนที่สมคิดวิทยา ลูกกลับบ้านมาเล่าเรื่องโรงเรียนด้วยความสนุกสนาน กล้าสื่อสารภาษาอังกฤษมากขึ้น และมีความสุขกับการไปโรงเรียนทุกวัน เป็นการตัดสินใจที่คุ้มค่าที่สุดสำหรับอนาคตของลูกค่ะ", name: "คุณแม่น้องวิน (นักเรียนชั้น ป.2)" },
    en: { eyebrow: "Parent Voices", quote: "We've seen clear changes since moving to Somkidvittaya. Our child comes home excited, communicates more confidently in English, and loves going to school. It’s the best decision for their future.", name: "Win's Mother (Grade 2)" },
    zh: { eyebrow: "家长心声", quote: "自从转到这里，我们看到了明显的变化。孩子回家后总是兴奋地讲述学校的事情，更敢于用英语交流。这是我们做出的最好决定。", name: "Win 的妈妈 (二年级)" }
  }[locale];
  return `<section class="director-quote-section" data-animate="fade-up" style="background: var(--sv-stone); padding: 4rem 0;">
    <div class="director-quote-container reversed">
      <div class="director-image-wrapper">
        <img src="/assets/images/real-3.jpg" alt="${d.eyebrow}" class="director-img" style="border-radius: 50%; max-width: 280px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); object-fit: cover; aspect-ratio: 1/1;">
      </div>
      <div class="director-quote-content">
        <p class="eyebrow">${d.eyebrow}</p>
        <svg class="quote-icon" style="color: var(--sv-gold); margin-top: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <blockquote class="director-quote-text" style="font-size: 1.4rem;">“${d.quote}”</blockquote>
        <div class="director-quote-author">
          <strong>${d.name}</strong>
        </div>
      </div>
    </div>
  </section>`;
}
