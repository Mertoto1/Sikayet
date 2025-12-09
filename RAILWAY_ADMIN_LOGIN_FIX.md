# Railway Admin Login 401 Hatası Çözümü

## 🔴 Hata: 401 Unauthorized - Admin hesabına giriş yapılamıyor

## ✅ Çözüm 1: Database Seed Çalıştırın

Railway'de database seed çalıştırmak için:

### Yöntem 1: Start Command'a Seed Ekleyin

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
npm run migrate && npm run seed && npm start
```

### Yöntem 2: Package.json'a Seed Script Ekleyin

`package.json`'a seed script ekleyin:

```json
"scripts": {
  "seed": "npx prisma db seed"
}
```

Sonra Start Command:
```bash
npm run migrate && npm run seed && npm start
```

## ✅ Çözüm 2: Admin Kullanıcısını Manuel Oluşturun

Railway CLI ile:

```bash
railway run npx prisma db seed
```

Veya Railway Dashboard → Deployments → Redeploy (seed script'i varsa)

## ✅ Çözüm 3: Environment Variables Kontrolü

Railway Dashboard → Variables → Şunların hepsi ekli mi:

```
DATABASE_URL = file:./data/prod.db (veya file:./prisma/prod.db)
JWT_SECRET = Tkaradayan1.Railway2025
NEXT_PUBLIC_APP_URL = https://sikayet-production.up.railway.app
NODE_ENV = production
```

**ÖNEMLİ:** `JWT_SECRET` mutlaka ekli olmalı ve secret değil olmalı.

## ✅ Çözüm 4: Default Admin Bilgileri

Seed dosyasına göre default admin bilgileri:

- **Email:** `admin@sikayetvar.clone` (veya `ADMIN_EMAIL` variable'ı)
- **Password:** `admin123` (veya `ADMIN_PASSWORD` variable'ı)

Railway'de custom admin bilgileri için:

```
ADMIN_EMAIL = admin@yourdomain.com
ADMIN_PASSWORD = your-secure-password
ADMIN_USERNAME = admin
ADMIN_NAME = Admin
ADMIN_SURNAME = User
```

## 📋 Kontrol Listesi

- [ ] Database migration çalıştırıldı (`npm run migrate`)
- [ ] Database seed çalıştırıldı (`npm run seed` veya `npx prisma db seed`)
- [ ] `JWT_SECRET` variable'ı ekli (secret değil)
- [ ] `DATABASE_URL` variable'ı doğru
- [ ] Admin kullanıcısı database'de var

## 🔍 Admin Kullanıcısını Kontrol Etmek İçin

Railway CLI ile:

```bash
railway run npx prisma studio
```

Veya database'i kontrol etmek için:

```bash
railway run npx prisma db execute --stdin
```

SQL:
```sql
SELECT * FROM User WHERE role = 'ADMIN';
```

---

**Not:** En kolay çözüm, Start Command'a seed eklemek: `npm run migrate && npm run seed && npm start`

