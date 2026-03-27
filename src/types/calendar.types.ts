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
  attendee_count?: number;
  calendar_id: string;
  provider: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
  has_more?: boolean;
}

export interface CalendarSyncResponse {
  synced: number;
  skipped: number;
  failed: number;
  total_events: number;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  status: string;
  connected_at: string;
  last_sync_at?: string;
}

export interface CalendarConnectionsResponse {
  connections: CalendarConnection[];
}

export interface Calendar {
  id: string;
  name: string;
  primary?: boolean;
  sync_enabled?: boolean;
}

export interface CalendarListResponse {
  calendars: Calendar[];
  provider: string;
}

export interface ListCalendarEventsParams {
  connection_id?: string;
  calendar_id?: string;
  days?: number;
  limit?: number;
}

export interface SyncCalendarToMemoriesParams {
  connection_id: string;
  calendar_id?: string;
  days_past?: number;
  days_future?: number;
  space_id?: string;
  pii_level?: 'full' | 'minimal' | 'none';
  tags?: string[];
}
