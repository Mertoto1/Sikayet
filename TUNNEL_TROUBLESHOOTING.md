# Tunnel Sorun Giderme Rehberi

## 503 Service Unavailable Hatası

Bu hata genellikle şu nedenlerden kaynaklanır:

### 1. Sunucu Çalışmıyor

**Sorun:** `npm run dev` çalıştırılmamış olabilir.

**Çözüm:**
```bash
# Terminal 1'de sunucuyu başlatın
npm run dev

# Terminal'de şunu görmelisiniz:
# > Ready on http://localhost:3000
# > Network access: http://192.168.x.x:3000
```

**Kontrol:**
- Tarayıcıda `http://localhost:3000` adresine gidin
- Site açılıyorsa sunucu çalışıyor demektir

---

### 2. LocalTunnel İlk Bağlantı Güvenlik Sayfası

**Sorun:** LocalTunnel ilk bağlantıda bir güvenlik sayfası gösterir.

**Çözüm:**
1. Tunnel URL'sine ilk kez girdiğinizde bir sayfa göreceksiniz
2. Sayfada "Continue" veya "Click to Continue" butonuna tıklayın
3. Sonraki bağlantılarda direkt site açılacak

**Not:** Bu sadece ilk bağlantıda gereklidir. Her yeni tunnel URL'si için tekrar yapmanız gerekir.

---

### 3. Port 3000 Zaten Kullanılıyor

**Sorun:** Başka bir uygulama port 3000'i kullanıyor olabilir.

**Kontrol:**
```bash
# Windows PowerShell'de:
netstat -ano | findstr :3000

# Eğer bir sonuç görürseniz, o process'i kapatın veya farklı port kullanın
```

**Çözüm:**
```bash
# Farklı port kullanın (örnek: 3001)
PORT=3001 npm run dev

# Sonra tunnel'ı da o porta yönlendirin
npx localtunnel --port 3001
```

---

### 4. Windows Firewall Engellemesi

**Sorun:** Windows Firewall port 3000'i engelliyor olabilir.

**Çözüm:**
1. Windows Defender Firewall'u açın
2. "Gelen kurallar" bölümüne gidin
3. "Yeni kural" oluşturun
4. Port seçeneğini seçin
5. TCP ve port 3000'i seçin
6. Bağlantıya izin verin

---

### 5. LocalTunnel Bağlantı Sorunları

**Sorun:** LocalTunnel bağlantı kuramıyor.

**Çözüm:**
```bash
# Tunnel'ı yeniden başlatın
# Önce tunnel'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın
npx localtunnel --port 3000

# Alternatif olarak subdomain belirtebilirsiniz
npx localtunnel --port 3000 --subdomain my-test-site
```

---

### 6. Socket.IO Bağlantı Sorunları

**Sorun:** Socket.IO çalışmıyor veya bağlantı kuramıyor.

**Çözüm:**
`.env` dosyanıza tunnel URL'nizi ekleyin:
```
ALLOWED_ORIGINS=https://smart-yaks-see.loca.lt,http://localhost:3000
```

Sonra sunucuyu yeniden başlatın.

---

## Adım Adım Kontrol Listesi

✅ **Sunucu çalışıyor mu?**
```bash
# Terminal 1'de kontrol edin
npm run dev
# "Ready on http://localhost:3000" mesajını görmelisiniz
```

✅ **Localhost'ta site açılıyor mu?**
- Tarayıcıda `http://localhost:3000` adresine gidin
- Site açılıyorsa sunucu çalışıyor demektir

✅ **Tunnel çalışıyor mu?**
```bash
# Terminal 2'de kontrol edin
npm run tunnel
# "your url is: https://..." mesajını görmelisiniz
```

✅ **İlk bağlantı güvenlik sayfasını geçtiniz mi?**
- Tunnel URL'sine ilk kez girdiğinizde "Continue" butonuna tıklayın

✅ **Port 3000 kullanılabilir mi?**
```bash
# Windows'ta kontrol:
netstat -ano | findstr :3000
# Eğer sonuç varsa, o process'i kapatın
```

---

## Hızlı Test

```bash
# 1. Sunucuyu başlatın (Terminal 1)
npm run dev

# 2. Başka bir terminal'de localhost'u test edin
curl http://localhost:3000

# 3. Eğer HTML dönerse, sunucu çalışıyor demektir

# 4. Tunnel'ı başlatın (Terminal 2)
npm run tunnel

# 5. Tunnel URL'sini tarayıcıda açın
# 6. İlk bağlantıda "Continue" butonuna tıklayın
```

---

## Alternatif Çözümler

### Ngrok Kullanın

LocalTunnel çalışmıyorsa, ngrok deneyin:

```bash
# Ngrok'u indirin: https://ngrok.com/download
# Kurulum sonrası:
ngrok http 3000
```

### Yerel Ağ Üzerinden Erişim

Aynı WiFi ağındaysanız, tunnel'a gerek yok:

```bash
# Sunucuyu başlatın
npm run dev

# Terminal'de gösterilen network URL'ini kullanın
# Örnek: http://192.168.1.100:3000
```

---

## Hala Çalışmıyor mu?

1. Tüm terminal pencerelerini kapatın
2. Sunucuyu yeniden başlatın: `npm run dev`
3. Tunnel'ı yeniden başlatın: `npm run tunnel`
4. Yeni bir tunnel URL'si alın
5. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)
6. Yeni bir tarayıcı penceresi açın

