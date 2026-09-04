import { NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/instagram/auth';

export async function GET() {
  try {
    const authUrl = getOAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[OAuth Login Error]', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Instagram OAuth login' },
      { status: 500 }
    );
  }
}
