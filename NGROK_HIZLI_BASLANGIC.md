# Ngrok Hızlı Başlangıç

## 1. Token Ekle
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```
Token'ı buradan al: https://dashboard.ngrok.com/get-started/your-authtoken

## 2. Sunucuyu Başlat
```bash
npm run dev
```

## 3. Ngrok'u Başlat (Yeni Terminal)
```bash
ngrok http 3000
```

## 4. URL'yi Kopyala
Terminal'de göreceksin:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

Bu URL'yi arkadaşınla paylaş! 🎉

---

## Sorun mu var?
- Token eklemedin mi? → `ngrok config add-authtoken TOKEN`
- Port 3000 kullanılıyor mu? → `ngrok http 3001` (veya başka port)
- Ngrok bulunamıyor mu? → PATH'e ekle veya tam yol ile çalıştır

