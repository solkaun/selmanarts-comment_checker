# Instagram Otomatik Yorum Moderatörü

Instagram post ve reels'larınızdaki kötü yorumları otomatik olarak tespit edip silen Node.js tabanlı moderasyon sistemi.

## 🎯 Özellikler

- ✅ Gerçek zamanlı yorum takibi (Webhook)
- ✅ Periyodik kontrol (Polling)
- ✅ Kötü kelime tespiti (Türkçe + İngilizce)
- ✅ Emoji ve sembol kontrolü
- ✅ Spam tespiti (tekrarlanan karakterler, büyük harf)
- ✅ Sentiment analizi
- ✅ Otomatik yorum silme
- ✅ Manuel kontrol endpoint'i

## 📋 Gereksinimler

- Node.js 18+
- Instagram Business/Creator hesabı
- Facebook Developer App
- Facebook Page bağlı Instagram hesabı

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd instagram-comment-moderator
npm install
```

### 2. Instagram API Kurulumu

#### A. Facebook App Oluşturun
1. https://developers.facebook.com/ adresine gidin
2. "My Apps" > "Create App" 
3. App Type: "Business" seçin
4. Uygulama adı verin

#### B. Instagram Graph API'yi Ekleyin
1. Dashboard > Add Product > Instagram
2. Basic Display + Instagram Graph API ekleyin

#### C. Access Token Alın
1. Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Uygulamanızı seçin
3. Permissions ekleyin:
   - `instagram_basic`
   - `instagram_manage_comments`
   - `pages_read_engagement`
   - `pages_manage_metadata`
4. "Generate Access Token" tıklayın
5. Token'ı kopyalayın (geçici token)

#### D. Long-Lived Token Alın
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

#### E. Instagram Business Account ID Bulun
```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"
# Sonra Instagram Business Account ID:
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_TOKEN"
```

### 3. .env Dosyası Oluşturun

`.env` dosyası oluşturup şu bilgileri girin:

```env
# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_id

# Webhook (Webhook modu için)
WEBHOOK_VERIFY_TOKEN=your_random_secure_token_12345
PORT=3000

# Media IDs (Post ve Reel ID'leri, virgülle ayırın)
MEDIA_IDS=1234567890_1234567890,9876543210_9876543210

# Mod: webhook veya polling
MODE=webhook

# Polling mod ayarları (MODE=polling ise)
POLLING_INTERVAL_MINUTES=2
```

### 4. Media ID'lerini Bulun

Post/Reel ID'lerini bulmak için:

```bash
# Tüm medyalarınızı listeleyin
curl -X GET "https://graph.facebook.com/v18.0/YOUR_INSTAGRAM_BUSINESS_ID/media?access_token=YOUR_TOKEN"
```

## 🎮 Kullanım

### Webhook Modu (Önerilen)

Gerçek zamanlı yorum moderasyonu için:

```bash
npm start
# veya
MODE=webhook npm start
```

#### Webhook Kurulumu

1. Sunucunuzu public URL ile erişilebilir yapın (ngrok, tuneller, vb):
```bash
# Örnek: ngrok kullanarak
ngrok http 3000
```

2. Facebook Developer Dashboard:
   - Products > Webhooks > Instagram
   - Callback URL: `https://your-public-url.com/webhook`
   - Verify Token: `.env` dosyasındaki `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `comments`

### Polling Modu

Belirli aralıklarla kontrol için:

```bash
MODE=polling POLLING_INTERVAL_MINUTES=5 npm start
```

### Development Mode

Otomatik yeniden başlatma ile:

```bash
npm run dev
```

## 🔧 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Manuel Medya Kontrolü
```bash
POST http://localhost:3000/check-media/:mediaId
```

Örnek:
```bash
curl -X POST http://localhost:3000/check-media/1234567890_1234567890
```

## ⚙️ Özelleştirme

### Kötü Kelime Listesi

`src/config.js` dosyasında `badWords` dizisini düzenleyin:

```javascript
export const badWords = [
  'aptal', 'salak', 'gerizekalı',
  // Kendi kelimelerinizi ekleyin
];
```

### Kötü Emoji/Semboller

```javascript
export const badSymbols = ['🤮', '💩', '🖕'];
```

### Moderasyon Kuralları

`src/comment-moderator.js` dosyasında `isBadComment()` metodunu özelleştirin:

- Spam tespiti eşikleri
- Sentiment analizi skorları
- Karakter tekrarı limitleri
- Büyük harf kullanım oranı

## 📊 Loglama

Sistem tüm işlemleri console'a loglar:

```
📨 Yeni yorum: 123456789
📝 İçerik: "Bu çok kötü"
🚫 Kötü yorum tespit edildi!
📋 Nedenler: Kötü kelimeler: kötü
✅ Yorum silindi: 123456789
```

## 🔒 Güvenlik

- Access token'ları `.env` dosyasında saklayın
- `.env` dosyasını git'e commit etmeyin
- Webhook verify token'ı güçlü yapın
- Rate limiting uygulayın (her istek arasında 1sn bekler)
- HTTPS kullanın (production için zorunlu)

## 🐛 Sorun Giderme

### "Invalid OAuth access token"
- Token'ınızın süresi dolmuş olabilir
- Long-lived token alın (60 gün)
- Token yenileme sürecini otomatikleştirin

### Webhook doğrulaması başarısız
- Verify token'ın doğru olduğundan emin olun
- URL'in publicly erişilebilir olduğunu kontrol edin
- SSL sertifikası geçerli olmalı

### Yorumlar silinmiyor
- Gerekli izinleri kontrol edin (`instagram_manage_comments`)
- Business/Creator hesabı kullandığınızdan emin olun
- Sadece kendi hesabınızdaki yorumları silebilirsiniz

### Media ID bulunamıyor
- Instagram Business Account ID doğru mu?
- Media gerçekten Business hesabınıza ait mi?
- API version güncel mi? (v18.0)

## 📝 Notlar

- Instagram API rate limitleri vardır (200 calls/hour)
- Webhook'lar 20 saniye içinde yanıt bekler
- Long-lived token'lar 60 gün sonra expire olur
- Sadece kendi hesabınızdaki yorumları silebilirsiniz
- Personal hesaplar değil, Business/Creator hesabı gerekir

## 📚 Kaynaklar

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)
- [Comment Management](https://developers.facebook.com/docs/instagram-api/guides/comment-moderation)

## 📄 Lisans

MIT

