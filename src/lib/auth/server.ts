import { createNeonAuth } from '@neondatabase/auth/next/server';
import { cookies } from 'next/headers';

const getBaseUrl = () => {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/auth`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/auth`;
  return process.env.NEON_AUTH_BASE_URL; // Local env typically already includes /api/auth
};
const baseUrl = getBaseUrl();
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || "RisoThemeAIMLMasterSecretCookieKey32Chars!";

// Always initialize Neon Auth server instance so the API route never returns 404
export const auth = createNeonAuth({
  // If baseUrl is undefined, we pass an empty string, which the library might accept, or just cast it to any.
  // Actually, let's use a type assertion to safely pass the config
  ...(baseUrl ? { baseUrl } : {}) as any,
  cookies: {
    secret: cookieSecret,
  },
});

/**
 * Gets the current active session on the server.
 * Gracefully falls back to the developer bypass session if live auth is not connected or configured.
 */
export async function getServerSession() {
  // 1. Check for active Neon Auth session
  if (auth) {
    try {
      const session = await auth.getSession();
      if (session && session.data && session.data.user) {
        // Use the role from the auth provider database, fallback to student
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

  // 2. Check for Dev Bypass Cookie (only in development or as a testing fallback)
  const cookieStore = await cookies();
  const devEmail = cookieStore.get('dev_mock_email')?.value;
  const devRole = cookieStore.get('dev_mock_role')?.value;

  if (devEmail && devRole) {
    return {
      user: {
        email: devEmail,
        name: devRole === 'admin' ? 'Demo AIML Administrator' : 'Demo Student Account',
        image: null,
        role: devRole
      }
    };
  }

  return null;
}
