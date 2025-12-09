# Railway Environment Variables - Doğru Değerler

## ✅ Railway'de Ekleyeceğiniz Variables

Railway Dashboard → Variables → "+ New Variable" ile şunları ekleyin:

### 1. DATABASE_URL
```
Variable Name: DATABASE_URL
Variable Value: file:./prisma/prod.db
```
**ÖNEMLİ:** Secret olarak işaretlemeyin!

### 2. JWT_SECRET
```
Variable Name: JWT_SECRET
Variable Value: Tkaradayan1.Railway2025
```
**ÖNEMLİ:** Secret olarak işaretlemeyin! (Build sırasında erişilebilir olması için)

### 3. NEXT_PUBLIC_APP_URL
```
Variable Name: NEXT_PUBLIC_APP_URL
Variable Value: https://sikayet-production.up.railway.app
```
**ÖNEMLİ:** `https://` ile başlamalı! Railway size verdiği URL'i kullanın.

### 4. NODE_ENV
```
Variable Name: NODE_ENV
Variable Value: production
```

## ⚠️ Dikkat Edilmesi Gerekenler

1. **NEXT_PUBLIC_APP_URL:** Mutlaka `https://` ile başlamalı
   - ❌ Yanlış: `sikayet-production.up.railway.app`
   - ✅ Doğru: `https://sikayet-production.up.railway.app`

2. **JWT_SECRET:** Secret olarak işaretlemeyin (build için gerekli)

3. **DATABASE_URL:** Secret olarak işaretlemeyin (build için gerekli)

4. **Volume:** SQLite için mutlaka volume ekleyin:
   - Mount Path: `/app/prisma`

## 📋 Kontrol Listesi

- [ ] DATABASE_URL = `file:./prisma/prod.db` (secret değil)
- [ ] JWT_SECRET = `Tkaradayan1.Railway2025` (secret değil)
- [ ] NEXT_PUBLIC_APP_URL = `https://sikayet-production.up.railway.app` (https:// ile)
- [ ] NODE_ENV = `production`
- [ ] Volume eklendi (`/app/prisma` mount path ile)

## 🔄 Deploy Sonrası

Variables ekledikten sonra:
1. Railway otomatik olarak yeniden deploy eder
2. Build başarılı olmalı
3. Site çalışır durumda olmalı

---

**Not:** Railway size verdiği tam URL'i `NEXT_PUBLIC_APP_URL` olarak kullanın. Genellikle `https://your-app-name.up.railway.app` formatındadır.

