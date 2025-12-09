# Railway Migration Çalışmıyor - Final Çözüm

## 🔴 Hata: "Error code 14: Unable to open the database file"

Volume silindi, DATABASE_URL ayarlandı ama hala hata var. **Sorun: Migration çalışmıyor!**

## ✅ Çözüm: Start Command'ı Kontrol Edin

### Adım 1: Start Command'ı Kontrol Edin

Railway Dashboard → **Settings** → **Deploy** → **Start Command:**

**Şu şekilde olmalı:**
```bash
npm run migrate && npm run seed && npm start
```

**Eğer sadece şu varsa:**
```bash
npm start
```

**SORUN:** Migration çalışmıyor, database dosyası oluşmuyor!

### Adım 2: Start Command'ı Güncelleyin

Railway Dashboard → **Settings** → **Deploy** → **Start Command:**

```bash
npm run migrate && npm run seed && npm start
```

**Save** veya **Update** tıklayın.

### Adım 3: DATABASE_URL Kontrolü

Railway Dashboard → **Variables** → `DATABASE_URL`:

```
file:./prisma/prod.db
```

**ÖNEMLİ:** Volume yoksa bu doğru.

### Adım 4: Service'i Yeniden Başlatın

Railway Dashboard → **Deployments** → En son deployment → **"Redeploy"**

## 🔍 Log Kontrolü

Railway Dashboard → **Logs** → Şu mesajları görmelisiniz:

✅ **Başarılı:**
- "Migration applied successfully" ← **BU MESAJ OLMALI!**
- "Seeding database..."
- "Admin user created/updated: admin@sikayetvar.clone"
- "> Ready on http://localhost:8080"

❌ **Hata:**
- "Error code 14: Unable to open the database file" → Migration çalışmamış
- "Could not find Prisma Schema" → Schema path sorunu

## 📋 Kontrol Listesi

- [ ] Start Command: `npm run migrate && npm run seed && npm start` (3 komut!)
- [ ] `DATABASE_URL = file:./prisma/prod.db`
- [ ] Volume yok (sildiniz)
- [ ] Loglarda "Migration applied successfully" mesajı var

## ⚠️ Önemli Notlar

1. **Start Command'da 3 komut olmalı:**
   - `npm run migrate` → Database dosyasını oluşturur
   - `npm run seed` → Admin kullanıcısını oluşturur
   - `npm start` → Server'ı başlatır

2. **Migration çalışmadan database dosyası oluşmaz!**

3. **Volume yoksa database dosyası `/app/prisma/prod.db` konumunda oluşur.**

---

**EN ÖNEMLİSİ:** Start Command'da `npm run migrate` olmalı! Yoksa database dosyası oluşmaz!

