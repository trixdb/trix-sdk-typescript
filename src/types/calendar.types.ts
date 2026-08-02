/**
 * Calendar resource types (ADR-075).
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
  description?: string;
  attendeeCount?: number;
  calendarId: string;
  provider: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
  hasMore?: boolean;
}

export interface CalendarSyncResponse {
  synced: number;
  skipped: number;
  failed: number;
  totalEvents: number;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  status: string;
  connectedAt: string;
  lastSyncAt?: string;
}

export interface CalendarConnectionsResponse {
  connections: CalendarConnection[];
}

export interface Calendar {
  id: string;
  name: string;
  primary?: boolean;
  syncEnabled?: boolean;
}

export interface CalendarListResponse {
  calendars: Calendar[];
  provider: string;
}

export interface ListCalendarEventsParams {
  connectionId?: string;
  calendarId?: string;
  days?: number;
  limit?: number;
}

export interface SyncCalendarToMemoriesParams {
  connectionId: string;
  calendarId?: string;
  daysPast?: number;
  daysFuture?: number;
  spaceId?: string;
  piiLevel?: 'full' | 'minimal' | 'none';
  tags?: string[];
}
