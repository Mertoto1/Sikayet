# Production Deployment Checklist

## ✅ Proje Durumu: HAZIR

Proje production'a hazır durumda. Aşağıdaki checklist'i takip edin.

## 🔴 Kritik (Yapılmadan Production'a Çıkmayın)

- [ ] **PostgreSQL'e geçiş yapıldı** (SQLite production için uygun değil)
- [ ] **JWT_SECRET değiştirildi** (güçlü bir secret key)
- [ ] **NODE_ENV=production** ayarlandı
- [ ] **NEXT_PUBLIC_APP_URL** production URL'i ile güncellendi
- [ ] **SMTP ayarları** yapıldı (email gönderimi için)
- [ ] **Database backup stratejisi** belirlendi

## 🟡 Önemli (Mümkünse yapın)

- [ ] **Rate limiting** aktif (✅ Eklendi)
- [ ] **XSS protection** aktif (✅ Eklendi)
- [ ] **SSL/HTTPS** sertifikası kuruldu
- [ ] **Error logging** sistemi (Sentry, LogRocket vb.)
- [ ] **Monitoring** sistemi kuruldu
- [ ] **Backup otomasyonu** ayarlandı

## 🟢 İyileştirmeler (Opsiyonel)

- [ ] **CDN** kullanımı (resimler için)
- [ ] **Redis** cache (performans için)
- [ ] **Load balancing** (yüksek trafik için)
- [ ] **API documentation** (Swagger/OpenAPI)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-strong-secret-key-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Database
- [ ] PostgreSQL database oluşturuldu
- [ ] Migration'lar çalıştırıldı
- [ ] Seed data eklendi (gerekirse)
- [ ] Backup alındı

### 3. Build & Test
- [ ] `npm run build` başarılı
- [ ] `npm start` çalışıyor
- [ ] Tüm sayfalar test edildi
- [ ] API endpoint'leri test edildi
- [ ] Authentication test edildi

### 4. Security
- [ ] `.env` dosyası git'e commit edilmedi
- [ ] Güçlü şifreler kullanıldı
- [ ] HTTPS aktif
- [ ] CORS ayarları kontrol edildi

### 5. Performance
- [ ] Image optimization aktif
- [ ] Database query'leri optimize edildi
- [ ] Caching stratejisi belirlendi

## 🚀 Deployment Adımları

### cPanel Deployment:
1. PostgreSQL database oluştur
2. `.env` dosyasını production değerleriyle doldur
3. Dosyaları FTP/cPanel File Manager ile yükle
4. `npm install --production`
5. `npm run build`
6. Node.js App olarak başlat

### Vercel Deployment (Önerilen):
```bash
npm i -g vercel
vercel
```

### Railway/Render:
1. GitHub'a push et
2. Yeni proje oluştur
3. PostgreSQL ekle
4. Environment variables ekle
5. Deploy!

## 📊 Proje Özellikleri

### ✅ Tamamlanan Özellikler
- ✅ Kullanıcı authentication (JWT)
- ✅ 2FA desteği
- ✅ Email verification
- ✅ Şirket kayıt/yönetim
- ✅ Şikayet sistemi
- ✅ Admin panel
- ✅ Şirket paneli
- ✅ Support ticket sistemi
- ✅ Real-time mesajlaşma (Socket.IO)
- ✅ Image upload
- ✅ Rate limiting
- ✅ XSS protection
- ✅ Responsive design

### ⚠️ Bilinen Sınırlamalar
- SQLite kullanılıyor (PostgreSQL'e geçilmeli)
- In-memory rate limiting (Redis önerilir)
- Local file storage (S3/CDN önerilir)

## 🎯 Son Kontroller

- [ ] Tüm linkler çalışıyor
- [ ] Form validasyonları çalışıyor
- [ ] Error handling test edildi
- [ ] Mobile responsive test edildi
- [ ] Browser compatibility test edildi

## 📝 Notlar

- Production'da SQLite kullanmayın!
- JWT_SECRET'ı mutlaka değiştirin
- Regular backup alın
- Monitoring kurun
- Error tracking aktif edin

---

**Proje Production'a Hazır! 🚀**

PostgreSQL'e geçiş yaptıktan sonra deploy edebilirsiniz.

