# Railway SMTP Kurulum Rehberi

## ⚠️ ÖNEMLİ: Railway'de .env Dosyası ÇALIŞMAZ!

Railway'de `.env` dosyası kullanılamaz. **Railway Variables** kullanılmalıdır!

## ✅ Railway'de SMTP Ayarları Nasıl Yapılır?

### Adım 1: Railway Dashboard'a Git
1. Railway Dashboard → Projenizi seçin
2. **Variables** sekmesine tıklayın

### Adım 2: SMTP Variables Ekleyin

Şu variable'ları ekleyin (her biri için "New Variable" butonuna tıklayın):

```
SMTP_HOST = smtp.brandliftup.nl
SMTP_PORT = 465
SMTP_SECURE = true
SMTP_USER = info@brandliftup.nl
SMTP_PASS = [şifreniz]
SMTP_FROM = "Şikayetvar Clone" <info@brandliftup.nl>
```

**ÖNEMLİ:**
- `SMTP_HOST` **mutlaka** `smtp.` ile başlamalı! (`smtp.brandliftup.nl`)
- Port 465 için: `SMTP_SECURE = true`
- Port 587 için: `SMTP_SECURE = false`
- `SMTP_FROM` formatı: `"İsim" <email@domain.com>`

### Adım 3: Admin Panelden de Kaydedin

Railway Variables ekledikten sonra:
1. Railway'de siteyi açın: `https://sikayet-production.up.railway.app/admin/settings`
2. SMTP ayarlarını tekrar kaydedin (database'e kaydedilmesi için)

### Adım 4: Deploy Sonrası Kontrol

1. Railway Dashboard → **Deployments** → En son deployment'ı kontrol edin
2. **Logs** sekmesinde şu logları arayın:
   - `[SMTP] Found SMTP_HOST in environment: smtp.brandliftup.nl`
   - `[SMTP] Creating transporter - host=smtp.brandliftup.nl, port=465, secure=true`

## 🔍 Sorun Giderme

### Sorun 1: Email Gelmiyor
**Kontrol:**
- Railway Variables'da tüm SMTP ayarları var mı?
- `SMTP_HOST` `smtp.` ile başlıyor mu?
- `SMTP_SECURE` doğru mu? (465 için `true`, 587 için `false`)

### Sorun 2: "SMTP_HOST not found" Hatası
**Çözüm:**
- Railway Variables'da `SMTP_HOST` ekli mi kontrol edin
- Admin panelden de kaydedin (database'e kaydedilmesi için)

### Sorun 3: "Connection Refused" Hatası
**Olası Nedenler:**
- SMTP sunucusu Railway IP'lerini engelliyor olabilir
- Port yanlış (465 veya 587 kullanın, 25 değil)
- `SMTP_SECURE` yanlış (port 465 için `true` olmalı)

## 📋 Kontrol Listesi

- [ ] Railway Variables'da `SMTP_HOST` ekli (`smtp.brandliftup.nl`)
- [ ] Railway Variables'da `SMTP_PORT` ekli (`465`)
- [ ] Railway Variables'da `SMTP_SECURE` ekli (`true`)
- [ ] Railway Variables'da `SMTP_USER` ekli (`info@brandliftup.nl`)
- [ ] Railway Variables'da `SMTP_PASS` ekli (şifre)
- [ ] Railway Variables'da `SMTP_FROM` ekli
- [ ] Admin panelden SMTP ayarları kaydedildi
- [ ] Deploy sonrası loglarda `[SMTP]` mesajları görünüyor

## 🚀 Test Etme

1. Railway'de yeni bir kullanıcı kaydedin
2. Railway Dashboard → **Logs** → `[REGISTER]`, `[EMAIL]`, `[SMTP]` loglarını kontrol edin
3. Email gelip gelmediğini kontrol edin

---

**Not:** Railway Variables ekledikten sonra **mutlaka** admin panelden de kaydedin. Kod önce database'den okur, yoksa environment variable'dan alır.

