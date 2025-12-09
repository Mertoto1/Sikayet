# Railway Container Durma Hatası Çözümü

## 🔴 Hata: "Stopping Container" - Container başladıktan sonra duruyor

Loglarda görünen:
```
> Ready on http://localhost:8080
Stopping Container
npm error signal SIGTERM
```

Bu, Railway'in container'ı beklenmedik şekilde durdurduğu anlamına gelir.

## ✅ Çözüm 1: Healthcheck Endpoint Kontrolü

Railway, healthcheck endpoint'ini kontrol eder. Eğer healthcheck başarısız olursa container'ı durdurur.

### Healthcheck Endpoint'i Kontrol Edin

1. **Railway Dashboard** → **Settings** → **Deploy**
2. **Healthcheck Path** alanını kontrol edin
3. Varsayılan: `/api/health` veya boş

### Healthcheck Endpoint'i Test Edin

Site açıldığında şu URL'yi test edin:
```
https://sikayet-production.up.railway.app/api/health
```

Bu endpoint `200 OK` dönmeli.

## ✅ Çözüm 2: Port Kontrolü

Railway otomatik olarak `PORT` environment variable'ını sağlar. Server'ın bu portu dinlemesi gerekir.

### Server.js Kontrolü

`server.js` dosyasında:
```javascript
const PORT = process.env.PORT || 3000;
```

Bu doğru görünüyor. Railway `PORT=8080` sağlıyor ve server bunu kullanıyor.

## ✅ Çözüm 3: Healthcheck Path'i Ayarlayın

Railway Dashboard → Settings → Deploy → **Healthcheck Path:**

```
/api/health
```

Veya boş bırakın (Railway otomatik olarak `/` endpoint'ini kontrol eder).

## ✅ Çözüm 4: Server'ın Düzgün Başladığını Kontrol Edin

Loglarda şu mesajları görmelisiniz:
- "> Ready on http://localhost:8080"
- "Migration applied successfully"
- "Seeding database..."
- "Admin user created/updated"

Eğer bu mesajlar yoksa, Start Command'ı kontrol edin.

## ✅ Çözüm 5: Start Command'ı Güncelleyin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
npm run migrate && npm run seed && npm start
```

## 🔍 Debug İçin

Logları kontrol edin:
1. Railway Dashboard → **Logs** sekmesi
2. Son logları inceleyin
3. Hata mesajlarını arayın

## ⚠️ Yaygın Sorunlar

### Sorun 1: Healthcheck Başarısız
**Çözüm:** Healthcheck path'i doğru ayarlayın veya `/api/health` endpoint'ini kontrol edin.

### Sorun 2: Port Yanlış
**Çözüm:** Server `process.env.PORT` kullanmalı (zaten kullanıyor).

### Sorun 3: Server Çok Geç Başlıyor
**Çözüm:** Migration ve seed işlemleri çok uzun sürüyorsa, Railway timeout verebilir. Healthcheck path'i ayarlayın.

## 📋 Kontrol Listesi

- [ ] Healthcheck Path: `/api/health` (veya boş)
- [ ] Start Command: `npm run migrate && npm run seed && npm start`
- [ ] Server `process.env.PORT` kullanıyor
- [ ] `/api/health` endpoint'i `200 OK` dönüyor
- [ ] Loglarda "Ready on http://localhost:8080" mesajı var

---

**Not:** En yaygın sorun healthcheck başarısızlığıdır. Healthcheck path'i ayarlayın veya `/api/health` endpoint'ini test edin.

