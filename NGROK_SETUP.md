# Ngrok Kurulumu (Önerilen - Şifre Sorunu Yok)

LocalTunnel şifre sorunu yaşıyorsanız, ngrok kullanın. Ngrok daha stabil ve şifre gerektirmez.

## Hızlı Kurulum

### 1. Ngrok'u İndirin

**Windows için:**
- https://ngrok.com/download adresinden indirin
- ZIP dosyasını açın
- `ngrok.exe` dosyasını bir klasöre koyun (örnek: `C:\ngrok\`)

**Veya Chocolatey ile:**
```bash
choco install ngrok
```

**Veya Scoop ile:**
```bash
scoop install ngrok
```

### 2. Ücretsiz Hesap Oluşturun

1. https://dashboard.ngrok.com/signup adresine gidin
2. Ücretsiz hesap oluşturun (Email ile kayıt olun)
3. Giriş yapın

### 3. Auth Token'ı Ekleyin

1. Dashboard'da "Your Authtoken" bölümüne gidin
2. Token'ı kopyalayın
3. Terminal'de şunu çalıştırın:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Örnek:**
```bash
ngrok config add-authtoken 2abc123xyz456def789ghi012jkl345mno
```

### 4. Ngrok'u Başlatın

```bash
# Sunucuyu başlatın (Terminal 1)
npm run dev

# Ngrok'u başlatın (Terminal 2)
ngrok http 3000
```

### 5. URL'yi Kullanın

Terminal'de şunu göreceksiniz:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Bu URL'yi (`https://abc123.ngrok-free.app`) arkadaşınızla paylaşın!**

**Avantajları:**
- ✅ Şifre gerektirmez
- ✅ Daha stabil
- ✅ Web arayüzü ile trafik izleme (http://127.0.0.1:4040)
- ✅ Ücretsiz

---

## Ngrok Web Arayüzü

Ngrok başladığında, tarayıcıda şu adrese gidin:
```
http://127.0.0.1:4040
```

Burada:
- Tüm HTTP isteklerini görebilirsiniz
- Request/Response detaylarını inceleyebilirsiniz
- Debug için çok kullanışlıdır

---

## Sabit URL (Opsiyonel - Ücretli)

Ücretsiz planda her başlatmada farklı URL alırsınız. Sabit URL istiyorsanız:
- Ngrok'un ücretli planını satın alın
- Veya her seferinde aynı subdomain'i kullanın (ücretsiz planda sınırlı)

---

## Sorun Giderme

### "ngrok: command not found" hatası

**Windows'ta:**
- Ngrok'u PATH'e ekleyin veya tam yol ile çalıştırın:
```bash
C:\ngrok\ngrok.exe http 3000
```

**Veya ngrok klasörünü PATH'e ekleyin:**
1. Windows Ayarlar > Sistem > Gelişmiş Sistem Ayarları
2. Ortam Değişkenleri
3. Path'e ngrok klasörünü ekleyin

### "authtoken" hatası

```bash
ngrok config add-authtoken YOUR_TOKEN
```
komutunu çalıştırdığınızdan emin olun.

### Port zaten kullanılıyor

```bash
# Farklı port kullanın
ngrok http 3001
```

---

## Hızlı Başlangıç Özeti

```bash
# 1. Ngrok'u indirin ve kurun
# https://ngrok.com/download

# 2. Token ekleyin
ngrok config add-authtoken YOUR_TOKEN

# 3. Sunucuyu başlatın (Terminal 1)
npm run dev

# 4. Ngrok'u başlatın (Terminal 2)
ngrok http 3000

# 5. URL'yi paylaşın!
```

---

## LocalTunnel vs Ngrok

| Özellik | LocalTunnel | Ngrok |
|---------|-------------|-------|
| Şifre | ✅ Var (sorunlu) | ❌ Yok |
| Kurulum | Kolay | Orta |
| Stabilite | Orta | Yüksek |
| Web Arayüzü | ❌ | ✅ |
| Ücretsiz | ✅ | ✅ |

**Sonuç:** Ngrok daha iyi bir seçenek! 🎯

