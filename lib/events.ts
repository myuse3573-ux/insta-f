import { EventEmitter } from 'events';

// Global singleton EventEmitter for real-time dashboard events (SSE stream)
const globalForEvents = global as unknown as { dashboardEvents: EventEmitter };

export const dashboardEvents =
  globalForEvents.dashboardEvents || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.dashboardEvents = dashboardEvents;
}

export default dashboardEvents;
