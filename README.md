# YourNextTrip

Yapay zekâ destekli seyahat planlayıcı. Kullanıcı nereden nereye gideceğini, kaç gün kalacağını, bütçesini ve ilgi alanlarını giriyor; uygulama Groq üzerinde çalışan Llama 3.3 70B modeliyle güne bölünmüş bir gezi planı üretiyor, hedef şehrin güncel hava durumunu gösteriyor ve planı PDF olarak indirilebilir hale getiriyor.

Web uygulaması React + Vite ile yazıldı; aynı kod tabanı Capacitor ile iOS ve Android uygulamasına dönüştürülüyor.

Canlı: https://travel-planner-ai-henna.vercel.app

## Özellikler

- **AI gezi planı** — Kalkış/varış şehri, gün sayısı, bütçe, seyahat tarzı ve ilgi alanlarına göre günlük program üretir
- **5 dil desteği** — İngilizce, Türkçe, İspanyolca, Fransızca, Almanca. Arayüz ve üretilen plan seçilen dile göre çevrilir
- **Hava durumu** — Varış şehrinin anlık sıcaklık, nem, rüzgâr ve hava durumu bilgisi (Open-Meteo)
- **Şehir bilgisi** — Popüler rotalar için AI ile üretilen kısa destinasyon tanıtımı
- **Üyelik** — E-posta/şifre ile kayıt ve giriş (Supabase Auth)
- **Gezilerim** — Oluşturulan planlar hesaba kaydedilir, sonradan görüntülenip silinebilir
- **PDF dışa aktarma** — Plan tek tıkla PDF olarak indirilir
- **Mobil uygulama** — Capacitor ile iOS ve Android derlemesi

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19, Vite 8 |
| Yapay zekâ | Groq API — `llama-3.3-70b-versatile` |
| Sunucu | Vercel Serverless Functions (`/api`) |
| Veritabanı & kimlik doğrulama | Supabase |
| Hava durumu | Open-Meteo API (anahtar gerektirmez) |
| PDF | jsPDF |
| Mobil | Capacitor 8 (iOS + Android) |

## Proje Yapısı

```
api/                       Vercel serverless fonksiyonları (Groq anahtarı burada, istemciye sızmaz)
  generate-itinerary.js    Gezi planı üretir
  translate.js             Üretilen planı başka bir dile çevirir
  destination-info.js      Şehir hakkında kısa bilgi üretir
src/
  components/              Arayüz bileşenleri (Hero, SearchForm, AIPlanDisplay, MyTrips, ...)
  context/                 Auth, dil ve bildirim context'leri
  services/                Groq, Supabase ve hava durumu servis çağrıları
  utils/pdfExport.js       Planı PDF'e dönüştürür
  translations.js          5 dilin arayüz metinleri
ios/ , android/            Capacitor tarafından üretilen native projeler
```

## Kurulum

Gereksinim: Node.js 18+

```bash
git clone https://github.com/ayselinaydogdu/travel-planner-ai.git
cd travel-planner-ai
npm install
```

Proje kök dizininde bir `.env` dosyası oluştur:

```
VITE_SUPABASE_URL=https://<proje-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

> `/api` altındaki fonksiyonlar Vercel üzerinde çalışır. Yerelde AI özelliklerini denemek için `vercel dev` kullanmak ve ortama `GROQ_API_KEY` eklemek gerekir.

### Ortam Değişkenleri

| Değişken | Nerede | Açıklama |
|---|---|---|
| `VITE_SUPABASE_URL` | İstemci (build'e gömülür) | Supabase proje URL'i |
| `VITE_SUPABASE_ANON_KEY` | İstemci (build'e gömülür) | Supabase anonim anahtarı |
| `GROQ_API_KEY` | Yalnızca sunucu | Groq API anahtarı. Sadece Vercel ortam değişkeni olarak tanımlanır, istemci koduna hiçbir zaman girmez |

### Supabase

Kayıtlı geziler için `trips` adında bir tablo gerekir. Kullanılan sütunlar:

`user_id`, `from_city`, `to_city`, `days`, `budget`, `travel_style`, `interest`, `language`, `plan`

Satırların yalnızca sahibi tarafından okunup silinebilmesi için tabloda RLS (Row Level Security) etkinleştirilmelidir.

## API Uç Noktaları

Hepsi `POST` ile çalışır ve JSON döner.

| Uç nokta | Girdi | Çıktı |
|---|---|---|
| `/api/generate-itinerary` | `{ trip }` | `{ plan }` — günlük gezi programı |
| `/api/translate` | `{ plan, language }` | Çevrilmiş plan |
| `/api/destination-info` | `{ city, language }` | Şehir hakkında kısa bilgi |

Üretilen planlarda zaman zaman görülen dil karışması (CJK/Arapça karakter sızması) sunucu tarafında tespit edilir, istek yeniden denenir ve gerekirse bu karakterler temizlenerek kullanıcıya ulaşması engellenir.

## Mobil Uygulama

Web ve mobil aynı kod tabanını paylaşır. Web'de API çağrıları göreli (`/api`) yapılır; native uygulamada aynı origin bulunmadığı için tam Vercel adresine gider — bu adres [`src/services/groqService.js`](src/services/groqService.js) içinde tanımlıdır ve deploy adresi değişirse güncellenmelidir.

```bash
npm run ios        # build + sync + Xcode'da aç
npm run android    # build + sync + Android Studio'da aç
npm run cap:sync   # sadece build + sync
```

## Deploy

Vercel'e GitHub reposu import edilerek deploy edilir. Ayarlar otomatik algılanır (Vite → `npm run build` → `dist`), ek yapılandırma dosyası gerekmez.

Deploy'dan **önce** üç ortam değişkeninin (`GROQ_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) tanımlanmış olması gerekir; `VITE_` ile başlayanlar build sırasında koda gömüldüğü için sonradan eklenirse yeniden deploy şarttır.
