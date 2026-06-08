# Panel — Tutor Yönetimi

Uygulama panelinden eğitmen eklemek/güncellemek için `lingola_apis` `/panel` endpoint'leri.

## Kurulum

1. `.env` dosyasına güçlü bir anahtar ekle:
   ```
   PANEL_API_KEY=your-secret-key
   ```

2. Çeviri tablosunu oluştur:
   ```bash
   npm run migrate:tutor-translations
   ```

3. **12 dil çevirisini yükle** (mevcut tutorlar için):
   ```bash
   npm run backfill:tutor-translations-all
   ```
   Bu komut `data/tutor_locale_packs.json` üretir ve `tutor_translations` tablosuna yazar. `tutors` tablosundaki varsayılan metinleri de İngilizce yapar.

4. API'yi yeniden başlat.

## Kimlik doğrulama

Tüm `/panel/*` isteklerinde header:

```
X-Panel-Api-Key: <PANEL_API_KEY>
```

## Desteklenen diller

`en`, `de`, `it`, `fr`, `tr`, `ja`, `es`, `ru`, `ko`, `hi`, `pt`, `zh`

Mobil uygulama `GET /tutors` çağrısında `X-UI-Language: tr` gönderir; API o dildeki `displayName`, `description`, `tagline` döner.

## CDN dosya yapısı

```
Buddies/{Name}/c_{id}.png
Buddies/{Name}/c_{id}.riv
```

Örnek: `Buddies/Aria/c_aria.png`

Panel foto/riv yüklerse Bunny'ye bu path'e yazar.

---

## Endpoint'ler

### `GET /panel/tutors`

Tüm eğitmenler (pasif dahil) + çeviriler.

### `GET /panel/tutors/:id`

Tek eğitmen detayı.

### `POST /panel/tutors`

Yeni eğitmen oluştur.

**Body örneği (Aria):**

```json
{
  "id": "aria",
  "name": "Aria",
  "gender": "female",
  "voiceId": "jqcCZkN6Knx8BJ5TBdYR",
  "nativeLang": "en",
  "sortOrder": 9,
  "description": "Warm daily conversation partner.",
  "tagline": "Daily chat",
  "translations": {
    "tr": {
      "displayName": "Aria",
      "description": "Günlük sohbetlerde kendini rahat ifade etmen için sıcak bir pratik ortamı sunar.",
      "tagline": "Günlük sohbet"
    },
    "en": {
      "displayName": "Aria",
      "description": "A warm partner for everyday English small talk.",
      "tagline": "Daily chat"
    }
  }
}
```

`photoUrl` / `rivUrl` gönderilmezse otomatik üretilir:
`https://lingolabuddy.b-cdn.net/Buddies/Aria/c_aria.png`

### `PUT /panel/tutors/:id`

Meta veya çevirileri güncelle. Sadece gönderilen alanlar değişir.

### `DELETE /panel/tutors/:id`

Soft delete — `is_active = 0`. Uygulamada listelenmez.

### `POST /panel/tutors/:id/photo`

`multipart/form-data`, alan adı: `photo` (png/jpg/webp)

### `POST /panel/tutors/:id/riv`

`multipart/form-data`, alan adı: `riv` (.riv)

---

## 6 yeni karakter — hızlı ekleme

Sırayla `POST /panel/tutors` ile:

| id | name | gender | voiceId | sortOrder |
|----|------|--------|---------|-----------|
| aria | Aria | female | jqcCZkN6Knx8BJ5TBdYR | 9 |
| brian | Brian | male | mtrellq69YZsNwzUSyXh | 10 |
| elara | Elara | female | FFmp1h1BMl0iVHA0JxrI | 11 |
| lyra | Lyra | female | UTPot3MZG8clNCH22nuw | 12 |
| max | Max | male | g4ucswVjPpazgbDDe327 | 13 |
| mira | Mira | female | 9w21nMuk8CWXIME31V1S | 14 |

Ardından her biri için `photo` ve `riv` yükle (veya Bunny'ye manuel koy).

---

## Mobil uygulama davranışı

- `GET /tutors` — locale'e göre lokalize isim/bio döner
- Yeni tutor panelden eklenince uygulama yeniden açıldığında veya dil değişince otomatik gelir
- Eski `assets/translations` `tudor.{id}` anahtarları yedek olarak kalır
