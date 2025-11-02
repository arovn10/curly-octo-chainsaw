# NextAuth v4 Setup Complete ✅

Full NextAuth + Prisma integration is now complete following the provided scaffold!

## What's Integrated

- ✅ NextAuth v4.24.7 with Prisma Adapter
- ✅ Database sessions (not JWT)
- ✅ Google OAuth provider (optional)
- ✅ Apple OAuth provider (optional)
- ✅ Email magic links (optional)
- ✅ Protected API routes (`/api/private/*`)
- ✅ Session provider in app layout
- ✅ Auth UI components
- ✅ Custom sign-in page
- ✅ Middleware for route protection

## Files Created/Updated

### Core Auth
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/prisma.ts` - Prisma client with Accelerate extension
- `app/api/auth/[...nextauth]/route.ts` - Auth route handler

### UI Components
- `src/components/NextAuthProvider.tsx` - Session provider wrapper
- `src/components/AuthButtons.tsx` - Sign in/out buttons
- `app/signin/page.tsx` - Custom sign-in page

### Protected Routes
- `app/api/private/me/route.ts` - Example protected endpoint
- `src/middleware.ts` - Protects `/api/private/*` routes

### Database
- `prisma/schema.prisma` - Updated with NextAuth models (Account, Session, VerificationToken)

## Environment Variables

Add these to `.env.local`:

```env
# Required
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"  # Generate: openssl rand -base64 32

# Optional OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

APPLE_CLIENT_ID=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Optional Email Provider
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Copy Client ID and Secret to `.env.local`

### Apple OAuth

1. Create Services ID in Apple Developer Portal
2. Configure redirect URI:
   ```
   http://localhost:3000/api/auth/callback/apple
   ```
3. Create private key for Sign in with Apple
4. Add credentials to `.env.local`

## Running

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations (when you have DIRECT_DATABASE_URL set)
npm run prisma:migrate:dev

# Start dev server
npm run dev
```

## Testing

1. Visit `http://localhost:3000`
2. Click "Sign in with Google" (or Apple, or use Magic Link)
3. After sign-in, test protected route: `GET /api/private/me`
4. Should return your user profile

## API Usage

### Client-Side (React)

```tsx
import { useSession, signIn, signOut } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <button onClick={() => signIn()}>Sign in</button>;

  return (
    <>
      <p>Signed in as {session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  );
}
```

### Server-Side (API Routes)

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Access session.user.id, session.user.email, etc.
  return NextResponse.json({ user: session.user });
}
```

## Protected Routes

Routes under `/api/private/*` are automatically protected by middleware.

To protect other routes, check session manually:

```ts
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

## Database Schema

NextAuth adds these tables:
- `Account` - OAuth accounts linked to users
- `Session` - Active user sessions
- `VerificationToken` - Email verification tokens

All models use UUID primary keys and integrate with your existing User model.

## Next Steps

1. Add OAuth credentials for Google/Apple if needed
2. Configure email provider if using magic links
3. Customize sign-in page styling
4. Add role-based access control if needed
5. Update mobile app to use session cookies for API calls

