function whySV(locale) {
  const content = {
    th: {
      eyebrow: "จุดเด่นของ SV",
      title: "บ่มเพาะพลเมืองโลก ตั้งแต่ก้าวแรก",
      pillars: [
        { icon: "message-circle", title: "สภาพแวดล้อม 2 ภาษา", body: "พัฒนาทักษะภาษาอังกฤษอย่างเป็นธรรมชาติผ่านการใช้งานจริงในชีวิตประจำวัน สร้างความมั่นใจในการสื่อสาร" },
        { icon: "users", title: "เรียนรู้ผ่านการลงมือทำ (PBL)", body: "ห้องเรียนแบบ Active Learning ที่เน้นให้เด็กคิดวิเคราะห์และแก้ปัญหาผ่านโครงงานที่ประยุกต์ใช้ได้ในโลกจริง" },
        { icon: "pie-chart", title: "ดูแลใส่ใจรายบุคคลด้วยข้อมูล", body: "เราใช้ข้อมูลเพื่อติดตามและสนับสนุนพัฒนาการของนักเรียนแต่ละคนอย่างใกล้ชิดและตรงจุดตามศักยภาพ" },
        { icon: "trending-up", title: "เส้นทางการเรียนรู้ที่ต่อเนื่อง", body: "เตรียมความพร้อมอย่างมั่นคงตั้งแต่ระดับเตรียมอนุบาลจนจบประถมศึกษา สู่ทักษะแห่งอนาคตอย่างไร้รอยต่อ" }
      ]
    },
    en: {
      eyebrow: "Why SV",
      title: "Nurturing Global Citizens from Day One",
      pillars: [
        { icon: "message-circle", title: "Natural Bilinguals Environment", body: "Develop English proficiency organically through real-world daily interactions for confident communication." },
        { icon: "users", title: "Project-Based Learning", body: "Active classrooms focused on critical thinking and problem-solving through hands-on, real-world projects." },
        { icon: "pie-chart", title: "Data-Informed Care", body: "We use data to closely monitor and support each student's unique development precisely and effectively." },
        { icon: "trending-up", title: "Seamless Academic Pathways", body: "A secure and connected foundation from Pre-K through Primary, preparing students for future skills." }
      ]
    },
    zh: {
      eyebrow: "SV 的优势",
      title: "从第一步起培养世界公民",
      pillars: [
        { icon: "message-circle", title: "自然的双语环境", body: "通过日常生活中的实际运用自然地发展英语技能，实现自信交流。" },
        { icon: "users", title: "项目式学习 (PBL)", body: "活跃的课堂重点是通过能应用于现实世界的动手项目培养批判性思维。" },
        { icon: "pie-chart", title: "基于数据的个性化关怀", body: "我们使用数据密切跟踪并精确支持每位学生独特的发展轨迹。" },
        { icon: "trending-up", title: "无缝衔接的学习路径", body: "从学前班到小学阶段的坚实基础，为学生掌握未来技能做好全面准备。" }
      ]
    }
  };

  const data = content[locale] || content.th;
  
  return `<section class="section why-sv-section" data-animate="fade-up" style="background: var(--white); position: relative; overflow: hidden; padding-top: 6rem; padding-bottom: 6rem;">
    <!-- Abstract background shapes -->
    <div style="position: absolute; top: -150px; left: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,29,50,0.03) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; pointer-events: none;"></div>
    <div style="position: absolute; bottom: -100px; right: -50px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(9,27,48,0.03) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; pointer-events: none;"></div>
    
    <div class="section-heading" style="text-align: center; max-width: 800px; margin: 0 auto 60px auto;">
      <p class="eyebrow">${data.eyebrow}</p>
      <h2 style="font-size: 2.5rem; margin-top: 12px;">${data.title}</h2>
    </div>
    
    <div class="why-sv-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;">
      ${data.pillars.map((pillar, i) => `
        <div class="why-sv-card" style="background: var(--sv-paper); padding: 40px 32px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); border: 1px solid rgba(0,0,0,0.03); display: flex; flex-direction: column; align-items: flex-start; animation-delay: ${i * 0.1}s; cursor: default; height: 100%;">
          <div class="icon-wrapper" style="width: 56px; height: 56px; background: rgba(139, 29, 50, 0.08); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--sv-crimson); margin-bottom: 24px; transition: all 0.3s ease;">
            <i data-feather="${pillar.icon}" style="width: 28px; height: 28px; stroke-width: 2.5;"></i>
          </div>
          <h3 style="font-size: 1.3rem; color: var(--sv-deep); margin: 0 0 16px 0; font-weight: 700; line-height: 1.4;">${pillar.title}</h3>
          <p style="color: var(--muted); line-height: 1.7; margin: 0; font-size: 1.05rem;">${pillar.body}</p>
        </div>
      `).join('')}
    </div>
  </section>`;
}
