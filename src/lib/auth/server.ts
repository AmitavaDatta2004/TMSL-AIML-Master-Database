import { createNeonAuth } from '@neondatabase/auth/next/server';
import { cookies } from 'next/headers';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

// In production, cookie secret MUST be set — fail loudly rather than use a predictable fallback
if (!cookieSecret && process.env.NODE_ENV === 'production') {
  throw new Error("FATAL: NEON_AUTH_COOKIE_SECRET environment variable is not set. Refusing to start with an insecure configuration.");
}

if (!baseUrl) {
  console.warn("NEON_AUTH_BASE_URL is not set. Authentication will fail.");
}

const trustedOrigins = [
  'http://localhost:3000',
  'https://tmslaimlmasterdatabase.vercel.app',
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
].filter(Boolean);

process.env.BETTER_AUTH_TRUSTED_ORIGINS = trustedOrigins.join(',');
process.env.BETTER_AUTH_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tmslaimlmasterdatabase.vercel.app');

// Always initialize Neon Auth server instance so the API route never returns 404
export const auth = createNeonAuth({
  baseUrl: baseUrl as string,
  cookies: {
    secret: cookieSecret || "dev-only-insecure-fallback-key-do-not-use-in-prod",
  },
});

/**
 * Gets the current active session on the server.
 * Dev bypass cookies are ONLY honoured in development (NODE_ENV === 'development').
 */
export async function getServerSession() {
  // 1. Check for active Neon Auth session
  if (auth) {
    try {
      const session = await auth.getSession();
      if (session && session.data && session.data.user) {
        const dbRole = (session.data.user as any).role;
        const isAuthAdmin = dbRole === 'admin' || dbRole === 'administrator';

        return {
          user: {
            ...session.data.user,
            role: isAuthAdmin ? 'admin' : 'student'
          }
        };
      }
    } catch (e) {
      console.error("Neon Auth getSession error:", e);
    }
  }

  // 2. Dev Bypass Cookie — ONLY active in local development, NEVER in production
  if (process.env.NODE_ENV === 'development') {
    const cookieStore = await cookies();
    const devEmail = cookieStore.get('dev_mock_email')?.value;
    const devRole = cookieStore.get('dev_mock_role')?.value;

    if (devEmail && devRole) {
      console.warn("[DEV ONLY] Using dev mock session bypass. This is disabled in production.");
      return {
        user: {
          email: devEmail,
          name: devRole === 'admin' ? 'Demo AIML Administrator' : 'Demo Student Account',
          image: null,
          role: devRole
        }
      };
    }
  }

  return null;
}
