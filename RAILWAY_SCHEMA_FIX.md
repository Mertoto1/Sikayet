# Railway Prisma Schema Bulunamıyor Hatası

## 🔴 Hata: "Could not find Prisma Schema"

Railway'de Prisma schema dosyası bulunamıyor. Bu genellikle working directory sorunundan kaynaklanır.

## ✅ Çözüm 1: Working Directory'yi Ayarlayın

Railway Dashboard → Settings → Deploy → **Working Directory:**

```
/app
```

Veya boş bırakın (default `/app` olmalı).

## ✅ Çözüm 2: Migration Komutunu Düzeltin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npm run migrate && npm start
```

Veya schema path'i belirtin:

```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma && npm start
```

## ✅ Çözüm 3: Package.json'da Schema Path Belirtin

`package.json` dosyasına ekleyin:

```json
{
  "prisma": {
    "schema": "./prisma/schema.prisma"
  }
}
```

## ✅ Çözüm 4: Start Command'ı Güncelleyin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm start
```

## 📋 Kontrol Listesi

1. **Working Directory:** `/app` (veya boş)
2. **Start Command:** `cd /app && npm run migrate && npm start`
3. **Schema dosyası commit edilmiş:** ✅ (kontrol edildi)
4. **Migration dosyaları commit edilmiş:** Kontrol edin

## 🔍 Migration Dosyalarını Kontrol Edin

Local'de:
```bash
git ls-files prisma/migrations/
```

Eğer migration dosyaları yoksa:
```bash
git add prisma/migrations/
git commit -m "Add Prisma migrations"
git push origin main
```

## 🚀 Önerilen Start Command

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npx prisma migrate deploy && npm start
```

Bu komut:
1. `/app` dizinine gider
2. Migration çalıştırır
3. Server'ı başlatır

---

**Not:** Railway'de working directory genellikle `/app`'tir. Komutları çalıştırırken bu dizinde olduğunuzdan emin olun.

