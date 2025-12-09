# Railway Database Dosyası Bulunamıyor - Final Çözüm

## 🔴 Hata: "Error code 14: Unable to open the database file"

Seed çalıştı ama database dosyası bulunamıyor. Bu, **DATABASE_URL**'in yanlış path'e işaret ettiği anlamına gelir.

## ✅ Çözüm: DATABASE_URL ve Volume Path Kontrolü

### Adım 1: Volume Mount Path'ini Kontrol Edin

Railway Dashboard → **Volumes** → Volume'u açın:

**Mount Path ne?**
- `/app/data` mi?
- `/app/db` mi?
- `/app/prisma` mi?
- Yoksa volume yok mu?

### Adım 2: DATABASE_URL'i Volume Path'ine Göre Ayarlayın

Railway Dashboard → **Variables** → `DATABASE_URL`:

**Eğer volume mount path `/app/data` ise:**
```
file:./data/prod.db
```

**Eğer volume mount path `/app/db` ise:**
```
file:./db/prod.db
```

**Eğer volume mount path `/app/prisma` ise (ÖNERİLMEZ ama çalışır):**
```
file:./prisma/prod.db
```

**Eğer volume yoksa:**
```
file:./prisma/prod.db
```

### Adım 3: Migration'ın Database Dosyasını Nereye Oluşturduğunu Kontrol Edin

Migration çalıştığında, `DATABASE_URL`'deki path'e database dosyasını oluşturur.

**Örnek:**
- `DATABASE_URL = file:./data/prod.db` → `/app/data/prod.db` oluşturur
- `DATABASE_URL = file:./prisma/prod.db` → `/app/prisma/prod.db` oluşturur

### Adım 4: Volume Mount Path'ini DATABASE_URL ile Eşleştirin

**ÖNEMLİ:** Volume mount path'i ile DATABASE_URL path'i eşleşmeli!

**Örnek 1: Volume `/app/data` ise:**
- Volume Mount Path: `/app/data`
- DATABASE_URL: `file:./data/prod.db`
- Database dosyası: `/app/data/prod.db` ✅

**Örnek 2: Volume `/app/db` ise:**
- Volume Mount Path: `/app/db`
- DATABASE_URL: `file:./db/prod.db`
- Database dosyası: `/app/db/prod.db` ✅

**Örnek 3: Volume yoksa:**
- DATABASE_URL: `file:./prisma/prod.db`
- Database dosyası: `/app/prisma/prod.db` ✅

## 🔍 Debug İçin: Logları Kontrol Edin

Railway Dashboard → **Logs** → Migration loglarını arayın:

```
Migration applied successfully
```

Eğer bu mesaj yoksa, migration çalışmamış demektir.

## 📋 Adım Adım Kontrol Listesi

1. **Volume var mı?**
   - [ ] Evet → Mount Path ne? (`/app/data`, `/app/db`, `/app/prisma`)
   - [ ] Hayır → DATABASE_URL: `file:./prisma/prod.db`

2. **DATABASE_URL doğru mu?**
   - [ ] Volume `/app/data` → `DATABASE_URL = file:./data/prod.db`
   - [ ] Volume `/app/db` → `DATABASE_URL = file:./db/prod.db`
   - [ ] Volume `/app/prisma` → `DATABASE_URL = file:./prisma/prod.db`
   - [ ] Volume yok → `DATABASE_URL = file:./prisma/prod.db`

3. **Start Command doğru mu?**
   - [ ] `npm run migrate && npm run seed && npm start`

4. **Migration çalıştı mı?**
   - [ ] Loglarda "Migration applied successfully" var mı?

## 🚀 Hızlı Çözüm

**En kolay çözüm:** Volume'u kaldırın ve DATABASE_URL'i `file:./prisma/prod.db` yapın:

1. Railway Dashboard → **Volumes** → Volume'u silin
2. Railway Dashboard → **Variables** → `DATABASE_URL`:
   ```
   file:./prisma/prod.db
   ```
3. Railway Dashboard → **Deployments** → **Redeploy**

Bu şekilde:
- Database dosyası `/app/prisma/prod.db` konumunda oluşur
- Volume gerekmez (ama kalıcı olmaz - container restart'ta silinir)

**Kalıcı çözüm:** Volume ekleyin ve path'i eşleştirin:
1. Volume Mount Path: `/app/data`
2. DATABASE_URL: `file:./data/prod.db`
3. Redeploy

---

**ÖNEMLİ:** DATABASE_URL'deki path, volume mount path'i ile eşleşmeli!

