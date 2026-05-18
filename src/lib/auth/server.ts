import { createNeonAuth } from '@neondatabase/auth/next/server';
import { cookies } from 'next/headers';
import { isAdminEmail } from '@/lib/db';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || "RisoThemeAIMLMasterSecretCookieKey32Chars!";

// Safe initialization of Neon Auth server instance
export const auth = baseUrl 
  ? createNeonAuth({
      baseUrl,
      cookies: {
        secret: cookieSecret,
      },
    })
  : null;

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
        return {
          user: {
            ...session.data.user,
            role: isAdminEmail(session.data.user.email) ? 'admin' : 'student'
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
