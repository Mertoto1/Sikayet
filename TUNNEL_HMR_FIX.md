# Tunnel HMR Hatası Çözümü

## Sorun
Tunnel üzerinden erişirken Next.js HMR (Hot Module Replacement) hatası alıyorsunuz.

## Hızlı Çözüm: Ngrok Kullanın

Ngrok daha stabil ve bu sorunu yaşamaz:

```bash
# 1. Token ekle
ngrok config add-authtoken YOUR_TOKEN

# 2. Sunucuyu başlat (Terminal 1)
npm run dev

# 3. Ngrok'u başlat (Terminal 2)
ngrok http 3000
```

## Alternatif: LocalTunnel Kullanırken

Eğer LocalTunnel kullanmak istiyorsanız:

1. **Sunucuyu yeniden başlatın** (Ctrl+C ile durdurun, sonra tekrar başlatın)
2. **Tunnel'ı başlatın**
3. **Tarayıcıda tunnel URL'sini açın**
4. **HMR hatası görürseniz, sayfayı yenileyin (F5)**

HMR hatası genellikle sadece ilk yüklemede olur, sayfa yenilendikten sonra çalışır.

## Kalıcı Çözüm

`.env` dosyanıza tunnel URL'nizi ekleyin:

```
NEXT_PUBLIC_APP_URL=https://your-tunnel-url.loca.lt
```

Sonra sunucuyu yeniden başlatın.

