# Railway Volume Mount Sorunu - Kesin Çözüm

## 🔴 Sorun: Volume Mount Edilmiş Ama Schema Dosyası Yok

Loglarda görüldüğü gibi:
```
total 24
drwxr-xr-x 3 root root  4096 Dec  9 16:57 .
drwxr-xr-x 1 root root  4096 Dec  9 17:25 ..
drwx------ 2 root root 16384 Dec  9 16:57 lost+found
```

Volume mount edilmiş ama `/app/prisma` dizini boş. Bu, volume'un boş olduğu ve schema dosyalarının build sırasında volume'a kopyalanmadığı anlamına gelir.

## ✅ Çözüm: Volume Mount Path'ini Değiştirin

### Yöntem 1: Volume Mount Path'ini `/app/data` Yapın (ÖNERİLEN)

1. **Railway Dashboard** → **Volumes**
2. Mevcut volume'u silin veya mount path'ini değiştirin
3. Yeni volume oluşturun:
   - **Mount Path:** `/app/data`
   - **Service:** `Sikayet`
4. **DATABASE_URL** variable'ını güncelleyin:
   ```
   DATABASE_URL = file:./data/prod.db
   ```

Bu şekilde:
- Schema ve migration dosyaları `/app/prisma/` dizininde kalır (build'den gelir)
- Database dosyası `/app/data/prod.db` konumunda olur (volume'da kalıcı)

### Yöntem 2: Volume'u Kaldırın ve Migration Sonrası Ekleyin

1. **Railway Dashboard** → **Volumes**
2. Mevcut volume'u silin
3. **Start Command:**
   ```
   npm run migrate && npm start
   ```
4. Migration başarılı olduktan sonra volume'u tekrar ekleyin:
   - **Mount Path:** `/app/prisma`
   - **Service:** `Sikayet`

### Yöntem 3: DATABASE_URL'i Volume Dışına Taşıyın

1. **DATABASE_URL** variable'ını güncelleyin:
   ```
   DATABASE_URL = file:./prisma/prod.db
   ```
2. Volume mount path'ini değiştirin:
   - **Mount Path:** `/app/data`
3. Migration'ı çalıştırın:
   ```
   npm run migrate && npm start
   ```

## 🚀 Önerilen Çözüm (En Kolay)

### Adım 1: Volume Mount Path'ini Değiştirin

1. Railway Dashboard → Volumes
2. Mevcut volume'u açın veya yeni oluşturun
3. **Mount Path:** `/app/data` (veya `/app/db`)
4. Service: `Sikayet`

### Adım 2: DATABASE_URL'i Güncelleyin

Railway Dashboard → Variables → `DATABASE_URL`:

```
file:./data/prod.db
```

### Adım 3: Start Command

Railway Dashboard → Settings → Deploy → Start Command:

```
npm run migrate && npm start
```

### Adım 4: Service'i Yeniden Başlatın

Railway Dashboard → Settings → Restart

## 📋 Kontrol Listesi

- [ ] Volume mount path: `/app/data` (veya `/app/db`)
- [ ] `DATABASE_URL = file:./data/prod.db` (veya `file:./db/prod.db`)
- [ ] Start Command: `npm run migrate && npm start`
- [ ] Schema dosyaları `/app/prisma/` dizininde (build'den gelir)
- [ ] Database dosyası volume'da (`/app/data/prod.db`)

## 🔍 Neden Bu Sorun Oluyor?

Railway'de volume mount edildiğinde:
- Volume'un içeriği mount path'i override eder
- Build sırasında dosyalar volume'a kopyalanmaz
- Bu yüzden schema dosyaları volume'da görünmez

**Çözüm:** Schema ve migration dosyalarını normal dizinde tutmak, sadece database dosyasını volume'da saklamak.

---

**Not:** En kolay çözüm, volume mount path'ini `/app/data` yapmak ve `DATABASE_URL`'i `file:./data/prod.db` olarak güncellemektir.

