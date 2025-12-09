# Railway Deploy Hatası Çözümü

## 🔴 Hata: "There was an error deploying from source" / "Service is offline"

Railway'de deploy hatası alıyorsunuz. Şu adımları izleyin:

## ✅ Adım 1: Deploy Loglarını Kontrol Edin

1. **Railway Dashboard** → **Sikayet** servisi
2. **"Deployments"** sekmesine tıklayın
3. En son deploy'u açın (kırmızı/başarısız olan)
4. **"View Logs"** veya **"Logs"** butonuna tıklayın
5. Hatanın ne olduğunu görün

## ✅ Adım 2: Environment Variables Kontrolü

Railway Dashboard → Variables → Şunların hepsi ekli mi kontrol edin:

```
DATABASE_URL = file:./prisma/prod.db
JWT_SECRET = Tkaradayan1.Railway2025
NEXT_PUBLIC_APP_URL = https://sikayet-production.up.railway.app
NODE_ENV = production
```

**ÖNEMLİ:**
- `NEXT_PUBLIC_APP_URL` mutlaka `https://` ile başlamalı
- `JWT_SECRET` ve `DATABASE_URL` **secret olarak işaretlenmemiş** olmalı

## ✅ Adım 3: Volume Kontrolü

1. Railway Dashboard → **Volumes**
2. `sikayet-volume` var mı kontrol edin
3. Mount Path: `/app/prisma` olmalı
4. Eğer yoksa:
   - **"New"** → **"Volume"**
   - Mount Path: `/app/prisma`
   - Service: **Sikayet** servisini seçin

## ✅ Adım 4: Build Komutu Kontrolü

Railway Dashboard → Settings → Build Command:

```
npm run build
```

Veya boş bırakın (package.json'daki build script'i kullanır).

## ✅ Adım 5: Start Komutu Kontrolü

Railway Dashboard → Settings → Start Command:

```
npm start
```

Veya boş bırakın (package.json'daki start script'i kullanır).

## ✅ Adım 6: Service'i Yeniden Başlatın

1. Railway Dashboard → **Sikayet** servisi
2. **"Settings"** → **"Restart"** butonuna tıklayın
3. Veya **"Deployments"** → **"Redeploy"**

## 🔍 Yaygın Hatalar ve Çözümleri

### Hata 1: "DATABASE_URL not found"
**Çözüm:** `DATABASE_URL` variable'ını ekleyin (secret değil)

### Hata 2: "JWT_SECRET not found"
**Çözüm:** `JWT_SECRET` variable'ını ekleyin (secret değil)

### Hata 3: "Cannot find module"
**Çözüm:** `package.json` ve `package-lock.json` commit edilmiş mi kontrol edin

### Hata 4: "Prisma Client not generated"
**Çözüm:** `postinstall` script'i `package.json`'da var mı kontrol edin:
```json
"postinstall": "prisma generate"
```

### Hata 5: "Port already in use"
**Çözüm:** Railway otomatik olarak PORT environment variable'ını sağlar, `server.js` bunu kullanmalı

## 📋 Kontrol Listesi

- [ ] Deploy loglarını kontrol ettim
- [ ] Tüm environment variables eklendi
- [ ] `NEXT_PUBLIC_APP_URL` `https://` ile başlıyor
- [ ] `JWT_SECRET` ve `DATABASE_URL` secret değil
- [ ] Volume eklendi (`/app/prisma`)
- [ ] Build komutu doğru
- [ ] Start komutu doğru
- [ ] Service yeniden başlatıldı

## 🚀 Hızlı Çözüm

Eğer hala çalışmıyorsa:

1. **Railway Dashboard** → **Sikayet** servisi
2. **"Settings"** → **"Delete Service"** (dikkatli!)
3. Yeni servis oluşturun:
   - **"New Project"** → **"Deploy from GitHub repo"**
   - Repository: `Mertoto1/Sikayet`
   - Branch: `main`
4. Environment variables'ı tekrar ekleyin
5. Volume'u ekleyin
6. Deploy otomatik başlar

---

**Not:** Deploy loglarını paylaşırsanız daha spesifik yardım edebilirim.

