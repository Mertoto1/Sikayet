# Deployment Rehberi - cPanel / Namecheap

## ⚠️ ÖNEMLİ: SQLite ve cPanel

**SQLite cPanel'de production için ÖNERİLMEZ!**

### SQLite'nin Sorunları:
1. **File Locking**: Çoklu kullanıcı erişiminde sorunlar
2. **Concurrent Writes**: Aynı anda yazma işlemleri başarısız olabilir
3. **Performance**: Yüksek trafikte yavaşlar
4. **Backup**: Dosya bazlı olduğu için backup zor

### ✅ Çözüm: PostgreSQL'e Geçiş

cPanel'de genellikle PostgreSQL mevcuttur. PostgreSQL'e geçiş yapın:

## PostgreSQL'e Geçiş Adımları

### 1. Prisma Schema'yı Güncelle

`prisma/schema.prisma` dosyasını açın ve şunu değiştirin:

```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

### 2. cPanel'de PostgreSQL Veritabanı Oluştur

1. cPanel → PostgreSQL Databases
2. Yeni database oluştur
3. Yeni kullanıcı oluştur
4. Kullanıcıyı database'e ekle
5. Connection string'i kopyala:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```

### 3. Environment Variables

`.env` dosyasında:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### 4. Migration Çalıştır

```bash
npx prisma migrate deploy
```

### 5. Prisma Client Yeniden Generate Et

```bash
npx prisma generate
```

## cPanel Deployment Adımları

### 1. Node.js Versiyonu

cPanel → Node.js Selector ile Node.js 18+ seçin

### 2. Dosyaları Yükle

- Tüm proje dosyalarını FTP/cPanel File Manager ile yükleyin
- `.env` dosyasını oluşturun (`.env.example`'dan kopyalayın)

### 3. Dependencies Yükle

Terminal'de:
```bash
npm install --production
```

### 4. Build

```bash
npm run build
```

### 5. PM2 ile Çalıştır

cPanel'de PM2 mevcut değilse, Node.js App olarak çalıştırın:

**Startup File:** `server.js`
**App Root:** `/home/username/public_html` (veya proje klasörünüz)
**App URL:** `yourdomain.com`

### 6. Environment Variables

cPanel → Node.js App → Environment Variables:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=your-secret-key`
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

## Alternatif: Vercel / Railway / Render

Eğer cPanel sorunlu olursa, şu platformlar daha kolay:

### Vercel (Önerilen)
```bash
npm i -g vercel
vercel
```

### Railway
1. GitHub'a push edin
2. Railway'de yeni proje oluşturun
3. GitHub repo'yu bağlayın
4. PostgreSQL ekleyin
5. Deploy!

### Render
1. GitHub'a push edin
2. Render'da yeni Web Service oluşturun
3. PostgreSQL database ekleyin
4. Deploy!

## Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Prisma schema PostgreSQL için güncellendi
- [ ] Migration çalıştırıldı
- [ ] `.env` dosyası production değerleriyle dolduruldu
- [ ] `JWT_SECRET` güçlü bir değerle değiştirildi
- [ ] `NEXT_PUBLIC_APP_URL` production URL'i ile güncellendi
- [ ] SMTP ayarları yapıldı
- [ ] Build başarılı
- [ ] Production modda çalışıyor

## Sorun Giderme

### SQLite Lock Hatası
→ PostgreSQL'e geçin

### Port Sorunu
→ cPanel Node.js App portunu otomatik ayarlar

### Build Hatası
→ `npm run build` çıktısını kontrol edin

### Database Connection Hatası
→ `.env` dosyasındaki `DATABASE_URL`'i kontrol edin

