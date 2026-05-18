import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (session && session.user) {
      return NextResponse.json({ user: session.user });
    }
    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("Session check API error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
