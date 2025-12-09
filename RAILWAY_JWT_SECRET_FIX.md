# Railway JWT_SECRET Hatası Çözümü

## 🔴 Hata: `secret JWT_SECRET: not found`

Railway build sırasında `JWT_SECRET` environment variable'ını bulamıyor.

## ✅ Çözüm 1: JWT_SECRET'ı Shared Variable Yapın

Railway'de secret variable'lar bazen build sırasında erişilemez. Çözüm:

1. **Railway Dashboard → Variables**
2. **JWT_SECRET** variable'ını bulun
3. **"⋮" (üç nokta)** menüsüne tıklayın
4. **"Convert to Shared Variable"** seçin
5. Veya variable'ı silip yeniden ekleyin (bu sefer secret olarak işaretlemeyin)

## ✅ Çözüm 2: JWT_SECRET'ı Yeniden Ekleyin

1. **Railway Dashboard → Variables**
2. **JWT_SECRET** variable'ını silin
3. **"+ New Variable"** tıklayın
4. **Variable Name:** `JWT_SECRET`
5. **Variable Value:** `Tkaradayan1.Railway2025!SecretKey` (veya istediğiniz değer)
6. **"Add"** tıklayın
7. **Secret olarak işaretlemeyin** (build sırasında erişilebilir olması için)

## ✅ Çözüm 3: Build Komutunu Güncelleyin

Eğer hala sorun yaşıyorsanız, build komutunu güncelleyin:

Railway Dashboard → Settings → Build Command:
```
DATABASE_URL=file:./prisma/prod.db JWT_SECRET=your-secret npm run build
```

**Not:** Bu geçici bir çözüm. Variable'ları doğru şekilde eklemek daha iyi.

## ✅ Çözüm 4: Default Değer Ekleyin (Geçici)

`next.config.ts` dosyasına default değer ekleyebilirsiniz:

```typescript
env: {
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  // ...
}
```

**⚠️ UYARI:** Bu sadece geçici bir çözüm. Production'da mutlaka gerçek secret kullanın!

## 📋 Kontrol Listesi

- [ ] JWT_SECRET Railway'de ekli mi?
- [ ] JWT_SECRET secret olarak işaretlenmemiş mi?
- [ ] JWT_SECRET shared variable olarak eklenmiş mi?
- [ ] Build komutu doğru mu?
- [ ] Railway yeniden deploy edildi mi?

## 🎯 Önerilen Çözüm

**En iyi çözüm:** JWT_SECRET'ı **normal variable** olarak ekleyin (secret değil). Railway'de secret variable'lar bazen build sırasında erişilemez.

1. JWT_SECRET'ı silin
2. Yeniden ekleyin ama **secret olarak işaretlemeyin**
3. Railway otomatik olarak yeniden deploy eder

---

**Not:** Railway'de secret variable'lar runtime'da erişilebilir ama build sırasında erişilemeyebilir. Build için normal variable kullanın.

