/**
 * Calendar resource (ADR-075).
 */

import type { Trix } from '../client.js';
import type {
  CalendarEventsResponse,
  CalendarSyncResponse,
  CalendarConnectionsResponse,
  CalendarListResponse,
  ListCalendarEventsParams,
  SyncCalendarToMemoriesParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class CalendarResource extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /** List upcoming calendar events. */
  async listEvents(options?: ListCalendarEventsParams): Promise<CalendarEventsResponse> {
    return this.request<CalendarEventsResponse>({
      method: 'GET',
      path: '/calendar/events',
      params: options ? buildParams(options) : undefined,
    });
  }

  /** Sync calendar events to memories. */
  async syncToMemories(options: SyncCalendarToMemoriesParams): Promise<CalendarSyncResponse> {
    return this.request<CalendarSyncResponse>({
      method: 'POST',
      path: '/calendar/sync',
      body: buildParams(options),
    });
  }

  /** List calendar connections. */
  async listConnections(): Promise<CalendarConnectionsResponse> {
    return this.request<CalendarConnectionsResponse>({
      method: 'GET',
      path: '/calendar/connections',
    });
  }

  /** List calendars for a connection. */
  async listCalendars(connectionId: string): Promise<CalendarListResponse> {
    validateId(connectionId, 'connection');
    return this.request<CalendarListResponse>({
      method: 'GET',
      path: `/calendar/connections/${connectionId}/calendars`,
    });
  }
}
