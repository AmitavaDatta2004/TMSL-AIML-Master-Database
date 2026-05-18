import { createAuthClient } from "@neondatabase/auth/next";

// Initialize the Neon Auth client
export const authClient = createAuthClient();

/**
 * Returns a mock session for development bypass when live auth is not connected.
 */
export function getDevMockSession() {
  if (typeof window === 'undefined') return null;
  const mockRole = window.localStorage.getItem('dev_mock_role');
  const mockEmail = window.localStorage.getItem('dev_mock_email');
  
  if (!mockRole || !mockEmail) return null;
  
  return {
    user: {
      email: mockEmail,
      name: mockRole === 'admin' ? 'Demo AIML Administrator' : 'Demo Student Account',
      image: null,
      role: mockRole
    },
    expires: new Date(Date.now() + 86400000).toISOString()
  };
}
