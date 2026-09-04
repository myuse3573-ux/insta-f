import { NextRequest, NextResponse } from 'next/server';
import { processIncomingWebhookPayload } from '@/lib/instagram/messages';
import { verifyWebhookSignature } from '@/lib/instagram/webhook';

/**
 * GET Handler: Meta Webhook Challenge Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('[Webhook Verification Error] META_VERIFY_TOKEN is not configured in .env');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook Verified] Meta webhook subscription challenge verified successfully.');
    return new NextResponse(challenge || '', { status: 200 });
  } else {
    console.warn('[Webhook Verification Failed] Invalid verify token or mode mismatch.');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

/**
 * POST Handler: Meta Webhook Event Delivery with X-Hub-Signature-256 validation
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    if (appSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn('[Webhook Invalid Signature] Request signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const result = await processIncomingWebhookPayload(payload);

    return NextResponse.json({ status: 'success', ...result }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook POST Error]', error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 200 });
  }
}
