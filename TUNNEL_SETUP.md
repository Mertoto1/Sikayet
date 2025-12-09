# Dış Erişim Kurulumu (Tunnel Setup)

Bu dosya, localhost'ta çalışan uygulamanızı internet üzerinden erişilebilir hale getirmek için gereken adımları açıklar.

## Yöntem 1: LocalTunnel (Önerilen - Ücretsiz ve Kolay)

LocalTunnel, herhangi bir kayıt gerektirmeden kullanabileceğiniz ücretsiz bir servistir.

### Kurulum ve Kullanım:

1. **Sunucuyu başlatın:**
   ```bash
   npm run dev
   ```

2. **Yeni bir terminal penceresi açın ve tunnel'ı başlatın:**
   ```bash
   npm run tunnel
   ```

3. **Terminal'de bir URL ve ŞİFRE göreceksiniz, örneğin:**
   ```
   your url is: https://random-name.loca.lt
   password: abc123xyz
   ```
   
   **ÖNEMLİ:** Şifreyi kopyalayın! İlk bağlantıda bu şifreyi girmeniz gerekecek.

4. **İlk bağlantıda:**
   - URL'ye girdiğinizde bir şifre sayfası göreceksiniz
   - Terminal'de gösterilen şifreyi girin
   - "Continue" veya "Submit" butonuna tıklayın
   - Sonraki bağlantılarda şifre gerekmeyecek

5. **Bu URL'yi ve şifreyi arkadaşınızla paylaşın!**

### Avantajları:
- ✅ Ücretsiz
- ✅ Kayıt gerektirmez
- ✅ Kolay kurulum
- ✅ Otomatik HTTPS

### Dezavantajları:
- ⚠️ Her başlatmada farklı URL alırsınız
- ⚠️ İlk bağlantıda bir güvenlik sayfası gösterir - "Continue" butonuna tıklamanız gerekir
- ⚠️ Eğer 503 hatası alırsanız, sunucunun çalıştığından emin olun (`npm run dev`)

---

## Yöntem 2: Ngrok (Daha Stabil)

Ngrok daha stabil bir çözümdür ancak ücretsiz planında bazı kısıtlamalar vardır.

### Kurulum:

1. **Ngrok'u indirin:**
   - https://ngrok.com/download adresinden indirin
   - Veya Windows için: `choco install ngrok` (Chocolatey ile)
   - Veya `scoop install ngrok` (Scoop ile)

2. **Ngrok hesabı oluşturun:**
   - https://dashboard.ngrok.com/signup adresinden ücretsiz hesap oluşturun
   - Auth token'ınızı alın

3. **Ngrok'u yapılandırın:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Kullanım:

1. **Sunucuyu başlatın:**
   ```bash
   npm run dev
   ```

2. **Yeni bir terminal penceresi açın ve ngrok'u başlatın:**
   ```bash
   ngrok http 3000
   ```

3. **Terminal'de bir URL göreceksiniz, örneğin:**
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
   ```

4. **Bu URL'yi arkadaşınızla paylaşın!**

### Avantajları:
- ✅ Daha stabil
- ✅ Sabit URL seçeneği (ücretli plan)
- ✅ Web arayüzü ile trafik izleme

### Dezavantajları:
- ⚠️ Kayıt gerektirir
- ⚠️ Ücretsiz planında URL her seferinde değişir

---

## Yöntem 3: Yerel Ağ Üzerinden Erişim (Aynı WiFi)

Eğer arkadaşınız aynı WiFi ağındaysa, ngrok veya tunnel kullanmadan erişebilirsiniz.

### Kullanım:

1. **Sunucuyu başlatın:**
   ```bash
   npm run dev
   ```

2. **Terminal'de gösterilen network URL'ini kullanın:**
   ```
   > Network access: http://192.168.1.100:3000
   ```

3. **Bu URL'yi arkadaşınızla paylaşın!**

### Notlar:
- ⚠️ Sadece aynı WiFi ağındaki cihazlar erişebilir
- ⚠️ Güvenlik duvarı ayarlarını kontrol edin
- ⚠️ Windows Firewall port 3000'i açmanız gerekebilir

---

## Güvenlik Notları

⚠️ **ÖNEMLİ:** Tunnel kullanırken:
- Sadece güvendiğiniz kişilerle URL paylaşın
- Test sırasında hassas veriler kullanmayın
- Tunnel'ı kullanmadığınızda kapatın
- Production ortamında asla tunnel kullanmayın!

---

## Sorun Giderme

### Port 3000 zaten kullanılıyor:
```bash
# Farklı bir port kullanın
PORT=3001 npm run dev
# Sonra tunnel'ı da o porta yönlendirin
npx localtunnel --port 3001
```

### Socket.IO bağlantı sorunları:
- `.env` dosyanıza `ALLOWED_ORIGINS` ekleyin:
  ```
  ALLOWED_ORIGINS=https://your-tunnel-url.loca.lt,https://your-ngrok-url.ngrok-free.app
  ```

### Windows Firewall sorunları:
1. Windows Defender Firewall'u açın
2. "Gelen kurallar" bölümüne gidin
3. Port 3000 için yeni bir kural ekleyin

---

## Hızlı Başlangıç (Özet)

```bash
# Terminal 1: Sunucuyu başlat
npm run dev

# Terminal 2: Tunnel'ı başlat
npm run tunnel

# URL'yi kopyalayıp paylaşın!
```

