# Railway Final Fix - Schema Dosyası Bulunamıyor

## 🔴 Sorun: Volume Mount Edilmiş, Schema Dosyası Görünmüyor

Volume `/app/prisma`'ya mount edilmiş ve bu yüzden schema dosyası görünmüyor.

## ✅ Çözüm 1: Volume Mount Path'ini Değiştirin (ÖNERİLEN)

1. **Railway Dashboard** → **Volumes**
2. Mevcut volume'u açın
3. **Mount Path:** `/app/data` (veya `/app/db`) olarak değiştirin
4. **Save**
5. **DATABASE_URL** variable'ını güncelleyin:
   ```
   DATABASE_URL = file:./data/prod.db
   ```

## ✅ Çözüm 2: Start Command'da Working Directory ve Schema Path Belirtin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm start
```

**AMA:** Bu çalışmayabilir çünkü volume mount edilmişse `/app/prisma` dizini boş olabilir.

## ✅ Çözüm 3: Volume'u Geçici Olarak Kaldırın

1. **Railway Dashboard** → **Volumes**
2. Mevcut volume'u **silin** (geçici olarak)
3. **Start Command:**
   ```
   npm run migrate && npm start
   ```
4. Migration başarılı olduktan sonra volume'u tekrar ekleyin:
   - **Mount Path:** `/app/data`
   - **DATABASE_URL:** `file:./data/prod.db`

## 🚀 En İyi Çözüm (Adım Adım)

### Adım 1: Volume Mount Path'ini Değiştirin

1. Railway Dashboard → **Volumes**
2. Volume'u açın
3. **Mount Path:** `/app/data` olarak değiştirin
4. **Save**

### Adım 2: DATABASE_URL'i Güncelleyin

Railway Dashboard → Variables → `DATABASE_URL`:

```
file:./data/prod.db
```

### Adım 3: Start Command

Railway Dashboard → Settings → Deploy → **Start Command:**

```
npm run migrate && npm start
```

### Adım 4: Service'i Yeniden Başlatın

Railway Dashboard → Settings → **Restart**

## 📋 Kontrol Listesi

- [ ] Volume mount path: `/app/data` (veya `/app/db`)
- [ ] `DATABASE_URL = file:./data/prod.db`
- [ ] Start Command: `npm run migrate && npm start`
- [ ] Schema dosyaları `/app/prisma/` dizininde (build'den gelir)
- [ ] Database dosyası `/app/data/prod.db` (volume'da)

## 🔍 Debug İçin

Eğer hala çalışmazsa, Start Command'a debug ekleyin:

```bash
cd /app && ls -la && ls -la prisma/ && npx prisma migrate deploy && npm start
```

Bu komut:
1. `/app` dizinine gider
2. `/app` dizinindeki dosyaları listeler
3. `/app/prisma/` dizinindeki dosyaları listeler
4. Migration çalıştırır
5. Server'ı başlatır

---

**ÖNEMLİ:** Volume mount path'ini mutlaka `/app/data` veya `/app/db` olarak değiştirin. `/app/prisma` olarak bırakırsanız schema dosyaları görünmez!

