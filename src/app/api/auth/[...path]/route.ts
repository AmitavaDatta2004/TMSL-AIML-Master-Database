import { auth } from '@/lib/auth/server';

export const { GET, POST } = auth ? auth.handler() : { GET: () => {}, POST: () => {} };
