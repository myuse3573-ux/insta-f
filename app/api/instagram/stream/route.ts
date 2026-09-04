import { NextRequest } from 'next/server';
import dashboardEvents from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          // Stream controller closed
        }
      };

      const handleMessageReceived = (data: any) => {
        sendEvent('message_received', data);
      };

      const handleMessageSent = (data: any) => {
        sendEvent('message_sent', data);
      };

      dashboardEvents.on('message_received', handleMessageReceived);
      dashboardEvents.on('message_sent', handleMessageSent);

      // Keep-alive ping interval every 20s
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 20000);

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        dashboardEvents.off('message_received', handleMessageReceived);
        dashboardEvents.off('message_sent', handleMessageSent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
