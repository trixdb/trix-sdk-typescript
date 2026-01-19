/**
 * Billing helper utilities for building request parameters.
 *
 * These helpers ensure consistent parameter handling across billing operations.
 */

import type {
  GetTransactionsOptions,
  GetUsageHistoryOptions,
  GetCostsOptions,
  GetAuditLogOptions,
  ListInvoicesOptions,
  UpgradeOptions,
  CancelOptions,
  PauseOptions,
  PurchaseCreditsOptions,
  UpdateNotificationPreferencesOptions,
  BillingPeriod,
} from './billing.types.js';

/**
 * Build request body for subscription upgrade.
 */
export function buildUpgradeBody(
  plan: string,
  period: BillingPeriod,
  options?: UpgradeOptions
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    plan,
    billing_period: period,
  };
  if (options?.successUrl) {
    body.success_url = options.successUrl;
  }
  return body;
}

/**
 * Build request body for subscription cancellation.
 */
export function buildCancelBody(options?: CancelOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    immediately: options?.immediately ?? false,
  };
  if (options?.reason) {
    body.reason = options.reason;
  }
  return body;
}

/**
 * Build request body for subscription pause.
 */
export function buildPauseBody(options?: PauseOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (options?.reason) {
    body.reason = options.reason;
  }
  return body;
}

/**
 * Build query params for transactions endpoint.
 */
export function buildTransactionsParams(options?: GetTransactionsOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (options?.limit !== undefined) params.limit = options.limit;
  if (options?.offset !== undefined) params.offset = options.offset;
  if (options?.type !== undefined) params.type = options.type;
  if (options?.actionType !== undefined) params.action_type = options.actionType;
  return params;
}

/**
 * Build query params for usage history endpoint.
 */
export function buildUsageHistoryParams(options?: GetUsageHistoryOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (options?.limit !== undefined) params.limit = options.limit;
  return params;
}

/**
 * Build query params for costs endpoint.
 */
export function buildCostsParams(options?: GetCostsOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (options?.actionType !== undefined) params.action_type = options.actionType;
  if (options?.provider !== undefined) params.provider = options.provider;
  return params;
}

/**
 * Build query params for audit log endpoint.
 */
export function buildAuditLogParams(options?: GetAuditLogOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (options?.limit !== undefined) params.limit = options.limit;
  if (options?.offset !== undefined) params.offset = options.offset;
  if (options?.action !== undefined) params.action = options.action;
  return params;
}

/**
 * Build query params for invoices endpoint.
 */
export function buildInvoicesParams(options?: ListInvoicesOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (options?.limit !== undefined) params.limit = options.limit;
  if (options?.page !== undefined) params.page = options.page;
  if (options?.status !== undefined) params.status = options.status;
  return params;
}

/**
 * Build request body for credit purchase.
 */
export function buildPurchaseCreditsBody(
  credits: number,
  options?: PurchaseCreditsOptions
): Record<string, unknown> {
  const body: Record<string, unknown> = { credits };
  if (options?.successUrl) {
    body.success_url = options.successUrl;
  }
  return body;
}

/**
 * Build request body for notification preferences update.
 */
export function buildNotificationPreferencesBody(
  options: UpdateNotificationPreferencesOptions
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (options.emailAlerts !== undefined) body.email_alerts = options.emailAlerts;
  if (options.creditThreshold !== undefined) body.credit_threshold = options.creditThreshold;
  if (options.thresholdEnabled !== undefined) body.threshold_enabled = options.thresholdEnabled;
  if (options.weeklyDigest !== undefined) body.weekly_digest = options.weeklyDigest;
  if (options.invoiceAlerts !== undefined) body.invoice_alerts = options.invoiceAlerts;
  if (options.usageAlerts !== undefined) body.usage_alerts = options.usageAlerts;
  return body;
}
