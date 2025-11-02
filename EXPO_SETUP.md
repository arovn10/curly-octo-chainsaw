# Running NoshLog on Expo Go

## Current Status

✅ Dependencies installed  
🚀 Expo development server starting...

## How to Connect

### Option 1: Scan QR Code (Recommended)
1. Open the **Expo Go** app on your phone (download from App Store/Play Store if needed)
2. Wait for the QR code to appear in your terminal
3. Scan the QR code with:
   - **iOS**: Camera app (or Expo Go app)
   - **Android**: Expo Go app's scanner

### Option 2: Manual Connection
1. Make sure your phone and computer are on the **same Wi-Fi network**
2. In Expo Go app, tap "Enter URL manually"
3. Enter the URL shown in the terminal (usually something like `exp://192.168.x.x:8081`)

### Option 3: Development Build URL
The terminal should show:
- **Metro bundler** running on port 8081
- **QR code** for scanning
- **Network URL** for manual entry

## Troubleshooting

### Can't connect?
- Check firewall settings
- Ensure both devices are on same network
- Try using your computer's local IP address instead of localhost

### Backend API Not Working?
The mobile app expects the backend to be running at:
- Development: `http://localhost:3000/api`
- If testing on physical device, use your computer's local IP:
  - Mac: `ipconfig getifaddr en0` (usually `192.168.x.x`)
  - Update `mobile/src/api/client.ts` with the actual IP

### Update API URL for Physical Device
If testing on a physical device, update `mobile/src/api/client.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:3000/api'  // e.g., 'http://192.168.1.100:3000/api'
  : 'https://your-production-url.com/api';
```

## Next Steps

1. ✅ Expo server should be running
2. 📱 Open Expo Go on your phone
3. 📷 Scan the QR code
4. 🚀 App should load!

## Start Backend (Separate Terminal)

The mobile app needs the backend API running:

```bash
cd server
npm install
npm run dev
```

The backend should run on `http://localhost:3000`

