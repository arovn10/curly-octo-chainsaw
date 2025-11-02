# NoshLog Beta - Setup Instructions

## ✅ What's Built

Your beta app is ready! Here's what's included:

### Backend (Next.js + Prisma Accelerate)
- ✅ Complete database schema with all models
- ✅ API routes: meals, ratings, comparisons, auth, top meals
- ✅ Elo ranking system for meal comparisons
- ✅ Top-N list feature (gates at 15 meals)
- ✅ Seed script with demo data

### Mobile App (React Native + Expo)
- ✅ Home screen with meal list
- ✅ Add meal screen with full form
- ✅ Navigation setup
- ✅ API client configured
- ✅ Photo picker integration

## 🚀 Getting Started

### 1. Backend

```bash
cd server
npm install
npm run prisma:generate
npm run dev
```

The server will run on `http://localhost:3000`

**Note:** You'll need to run migrations when you have direct DB access. For now, Prisma Accelerate will handle the connection.

### 2. Mobile App

```bash
cd mobile
npm install
```

**IMPORTANT:** Update the API URL in `mobile/src/api/client.ts`:
- For iOS Simulator: `http://localhost:3000/api`
- For Physical Device: `http://YOUR_COMPUTER_IP:3000/api`

Find your IP:
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

Then start Expo:
```bash
npm start
```

Scan the QR code with Expo Go app on your phone.

## 📋 Testing Checklist

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","name":"Test User"}'
   ```

2. **Get the user ID from response, then:**
   - Open the mobile app
   - Add a few meals (update userId in the code or add auth)
   - Rate some meals
   - Do pairwise comparisons
   - After 15 meals, check `/api/top?userId=xxx`

3. **Test API endpoints:**
   - `GET http://localhost:3000/api/health`
   - `GET http://localhost:3000/api/meals?userId=xxx`

## 🔧 Configuration

### Environment Variables

The `.env` file in the root has your Accelerate connection string already set.

If you need direct Postgres access for migrations:
```env
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
```

### Mobile API Configuration

Edit `mobile/src/api/client.ts` and update:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_IP:3000/api'  // Change this!
  : 'https://your-production-url.com/api';
```

## 🎯 Current Limitations (Beta)

- Authentication is simplified (no passwords yet)
- Photos stored locally (S3 integration needed for production)
- No recipe import from URLs yet
- Social features partially implemented
- User ID hardcoded in mobile app (add auth context)

## 📱 Next Steps to Complete Beta

1. Add user authentication context to mobile app
2. Implement proper user ID management
3. Add rating screen in mobile app
4. Add comparison screen for pairwise voting
5. Add top meals screen
6. Test end-to-end flow

## 🐛 Troubleshooting

**Server won't start:**
- Check Node version (needs 20+)
- Make sure `.env` has DATABASE_URL
- Run `npm run prisma:generate` first

**Mobile app can't connect:**
- Check API_BASE_URL is correct
- Make sure server is running
- Check firewall isn't blocking connections
- For physical device: use your computer's IP, not localhost

**Prisma errors:**
- Run `npm run prisma:generate` again
- Check schema file exists at `server/prisma/schema.prisma`

## 📞 Need Help?

The app structure is ready! Just:
1. Start the backend
2. Start the mobile app
3. Test the flow
4. Iterate on features

Happy cooking! 🍝

