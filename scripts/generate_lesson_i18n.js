#!/usr/bin/env node
/**
 * Merge `lessons` chapter into assets/translations/*.json
 * Usage: node scripts/generate_lesson_i18n.js
 */
const fs = require('fs');
const path = require('path');
const { ENGLISH_LESSONS } = require('../data/english_curriculum');

const assetsDir = path.join(__dirname, '../../assets/translations');

/** Turkish UI strings per lesson id */
const TR = {
  a1_01: { title: 'Merhaba ve Tanışma', subtitle: 'İlk temas' },
  a1_02: { title: 'Sayılar ve Saat', subtitle: 'Sayma ve saat' },
  a1_03: { title: 'Kafede', subtitle: 'İçecek siparişi' },
  a1_04: { title: 'Aile ve Arkadaşlar', subtitle: 'Tanıdıkların' },
  a1_05: { title: 'Şehirde', subtitle: 'Yol tarifi' },
  a1_06: { title: 'Alışveriş Temelleri', subtitle: 'Mağazada' },
  a1_07: { title: 'Günlük Rutin', subtitle: 'Günlük alışkanlıklar' },
  a1_08: { title: 'Hava ve Duygular', subtitle: 'Nasıl hissediyorsun' },
  a2_01: { title: 'Geçen Hafta Sonu', subtitle: 'Basit geçmiş' },
  a2_02: { title: 'Doktorda', subtitle: 'Sağlık ziyareti' },
  a2_03: { title: 'İş Görüşmesi Temelleri', subtitle: 'İlk mülakat' },
  a2_04: { title: 'Seyahat Planları', subtitle: 'Gezi planlama' },
  a2_05: { title: 'Hobiler ve İlgi Alanları', subtitle: 'Boş zaman' },
  a2_06: { title: 'Restoranda Yemek', subtitle: 'Dışarıda yemek' },
  a2_07: { title: 'Telefon ve Mesajlar', subtitle: 'Uzaktan iletişim' },
  a2_08: { title: 'Ev ve Ev İşleri', subtitle: 'Ev hayatı' },
  b1_01: { title: 'Görüş: Sosyal Medya', subtitle: 'Fikir belirtme' },
  b1_02: { title: 'İşte Sorun', subtitle: 'İş yeri sorunu' },
  b1_03: { title: 'Çevre', subtitle: 'Yeşil alışkanlıklar' },
  b1_04: { title: 'Kültür Şoku', subtitle: 'Yurtdışında yaşam' },
  b1_05: { title: 'Sağlık ve Fitness', subtitle: 'Sağlıklı yaşam' },
  b1_06: { title: 'Eğitim Seçenekleri', subtitle: 'Öğrenme yolu' },
  b1_07: { title: 'Hayattaki Teknoloji', subtitle: 'Teknoloji alışkanlıkları' },
  b1_08: { title: 'Film Anlatma', subtitle: 'Hikâye özeti' },
  b1_09: { title: 'Pazarlık', subtitle: 'Adil anlaşma' },
  b1_10: { title: 'Gelecek Hedefleri', subtitle: 'İleriye dönük planlar' },
  b2_01: { title: 'Tartışma: Uzaktan Çalışma', subtitle: 'Yapılandırılmış tartışma' },
  b2_02: { title: 'Haber Özeti', subtitle: 'Güncel konu' },
  b2_03: { title: 'Varsayımlar', subtitle: 'Ya olursa…' },
  b2_04: { title: 'Resmî E-posta Üslubu', subtitle: 'Profesyonel yazı' },
  b2_05: { title: 'Liderlik Tarzları', subtitle: 'İnsan yönetimi' },
  b2_06: { title: 'Ekonomik Trendler', subtitle: 'Büyük resim' },
  b2_07: { title: 'Sanat ve Yaratıcılık', subtitle: 'İfade dolu konuşma' },
  b2_08: { title: 'Günlük Hayatta Bilim', subtitle: 'Bilim konuşması' },
  b2_09: { title: 'Etik İkilem', subtitle: 'Ahlaki seçim' },
  b2_10: { title: 'Sunum Becerileri', subtitle: 'Mini konuşma' },
  c1_01: { title: 'Bağlamda Deyimler', subtitle: 'Doğal ifadeler' },
  c1_02: { title: 'Akademik Makale', subtitle: 'Argüman yapısı' },
  c1_03: { title: 'İğneleme ve İroni', subtitle: 'İnce ton' },
  c1_04: { title: 'Diplomatik Dil', subtitle: 'Yumuşatma' },
  c1_05: { title: 'Edebi Analiz', subtitle: 'Metin konuşması' },
  c1_06: { title: 'Politika Tartışması', subtitle: 'Kamu meseleleri' },
  c1_07: { title: 'Profesyonel Ağ Kurma', subtitle: 'Kariyer sohbeti' },
  c1_08: { title: 'Kültürlerarası İletişim', subtitle: 'Küresel ekipler' },
  c1_09: { title: 'Soyut Kavramlar', subtitle: 'Büyük fikirler' },
  c1_10: { title: 'Medya Okuryazarlığı', subtitle: 'Eleştirel izleme' },
  c1_11: { title: 'İleri Pazarlık', subtitle: 'Yüksek risk' },
  c1_12: { title: 'TED Tarzı Konuşma', subtitle: 'İkna edici konuşma' },
  c2_01: { title: 'Retorik ve İkna', subtitle: 'Usta argüman' },
  c2_02: { title: 'Hukuk Diline Giriş', subtitle: 'Resmî sözleşmeler' },
  c2_03: { title: 'Hiciv ve Mizah', subtitle: 'Komik nüans' },
  c2_04: { title: 'Felsefe Tartışması', subtitle: 'Derin sorular' },
  c2_05: { title: 'Bilimsel Makale', subtitle: 'Araştırma konuşması' },
  c2_06: { title: 'Anadil Seviyesine Yakın Akıcılık', subtitle: 'İnce ayar' },
  c2_07: { title: 'Edebiyatta Alt Metin', subtitle: 'Satır araları' },
  c2_08: { title: 'Küresel Ekonomi', subtitle: 'Makro konuşma' },
  c2_09: { title: 'İngilizceyle Mentorluk', subtitle: 'Başkasına öğretme' },
  c2_10: { title: 'Doğaçlama Konuşma', subtitle: 'Hazırlıksız' },
  c2_11: { title: 'Üslup Değiştirme', subtitle: 'Stil kontrolü' },
  c2_12: { title: 'Ustalık Tekrarı', subtitle: 'Serbest pratik' },
};

function buildEnLessons() {
  const lessons = {};
  for (const L of ENGLISH_LESSONS) {
    lessons[L.id] = { title: L.title, subtitle: L.subtitle };
  }
  return lessons;
}

function buildTrLessons() {
  const lessons = {};
  for (const L of ENGLISH_LESSONS) {
    const t = TR[L.id];
    lessons[L.id] = {
      title: t?.title ?? L.title,
      subtitle: t?.subtitle ?? L.subtitle,
    };
  }
  return lessons;
}

const enLessons = buildEnLessons();
const trLessons = buildTrLessons();

const locales = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.json'));

for (const file of locales) {
  const locale = file.replace('.json', '');
  const filePath = path.join(assetsDir, file);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  json.lessons = locale === 'tr' ? trLessons : enLessons;
  fs.writeFileSync(filePath, JSON.stringify(json, null, 4) + '\n', 'utf8');
  console.log(`[i18n] ${file} — ${Object.keys(json.lessons).length} lessons`);
}

console.log('[i18n] ✅ done');
