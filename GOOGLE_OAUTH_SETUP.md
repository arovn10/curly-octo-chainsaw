# Google OAuth Setup ✅

Your Google OAuth credentials have been added to `.env.local`!

## What's Configured

- ✅ **Client ID**: `229397108898-ec15pt0tvo600lmpm5bilolcnurrmftb.apps.googleusercontent.com`
- ✅ **Client Secret**: Added to `.env.local`
- ✅ NextAuth Google provider enabled

## Important: OAuth Redirect URI

Make sure your Google OAuth app has this authorized redirect URI configured:

```
http://localhost:3000/api/auth/callback/google
```

For production, also add:
```
https://yourdomain.com/api/auth/callback/google
```

## How to Configure Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google`
6. Click **Save**

## Testing

1. Start your dev server:
   ```bash
   cd server
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Click **"Sign in with Google"**

4. You should be redirected to Google's sign-in page

5. After signing in, you'll be redirected back and logged in!

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Cloud Console exactly matches:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - No trailing slashes!

**Error: "invalid_client"**
- Double-check your Client ID and Secret in `.env.local`
- Make sure there are no extra spaces or quotes

**Not seeing "Sign in with Google" button?**
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
- Restart your dev server after adding env vars

## Next Steps

Once Google OAuth is working, you can:
1. Add Apple OAuth (if needed)
2. Configure email magic links (optional)
3. Customize the sign-in page styling
4. Add profile picture/name display after sign-in

