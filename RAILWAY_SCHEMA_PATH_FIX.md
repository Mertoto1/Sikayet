# Railway Schema Path Hatası - Kesin Çözüm

## 🔴 Hata: "Could not load `--schema` from provided path `prisma/schema.prisma`"

Railway'de schema dosyası bulunamıyor. Bu working directory veya path sorunundan kaynaklanıyor.

## ✅ Çözüm: Start Command'da Absolute Path Kullanın

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm start
```

Veya daha basit:

```bash
npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm start
```

## ✅ Alternatif Çözüm: Working Directory Kontrolü

Railway Dashboard → Settings → Deploy:

1. **Working Directory:** `/app` (veya boş bırakın)
2. **Start Command:** 
   ```bash
   npm run migrate && npm start
   ```

Ama `package.json`'daki migrate script'ini güncelleyin:

```json
"migrate": "prisma migrate deploy --schema=/app/prisma/schema.prisma"
```

## ✅ En İyi Çözüm: Start Command'ı Güncelleyin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
cd /app && npx prisma migrate deploy && npm start
```

**ÖNEMLİ:** `cd /app` komutu working directory'yi `/app` yapar, sonra Prisma default path'i kullanır (`prisma/schema.prisma`).

## 📋 Kontrol Listesi

1. **Working Directory:** `/app` (veya boş)
2. **Start Command:** `cd /app && npm run migrate && npm start`
3. **Schema dosyası git'te:** ✅ (kontrol edildi)
4. **Migration dosyaları git'te:** ✅ (kontrol edildi)

## 🔍 Debug İçin

Start Command'a debug ekleyin:

```bash
cd /app && ls -la prisma/ && npx prisma migrate deploy && npm start
```

Bu komut:
1. `/app` dizinine gider
2. `prisma/` klasöründeki dosyaları listeler
3. Migration çalıştırır
4. Server'ı başlatır

---

**Not:** Railway'de working directory genellikle `/app`'tir. Komutları çalıştırırken bu dizinde olduğunuzdan emin olun.

