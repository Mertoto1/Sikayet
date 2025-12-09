# SQLite → PostgreSQL Geçiş Rehberi

## ⚠️ ÖNEMLİ: Production için PostgreSQL Şart!

SQLite sadece development için uygundur. Production'da PostgreSQL kullanmalısınız.

## Adım 1: PostgreSQL Veritabanı Oluştur

### cPanel'de:
1. cPanel → PostgreSQL Databases
2. **Database Name:** `sikayet_db` (veya istediğiniz isim)
3. **Database User:** Yeni kullanıcı oluştur
4. **Password:** Güçlü bir şifre belirle
5. Kullanıcıyı database'e ekle

### Connection String Format:
```
postgresql://username:password@localhost:5432/database_name
```

**Örnek:**
```
postgresql://sikayet_user:your_password@localhost:5432/sikayet_db
```

## Adım 2: Prisma Schema'yı Güncelle

`prisma/schema.prisma` dosyasını açın ve şunu değiştirin:

```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

## Adım 3: Environment Variables

`.env` dosyanızda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

**ÖNEMLİ:** Production'da şifreyi güvenli tutun!

## Adım 4: Migration Çalıştır

```bash
# Prisma client'ı yeniden generate et
npx prisma generate

# Migration'ları çalıştır
npx prisma migrate deploy

# VEYA yeni migration oluştur
npx prisma migrate dev --name init_postgresql
```

## Adım 5: Veri Transferi (Opsiyonel)

Eğer SQLite'ta veri varsa:

```bash
# SQLite verilerini export et
sqlite3 prisma/dev.db .dump > backup.sql

# PostgreSQL'e import et (gerekirse manuel düzenleme yapın)
psql -U username -d database_name -f backup.sql
```

**VEYA** Prisma Studio ile manuel kopyalayın:
```bash
npx prisma studio
```

## Adım 6: Test Et

```bash
npm run dev
```

Veritabanı bağlantısını kontrol edin.

## Adım 7: Production Build

```bash
npm run build
npm start
```

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Case Sensitivity:** PostgreSQL case-sensitive, SQLite değil
2. **Boolean Values:** PostgreSQL `true/false`, SQLite `1/0`
3. **Date Handling:** PostgreSQL daha strict
4. **Transactions:** PostgreSQL daha güçlü transaction desteği

## Sorun Giderme

### Connection Error
- PostgreSQL servisinin çalıştığından emin olun
- Connection string'i kontrol edin
- Firewall ayarlarını kontrol edin

### Migration Error
- `npx prisma migrate reset` ile sıfırlayıp tekrar deneyin
- Schema'yı kontrol edin

### Performance
- PostgreSQL genellikle SQLite'tan daha hızlıdır
- Index'leri kontrol edin: `npx prisma studio`

## Başarılı Geçiş Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Prisma schema `postgresql` olarak güncellendi
- [ ] `.env` dosyasında `DATABASE_URL` güncellendi
- [ ] `npx prisma generate` çalıştırıldı
- [ ] `npx prisma migrate deploy` başarılı
- [ ] Veriler transfer edildi (varsa)
- [ ] `npm run dev` çalışıyor
- [ ] `npm run build` başarılı
- [ ] Production'da test edildi

