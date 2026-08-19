import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufsqavndpjphowuacxfi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc3Fhdm5kcGpwaG93dWFjeGZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTExMzg3OCwiZXhwIjoyMDk2Njg5ODc4fQ.ntNcIPdTwLRIy25nScwqPs6d_RuT28l11Ttqoo7r8NU'; // Service Role
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  await supabase.from('personnel').insert([
    {
      name_th: 'ดร. สมชาย ใจดี',
      name_en: 'Dr. Somchai Jaidee',
      position_th: 'ผู้อำนวยการโรงเรียน',
      position_en: 'School Director',
      category: 'executive',
      image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
      bio_th: 'มีความเชี่ยวชาญด้านการบริหารการศึกษา',
      bio_en: 'Expert in educational administration.',
      sort_order: 1
    },
    {
      name_th: 'ครูสมศรี เรียนเก่ง',
      name_en: 'Teacher Somsri Riankeng',
      position_th: 'ครูหัวหน้าสายชั้นประถมศึกษา',
      position_en: 'Head of Primary Level',
      category: 'teacher',
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      sort_order: 2
    },
    {
      name_th: 'ครูจอห์น สมิธ',
      name_en: 'Teacher John Smith',
      position_th: 'ครูสอนภาษาอังกฤษ',
      position_en: 'English Teacher',
      category: 'teacher',
      image_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80',
      sort_order: 3
    }
  ]);

  await supabase.from('news').insert([
    {
      title_th: 'ประกาศเปิดรับสมัครนักเรียนใหม่ ปีการศึกษา 2570',
      title_en: 'Admissions Open for Academic Year 2027',
      content_th: 'โรงเรียนสมคิดวิทยาเปิดรับสมัครนักเรียนใหม่ในระดับเตรียมอนุบาล ถึง ประถมศึกษาปีที่ 6 ตั้งแต่วันนี้เป็นต้นไป',
      content_en: 'Somkidvittaya School is now accepting applications for Pre-Kindergarten to Primary 6.',
      is_published: true,
      published_at: new Date().toISOString()
    }
  ]);

  const { data: album } = await supabase.from('albums').insert([
    {
      title_th: 'กิจกรรมวันวิทยาศาสตร์',
      title_en: 'Science Day Activities',
      description_th: 'ภาพบรรยากาศการจัดกิจกรรมวันวิทยาศาสตร์',
      event_date: '2026-08-15'
    }
  ]).select('*').single();

  if (album) {
    await supabase.from('album_photos').insert([
      { album_id: album.id, image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80' },
      { album_id: album.id, image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80' }
    ]);
  }

  console.log("Mock data seeded!");
}

seed();
