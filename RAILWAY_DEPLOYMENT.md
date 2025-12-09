# Railway Deployment Rehberi

## 🚀 Railway'a Deploy Etme Adımları

### 1. Git Repository Hazırlığı

Railway GitHub'dan deploy eder, bu yüzden önce GitHub'a push etmeniz gerekiyor.

#### Commit Edilecek Dosyalar:

```bash
# Tüm kaynak kodlar
app/
components/
lib/
prisma/
public/
server.js
next.config.ts
tailwind.config.ts
tsconfig.json
package.json
package-lock.json
README.md

# ÖNEMLİ: .env dosyasını COMMIT ETMEYİN!
# .env dosyası gitignore'da olmalı
```

#### Commit Edilmeyecek Dosyalar (.gitignore'da):

```
node_modules/
.next/
.env
.env.local
.env.production
*.db
*.db-journal
prisma/dev.db
prisma/prod.db
.DS_Store
```

### 2. GitHub'a Push Et

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 3. Railway'de Proje Oluştur

1. **Railway'a git:** https://railway.app
2. **"New Project"** tıkla
3. **"Deploy from GitHub repo"** seç
4. GitHub repo'nuzu seçin
5. Railway otomatik olarak deploy başlatır

### 4. Railway Environment Variables Ayarla

Railway Dashboard → Your Project → Variables sekmesine git:

#### Zorunlu Variables:

```env
NODE_ENV=production
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=your-super-strong-secret-key-change-this-now
NEXT_PUBLIC_APP_URL=https://your-app-name.up.railway.app
```

#### Opsiyonel Variables (Email için):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Opsiyonel Variables (AWS S3 için - şu an kullanılmıyor):

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
```

#### CORS (Opsiyonel):

```env
ALLOWED_ORIGINS=https://your-app-name.up.railway.app
```

### 5. Railway Build & Start Ayarları

Railway otomatik olarak algılar, ama kontrol edin:

**Settings → Build Command:**
```
npm run build
```

**Settings → Start Command:**
```
npm start
```

**Settings → Root Directory:**
```
/ (boş bırakın veya .)
```

### 6. Database Setup (SQLite için)

Railway'de SQLite kullanırken:

1. **Persistent Volume ekle:**
   - Railway Dashboard → Your Project → **"New"** → **"Volume"**
   - Mount Path: `/app/prisma`
   - Bu sayede database dosyası kalıcı olur

2. **Migration çalıştır:**
   Railway otomatik olarak build sırasında çalıştırabilir veya manuel:

   **Settings → Deploy → Build Command:**
   ```
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### 7. Railway Özel Ayarlar

#### Port Ayarı:
Railway otomatik olarak `PORT` environment variable'ını set eder. `server.js` zaten bunu kullanıyor.

#### Health Check:
Railway `/api/health` endpoint'ini kullanabilir (zaten var).

### 8. Deploy Sonrası Kontroller

1. ✅ Build başarılı mı?
2. ✅ Site açılıyor mu?
3. ✅ Database bağlantısı çalışıyor mu?
4. ✅ Login/Register çalışıyor mu?
5. ✅ Admin panel çalışıyor mu?

## 📋 Railway Deployment Checklist

- [ ] GitHub repo'ya push edildi
- [ ] Railway'de proje oluşturuldu
- [ ] GitHub repo bağlandı
- [ ] Environment variables eklendi
- [ ] Persistent Volume eklendi (SQLite için)
- [ ] Build başarılı
- [ ] Site çalışıyor
- [ ] Database migration çalıştı
- [ ] Test edildi

## ⚠️ Önemli Notlar

### SQLite ve Railway:

1. **Persistent Volume ŞART:** SQLite dosyası için volume eklemezseniz, her deploy'da database sıfırlanır!

2. **Volume Mount Path:** `/app/prisma` olmalı

3. **Database Dosyası:** `prisma/prod.db` olarak kaydedilecek

### Environment Variables:

- Railway'de `.env` dosyası kullanılmaz
- Tüm değişkenler Railway Dashboard'dan eklenir
- `DATABASE_URL` mutlaka ayarlanmalı

### Build Süresi:

- İlk build 5-10 dakika sürebilir
- Sonraki build'ler daha hızlı (cache sayesinde)

## 🔧 Sorun Giderme

### Build Hatası:
- Railway logs'u kontrol edin
- `npm run build` lokal olarak çalışıyor mu test edin

### Database Hatası:
- Persistent Volume eklendi mi kontrol edin
- `DATABASE_URL` doğru mu kontrol edin

### Port Hatası:
- Railway otomatik port ayarlar
- `server.js` zaten `process.env.PORT` kullanıyor

### 503 Error:
- Build tamamlandı mı kontrol edin
- Health check endpoint çalışıyor mu kontrol edin

## 🎯 Hızlı Başlangıç

1. GitHub'a push et
2. Railway'de "New Project" → GitHub repo seç
3. Variables ekle (yukarıdaki listeye bak)
4. Volume ekle (`/app/prisma`)
5. Deploy otomatik başlar!

## 📝 Railway URL Formatı

Railway size şu formatta URL verir:
```
https://your-app-name.up.railway.app
```

Bu URL'yi `NEXT_PUBLIC_APP_URL` olarak kullanın.

---

**Not:** SQLite geçici çözüm. Production'da PostgreSQL kullanmanızı öneriyoruz. Railway'de PostgreSQL eklemek çok kolay - sadece "New" → "Database" → "PostgreSQL" seçin!

