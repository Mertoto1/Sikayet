# Railway Restart ve Redeploy Rehberi

## 🔄 Railway'de Service'i Yeniden Başlatma

Railway Dashboard'da "Restart" butonu yoksa, şu yöntemleri kullanabilirsiniz:

## ✅ Yöntem 1: Deployments Sekmesinden Redeploy

1. **Railway Dashboard** → **Deployments** sekmesi
2. En son deployment'ı bulun
3. **"⋮" (üç nokta)** menüsüne tıklayın
4. **"Redeploy"** seçin

Bu, service'i yeniden başlatır ve Start Command'ı çalıştırır.

## ✅ Yöntem 2: Settings'te Değişiklik Yaparak Trigger

1. **Railway Dashboard** → **Settings** sekmesi
2. Herhangi bir ayarı değiştirin (örneğin Start Command'a boşluk ekleyin)
3. **"Save"** veya **"Update"** tıklayın
4. Railway otomatik olarak yeniden deploy eder

## ✅ Yöntem 3: GitHub'a Push Yaparak Trigger

1. Herhangi bir dosyada küçük bir değişiklik yapın
2. Commit ve push edin:
   ```bash
   git commit --allow-empty -m "Trigger Railway redeploy"
   git push origin main
   ```
3. Railway otomatik olarak yeni deployment başlatır

## ✅ Yöntem 4: Railway CLI ile Restart

Eğer Railway CLI kuruluysa:

```bash
railway restart
```

## 📋 Start Command Kontrolü

Railway Dashboard → Settings → Deploy → **Start Command:**

```
npm run migrate && npm run seed && npm start
```

Bu komut:
1. Migration çalıştırır
2. Seed çalıştırır (admin kullanıcısını oluşturur)
3. Server'ı başlatır

## 🔍 Deployment Loglarını Kontrol Etmek

1. **Railway Dashboard** → **Deployments** sekmesi
2. En son deployment'ı açın
3. **"View Logs"** veya **"Logs"** butonuna tıklayın
4. Şu mesajları görmelisiniz:
   - "Migration applied successfully"
   - "Seeding database..."
   - "Admin user created/updated: admin@sikayetvar.clone"
   - "> Ready on http://localhost:8080"

## ⚠️ Önemli Notlar

- **Start Command** doğru ayarlanmış olmalı
- **Environment Variables** ekli olmalı (`JWT_SECRET`, `DATABASE_URL`, vb.)
- **Volume** mount edilmiş olmalı (`/app/data` veya `/app/db`)

---

**En Kolay Yöntem:** Deployments sekmesinden **"Redeploy"** yapmak.

