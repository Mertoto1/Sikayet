# LocalTunnel Şifre Sorunu Çözümü

## ⚠️ ÖNEMLİ: LocalTunnel Bug'ı

LocalTunnel şifre alanında "Please enter a valid IPv4 or IPv6 address" hatası veriyor. Bu bir bug'dır.

## ✅ ÇÖZÜM: Ngrok Kullanın (Önerilen)

LocalTunnel sorunlu olduğu için **ngrok kullanmanızı öneriyoruz**. Ngrok:
- ✅ Şifre gerektirmez
- ✅ Daha stabil
- ✅ Web arayüzü var
- ✅ Ücretsiz

**Detaylı kurulum için `NGROK_SETUP.md` dosyasına bakın!**

---

## LocalTunnel Alternatif Çözümler

Eğer yine de LocalTunnel kullanmak istiyorsanız:

## Çözüm 1: Terminal'de Şifreyi Bulun

Tunnel'ı başlattığınızda terminal'de şunu göreceksiniz:

```
your url is: https://smart-yaks-see.loca.lt
password: xyz123abc  <-- BU ŞİFREYİ KULLANIN
```

**Bu şifreyi kopyalayıp şifre alanına yapıştırın!**

---

## Çözüm 2: Tunnel'ı Yeniden Başlatın ve Şifreyi Not Alın

```bash
# Tunnel'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın
npm run tunnel

# Terminal'de şifreyi göreceksiniz, kopyalayın
```

---

## Çözüm 3: Ngrok Kullanın (Şifre Yok)

LocalTunnel şifre sorunu yaşıyorsanız, ngrok kullanabilirsiniz:

### Ngrok Kurulumu:

1. **Ngrok'u indirin:**
   - https://ngrok.com/download
   - Veya: `choco install ngrok` (Chocolatey ile)

2. **Ücretsiz hesap oluşturun:**
   - https://dashboard.ngrok.com/signup

3. **Auth token ekleyin:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

4. **Ngrok'u başlatın:**
   ```bash
   ngrok http 3000
   ```

5. **Ngrok şifre istemez, direkt çalışır!**

---

## Çözüm 4: Yerel Ağ Üzerinden Paylaşın

Aynı WiFi ağındaysanız, tunnel'a gerek yok:

1. **Sunucuyu başlatın:**
   ```bash
   npm run dev
   ```

2. **Terminal'de network URL'ini görün:**
   ```
   > Network access: http://192.168.1.100:3000
   ```

3. **Bu URL'yi arkadaşınızla paylaşın**
   - Sadece aynı WiFi ağındaki cihazlar erişebilir

---

## Hızlı Çözüm

**Şu anda yapmanız gerekenler:**

1. ✅ Tunnel'ı başlattığınız terminal penceresine bakın
2. ✅ "password:" yazan satırı bulun
3. ✅ Şifreyi kopyalayın
4. ✅ Tarayıcıdaki şifre alanına yapıştırın
5. ✅ "Continue" veya "Submit" butonuna tıklayın

**Eğer şifreyi göremiyorsanız:**
- Tunnel'ı durdurun (Ctrl+C)
- Tekrar başlatın: `npm run tunnel`
- Şifreyi hemen kopyalayın

---

## Örnek Terminal Çıktısı

```
PS C:\Users\...\Sikayet> npm run tunnel

> sikayet-mvp@0.1.0 tunnel
> npx localtunnel --port 3000

your url is: https://smart-yaks-see.loca.lt
password: abc123xyz456    <-- BU ŞİFREYİ KULLANIN

```

**Bu şifreyi (`abc123xyz456`) tarayıcıdaki şifre alanına girin!**

