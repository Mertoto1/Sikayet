# Railway Start Command Kontrolü

## 🔍 Sorun: Build Başarılı Ama Migration Çalışmamış

Loglarda görünen:
```
Deploy
──────────
$ npm start
```

**SORUN:** Start Command'da sadece `npm start` var. Migration ve seed çalışmıyor!

## ✅ Çözüm: Start Command'ı Güncelleyin

Railway Dashboard → **Settings** → **Deploy** → **Start Command:**

```bash
npm run migrate && npm run seed && npm start
```

Bu komut:
1. **Migration çalıştırır** → Database dosyasını oluşturur
2. **Seed çalıştırır** → Admin kullanıcısını oluşturur
3. **Server'ı başlatır** → Site çalışır

## 📋 Kontrol Listesi

- [ ] Start Command: `npm run migrate && npm run seed && npm start`
- [ ] `DATABASE_URL = file:./data/prod.db` (veya volume path'ine göre)
- [ ] Volume mount path: `/app/data` (veya `/app/db`)
- [ ] `JWT_SECRET` variable'ı ekli

## 🔍 Log Kontrolü

Railway Dashboard → **Logs** → Şu mesajları görmelisiniz:

✅ **Başarılı:**
- "Migration applied successfully"
- "Seeding database..."
- "Admin user created/updated: admin@sikayetvar.clone"
- "> Ready on http://localhost:8080"

❌ **Hata:**
- "Error code 14: Unable to open the database file" → Migration çalışmamış
- "Could not find Prisma Schema" → Schema path sorunu

## ⚠️ Önemli

Start Command'ı güncelledikten sonra:
1. Railway otomatik olarak yeniden deploy eder
2. Veya **Deployments** → **Redeploy** yapın

---

**Not:** Start Command'ı güncellemeden site çalışmaz çünkü database dosyası oluşmaz!

