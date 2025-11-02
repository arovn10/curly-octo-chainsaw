# NoshLog - Home Cooked Meal Rating App 🍝

A Beli-style app for rating and ranking your home-cooked meals. Track ingredients, costs, time, and build your personal Top-N ranking.

## 🏗️ Project Structure

- `/server` - Next.js API backend with Prisma
- `/mobile` - React Native Expo mobile app

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (recommended)
- Expo CLI (`npm install -g expo-cli`)
- Prisma Accelerate account (you have the connection string)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in the root directory
   - Your DATABASE_URL with Accelerate is already in `.env`
   - Set `DIRECT_DATABASE_URL` if you have direct Postgres access for migrations

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run migrations** (if you have direct DB access):
   ```bash
   npm run prisma:migrate:dev
   ```

6. **Seed the database:**
   ```bash
   npm run db:seed
   ```

7. **Start the server:**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`

### Mobile App Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL:**
   - Edit `mobile/src/api/client.ts`
   - Update `API_BASE_URL` to point to your server (use your local IP for physical device testing)

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Test with Expo Go:**
   - Install Expo Go on your phone
   - Scan the QR code from the terminal
   - Make sure your phone and computer are on the same network

## 📱 Features

### ✅ Implemented (Beta)

- ✅ User registration
- ✅ Add meals with photos, ingredients, time, cost
- ✅ View meal list
- ✅ Rate meals (sentiment + scores)
- ✅ Pairwise comparisons for ranking
- ✅ Elo-based ranking system
- ✅ Top-N list (after 15 meals threshold)
- ✅ Recipe steps and instructions

### 🚧 Coming Soon

- [ ] Social features (follow, likes, comments)
- [ ] Recipe import from URLs
- [ ] Ingredient pricing integration
- [ ] Pantry tracking
- [ ] Advanced search and filters
- [ ] Cook mode with step-by-step timers
- [ ] Meal lists and collections

## 🔌 API Endpoints

### Health
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "name": "User Name"
  }
  ```

### Meals
- `GET /api/meals?userId=xxx` - Get user's meals
- `POST /api/meals` - Create new meal
- `GET /api/top?userId=xxx` - Get Top-N meals (after 15 meals)

### Ratings
- `POST /api/ratings` - Rate a meal
  ```json
  {
    "mealId": "uuid",
    "userId": "uuid",
    "sentiment": "LOVED",
    "taste": 9,
    "texture": 8,
    "difficulty": 5,
    "value": 7
  }
  ```

### Comparisons
- `GET /api/compare?userId=xxx` - Get random meals for comparison
- `POST /api/compare` - Submit pairwise comparison
  ```json
  {
    "userId": "uuid",
    "mealAId": "uuid",
    "mealBId": "uuid",
    "winnerId": "uuid"
  }
  ```

## 🗄️ Database

Uses Prisma with PostgreSQL via Prisma Accelerate.

### Key Models:
- **User** - User accounts
- **Meal** - Home-cooked meals with metadata
- **Recipe** - Recipe details with steps
- **MealIngredient** - Ingredients with pricing
- **Rating** - User ratings
- **EloRating** - Elo scores for ranking
- **PairwiseComparison** - Head-to-head comparisons

## 🧪 Testing

1. Start the backend server
2. Register a user via API or seed script
3. Create some meals via the mobile app
4. Rate meals and do comparisons
5. After 15 meals, check your Top-N ranking!

## 📝 Notes

- For local testing, update the API URL in `mobile/src/api/client.ts` to your computer's IP address
- The app uses Expo Go for easy testing without building
- Photos are stored locally for now; S3 integration coming soon
- Authentication is simplified for beta (no password hashing yet)

## 🎯 Next Steps

1. Add proper authentication (NextAuth.js or similar)
2. Implement S3 photo uploads
3. Add social features
4. Build recipe import from popular sites
5. Add ingredient pricing APIs
6. Implement cook mode interface

## 📄 License

MIT
