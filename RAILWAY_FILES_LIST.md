# Railway Deployment - Commit Edilecek Dosyalar

## ✅ Git'e Commit Edilecek Dosyalar

### Kaynak Kodlar (ZORUNLU)
```
app/                    # Tüm Next.js app klasörü
components/             # React component'leri
lib/                    # Utility fonksiyonlar
prisma/
  ├── schema.prisma     # Database schema
  ├── migrations/       # Migration dosyaları
  └── seed.ts          # Seed script (opsiyonel)
public/                 # Static dosyalar (images, icons vb.)
server.js               # Custom server
next.config.ts          # Next.js config
tailwind.config.ts      # Tailwind config
tsconfig.json           # TypeScript config
postcss.config.js       # PostCSS config
package.json            # Dependencies
package-lock.json      # Lock file
README.md               # Dokümantasyon
```

### Config Dosyaları
```
.gitignore
.eslintrc.json (veya eslint.config.mjs)
middleware.ts
```

### Dokümantasyon (Opsiyonel ama önerilir)
```
DEPLOYMENT_GUIDE.md
PROJECT_REVIEW.md
RAILWAY_DEPLOYMENT.md
POSTGRESQL_MIGRATION.md
PRODUCTION_CHECKLIST.md
```

## ❌ Git'e Commit EDİLMEYECEK Dosyalar

Bu dosyalar `.gitignore`'da zaten var:

```
node_modules/          # Dependencies (npm install ile yüklenir)
.next/                 # Next.js build output
.env                   # Environment variables (Railway'de manuel eklenir)
.env.local
.env.production
*.db                   # SQLite database dosyaları
*.db-journal
prisma/dev.db
prisma/prod.db
.DS_Store
*.log
.vercel/
*.tsbuildinfo
```

## 📦 Railway Build İçin Gerekli Dosyalar

Railway şunları otomatik yapar:
1. `npm install` çalıştırır (node_modules yükler)
2. `npm run build` çalıştırır (next build)
3. `npm start` çalıştırır (server başlatır)

## 🔧 Railway Özel Ayarlar

### Build Command (Otomatik algılanır):
```
npm run build
```

### Start Command (Otomatik algılanır):
```
npm start
```

### Postinstall (Otomatik çalışır):
```
npm run postinstall  # Prisma generate için eklendi
```

## ⚠️ ÖNEMLİ: SQLite için Persistent Volume

Railway'de SQLite kullanırken **MUTLAKA Volume ekleyin:**

1. Railway Dashboard → Your Project
2. **"New"** → **"Volume"**
3. **Mount Path:** `/app/prisma`
4. Bu sayede database dosyası kalıcı olur

Volume eklemezseniz, her deploy'da database sıfırlanır!

## 📝 Hızlı Checklist

- [ ] Tüm kaynak kodlar git'e commit edildi
- [ ] `.env` dosyası commit edilmedi (gitignore'da)
- [ ] `node_modules` commit edilmedi
- [ ] GitHub'a push edildi
- [ ] Railway'de proje oluşturuldu
- [ ] GitHub repo bağlandı
- [ ] Environment variables eklendi
- [ ] Persistent Volume eklendi (`/app/prisma`)
- [ ] Build başarılı
- [ ] Site çalışıyor

