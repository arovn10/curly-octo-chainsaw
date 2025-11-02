# 🚀 Getting the App Running

## Current Status

✅ **Mobile App (Expo):** Running on port 8081/8082  
⏳ **Backend Server:** Needs environment setup

## Quick Start

### 1. Setup Backend Environment

The backend needs environment variables. Create `server/.env`:

```bash
cd server
```

Create a `.env` file with:
```env
# Database (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# S3 (if you have it)
S3_ACCESS_KEY_ID="your-key"
S3_SECRET_ACCESS_KEY="your-secret"
S3_REGION="us-east-1"
S3_BUCKET_UPLOADS="homecookmealsapp"
```

### 2. Generate Prisma Client

```bash
cd server
npm run prisma:generate
```

### 3. Start Backend

```bash
npm run dev
```

Should see: `Ready on http://localhost:3000`

### 4. Connect Mobile App

1. **If backend is running:**
   - The Expo QR code should already be visible
   - Open **Expo Go** on your phone
   - Scan the QR code

2. **If you need to restart Expo:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

## Quick Test

1. ✅ Check backend: `curl http://localhost:3000/api/health`
2. ✅ Check Expo: Look for QR code in terminal
3. ✅ Scan QR code with Expo Go
4. ✅ Test the cooking timer feature!

## Troubleshooting

### Backend won't start?
- Check `.env` file exists in `server/`
- Run `npm run prisma:generate` first
- Check for error messages in terminal

### Can't connect from phone?
- Make sure both devices are on same Wi-Fi
- Update `mobile/src/api/client.ts` to use your computer's IP instead of `localhost`
- Find your IP: `ipconfig getifaddr en0` (Mac)

### Expo not showing QR code?
- Check if port 8081 is available
- Try: `npx expo start --clear --port 8082`

## What's Running Now

- ✅ Expo server: Running (PID 70651)
- ⏳ Backend: Needs `.env` file setup

Once you add the `.env` file to `server/`, the backend will start automatically!

