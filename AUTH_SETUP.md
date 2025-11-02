# Auth.js Setup ✅

Authentication is now integrated using [Auth.js (NextAuth v5)](https://authjs.dev/getting-started/installation?framework=Next.js)!

## What's Configured

- ✅ NextAuth v5 (next-auth@beta) installed
- ✅ Prisma adapter for database sessions
- ✅ Credentials provider (simplified for beta)
- ✅ JWT session strategy
- ✅ Auth API routes
- ✅ Protected API endpoints
- ✅ Database tables: Account, Session, VerificationToken

## Authentication Flow

### Backend

1. **Registration**: `POST /api/auth/register`
   ```json
   {
     "username": "user123",
     "email": "user@example.com",
     "name": "User Name"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "username": "user123",
     "email": "user@example.com"
   }
   ```

3. **Get Session**: `GET /api/auth/session`
   - Returns current user session

4. **Auth Endpoints**: `/api/auth/*` (handled by NextAuth)
   - `/api/auth/signin`
   - `/api/auth/signout`
   - `/api/auth/callback/*`

### Mobile App Integration

The mobile app needs to:
1. Store session cookies/tokens
2. Include auth headers in API requests
3. Handle session refresh

## Protected Routes

API endpoints now automatically check authentication:
- `/api/meals` - requires session
- `/api/ratings` - requires session  
- `/api/compare` - requires session
- `/api/top` - requires session

## Database Schema

Auth.js tables added:
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

## Environment Variables

Required in `.env.local`:
```env
AUTH_SECRET=your-secret-key  # Generated automatically
```

## Next Steps for Mobile

1. **Add auth context to mobile app**
2. **Store session token** (cookies or AsyncStorage)
3. **Include auth headers** in API requests
4. **Handle login/register screens**
5. **Auto-refresh sessions**

## Beta Notes

- Password authentication is simplified (no password check yet)
- Sessions use JWT (no database session required)
- Can add OAuth providers later (Google, GitHub, etc.)

## Adding OAuth Providers

To add Google OAuth:
```typescript
import Google from "next-auth/providers/google";

providers: [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
]
```

## Testing

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'

# Get session (with cookies from login)
curl http://localhost:3000/api/auth/session
```

## Reference

- [Auth.js Docs](https://authjs.dev/getting-started/installation?framework=Next.js)
- [NextAuth Prisma Adapter](https://authjs.dev/reference/adapter/prisma)

