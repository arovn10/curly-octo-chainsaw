# 🚀 App is Running!

## Servers Started

### ✅ Backend Server
- **Port:** 3000
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health
- **Status:** Running in background

### ✅ Expo Mobile App
- **Port:** 8081 (or 8082 if 8081 is busy)
- **Status:** Running in background
- **QR Code:** Check terminal for QR code to scan with Expo Go

## How to Connect

1. **Open Expo Go** on your phone
2. **Scan the QR code** from the terminal
3. Make sure your phone and computer are on the **same Wi-Fi network**

## API Endpoints

- Health: `GET http://localhost:3000/api/health`
- Meals: `GET http://localhost:3000/api/meals`
- Register: `POST http://localhost:3000/api/auth/register`

## Troubleshooting

### Can't see QR code?
- Check the terminal where `expo start` is running
- Try restarting: `cd mobile && npx expo start --clear`

### Backend not responding?
- Check if server is running: `curl http://localhost:3000/api/health`
- Restart: `cd server && npm run dev`

### Phone can't connect?
- Make sure both devices are on same Wi-Fi
- For physical device, update API URL in `mobile/src/api/client.ts` to use your computer's IP instead of `localhost`

## New Features Added

✅ **Cooking Timer** - Track time while cooking in the "Add Meal" screen!
- Start/Pause/Stop timer
- Automatically fills Total Time field
- Great for accurately tracking how long recipes take

## Next Steps

1. Scan QR code with Expo Go
2. Test the cooking timer feature
3. Add some meals
4. Try the ranking system!

