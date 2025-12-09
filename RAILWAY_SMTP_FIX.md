# Railway SMTP Email Gönderme Sorunu

## 🔴 Sorun: Railway'de Email Gelmiyor

Local'de email geliyor ama Railway'de gelmiyor. Aynı SMTP kullanılıyor.

## ✅ Çözüm: Railway Environment Variables Kontrolü

### Adım 1: Railway Environment Variables Kontrolü

Railway Dashboard → **Variables** → Şu SMTP variable'ları ekli mi kontrol edin:

```
SMTP_HOST = smtp.example.com
SMTP_PORT = 587
SMTP_USER = your-email@example.com
SMTP_PASS = your-password
SMTP_FROM = Site Name <noreply@example.com>
SMTP_SECURE = false (veya true, port'a göre)
```

**ÖNEMLİ:** 
- Port 587 için: `SMTP_SECURE = false` (STARTTLS)
- Port 465 için: `SMTP_SECURE = true` (SSL/TLS)

### Adım 2: Database'de SMTP Ayarları Kontrolü

Railway'de SMTP ayarları database'de de kayıtlı olabilir. Admin panelden kontrol edin:

1. Railway'de site açıkken: `https://sikayet-production.up.railway.app/admin/settings`
2. **SMTP / E-posta Ayarları** bölümünü kontrol edin
3. SMTP ayarlarının kayıtlı olduğundan emin olun

### Adım 3: Railway Loglarını Kontrol Edin

Railway Dashboard → **Logs** → Email gönderme loglarını arayın:

✅ **Başarılı:**
- "Creating SMTP transporter with: host=..."
- "Email sent successfully: ..."

❌ **Hata:**
- "SMTP_HOST is not configured"
- "SMTP Connection Timeout"
- "SMTP Connection Refused"
- "SMTP Auth Failed"

### Adım 4: Environment Variables vs Database

Kod önce database'den okuyor, yoksa environment variable'dan alıyor:

```typescript
async function getSMTPSetting(key: string): Promise<string | undefined> {
    const setting = await prisma.systemSetting.findUnique({ where: { key } })
    return setting?.value || process.env[key]
}
```

**Çözüm:** Railway'de hem environment variables hem de database'de ayarlar olmalı.

## 🔍 Debug İçin

Railway Dashboard → **Logs** → Şu mesajları arayın:

```
Creating SMTP transporter with: host=..., port=..., secure=..., user=***
```

Eğer bu mesaj yoksa, SMTP ayarları bulunamıyor demektir.

## 📋 Kontrol Listesi

- [ ] `SMTP_HOST` variable'ı Railway'de ekli
- [ ] `SMTP_PORT` variable'ı Railway'de ekli (587 veya 465)
- [ ] `SMTP_USER` variable'ı Railway'de ekli
- [ ] `SMTP_PASS` variable'ı Railway'de ekli
- [ ] `SMTP_FROM` variable'ı Railway'de ekli (opsiyonel)
- [ ] `SMTP_SECURE` variable'ı Railway'de ekli (port'a göre)
- [ ] Database'de SMTP ayarları kayıtlı (admin panelden)
- [ ] Loglarda "Creating SMTP transporter" mesajı var

## ⚠️ Yaygın Sorunlar

### Sorun 1: Environment Variables Eksik
**Çözüm:** Railway Dashboard → Variables → SMTP variable'larını ekleyin

### Sorun 2: Port Yanlış
**Çözüm:** 
- Port 587 → `SMTP_SECURE = false`
- Port 465 → `SMTP_SECURE = true`

### Sorun 3: Database'de Ayarlar Yok
**Çözüm:** Admin panelden (`/admin/settings`) SMTP ayarlarını kaydedin

### Sorun 4: SMTP Server Railway'den Erişilemiyor
**Çözüm:** SMTP server'ın Railway'den erişilebilir olduğundan emin olun (firewall, IP whitelist)

---

**Not:** Railway loglarını kontrol ederek hangi hatanın oluştuğunu görebilirsiniz.

