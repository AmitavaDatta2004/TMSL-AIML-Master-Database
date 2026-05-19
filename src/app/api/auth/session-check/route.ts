import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const validateEmailFormat = (email: string): boolean => {
  const cleanEmail = email.toLowerCase().trim();
  
  const approvedAdmins = [
    'amitava@gmail.com',
    'admin@tmsl-aiml.in',
    'prof@tmsl-aiml.in',
    'biswajit.tmsl27@gmail.com'
  ];
  
  if (approvedAdmins.includes(cleanEmail)) {
    return true;
  }
  
  return /^tmsl\.aiml27\.\d+[a-z]+@gmail\.com$/.test(cleanEmail);
};

export async function GET() {
  try {
    const session = await getServerSession();
    if (session && session.user) {
      if (!validateEmailFormat(session.user.email)) {
        return NextResponse.json({ user: null, error: "Unapproved email format" });
      }
      return NextResponse.json({ user: session.user });
    }
    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("Session check API error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
