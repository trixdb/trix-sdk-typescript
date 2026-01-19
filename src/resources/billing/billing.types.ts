/**
 * Billing type definitions for the Trix SDK.
 *
 * Includes types for subscriptions, credits, usage, invoices, and audit logs.
 */

// ============================================================================
// Plans
// ============================================================================

/**
 * Subscription plan representing a billing tier.
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  includedCredits: number;
  rateLimitApi: number;
  rateLimitSearch: number;
  rateLimitBulk: number;
  features?: Record<string, boolean | string | number>;
  priceMonthly: number;
  priceYearly: number;
}

// ============================================================================
// Subscription
// ============================================================================

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'trialing';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  transactionId?: string;
}

export interface PauseSubscriptionResponse {
  message: string;
  status: string;
  pausedAt?: string;
}

export interface UnpauseSubscriptionResponse {
  message: string;
  status: string;
}

export interface RateLimitChange {
  from: number;
  to: number;
}

export interface RateLimitReductions {
  api: RateLimitChange;
  search: RateLimitChange;
  bulk: RateLimitChange;
}

export interface DowngradePreview {
  creditsReduction: number;
  featuresLost: string[];
  rateLimitReductions: RateLimitReductions;
}

export interface DowngradeResponse {
  message: string;
  downgradeTo: string;
  effectiveDate: string;
  preview: DowngradePreview;
}

export interface DowngradeStatus {
  hasScheduledDowngrade: boolean;
  currentPlan: string;
  downgradeTo?: string;
  downgradeToDisplay?: string;
  effectiveDate?: string;
  scheduledAt?: string;
}

export interface CancelDowngradeResponse {
  message: string;
  currentPlan: string;
}

// ============================================================================
// Credits
// ============================================================================

export interface CreditBalance {
  creditsAvailable: number;
  creditsUsedThisPeriod: number;
  creditsIncluded: number;
  creditsPurchased: number;
  periodStart: string;
  periodEnd: string;
}

export type TransactionType = 'credit' | 'debit';

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  actionType?: string;
  provider?: string;
  model?: string;
  description?: string;
  createdAt: string;
}

export interface GetTransactionsOptions {
  limit?: number;
  offset?: number;
  type?: TransactionType;
  actionType?: string;
}

export interface TransactionsResponse {
  transactions: CreditTransaction[];
  total: number;
}

export interface CreditPackage {
  id: string;
  credits: number;
  priceCents: number;
  name: string;
  description?: string;
  pricePerCreditCents: number;
  savingsPercent: number;
}

export interface CreditPackagesResponse {
  packages: CreditPackage[];
  minimumPurchase: number;
  baseRateCents: number;
}

export interface CreditPurchaseResponse {
  checkoutUrl: string;
  transactionId?: string;
  credits: number;
  priceCents: number;
  packageName?: string;
}

export interface PurchaseCreditsOptions {
  successUrl?: string;
}

// ============================================================================
// Usage
// ============================================================================

export interface UsageReport {
  periodStart: string;
  periodEnd: string;
  memoriesCreated: number;
  embeddingsGenerated: number;
  searchesPerformed: number;
  apiCalls: number;
  audioMinutesTranscribed: number;
  creditsUsed: number;
  creditsRemaining: number;
  creditsByAction?: Record<string, number>;
}

export interface UsageAggregate {
  id: string;
  periodStart: string;
  periodEnd: string;
  memoriesCreated: number;
  embeddingsGenerated: number;
  searchesPerformed: number;
  apiCalls: number;
  audioMinutesTranscribed: number;
  computeJobsRun: number;
  storageMBUsed: number;
  creditsUsed: number;
  creditsByAction?: Record<string, number>;
  tokensByModel?: Record<string, number>;
  isFinalized: boolean;
}

export interface GetUsageHistoryOptions {
  limit?: number;
}

// ============================================================================
// Spending Limit
// ============================================================================

export interface SpendingLimit {
  enabled: boolean;
  limitCredits: number;
  creditsUsed: number;
  remaining: number;
}

// ============================================================================
// Notification Preferences
// ============================================================================

export interface NotificationPreferences {
  emailAlerts: boolean;
  creditThreshold: number;
  thresholdEnabled: boolean;
  weeklyDigest: boolean;
  invoiceAlerts: boolean;
  usageAlerts: boolean;
}

export interface UpdateNotificationPreferencesOptions {
  emailAlerts?: boolean;
  creditThreshold?: number;
  thresholdEnabled?: boolean;
  weeklyDigest?: boolean;
  invoiceAlerts?: boolean;
  usageAlerts?: boolean;
}

// ============================================================================
// Costs
// ============================================================================

export interface CreditCost {
  actionType: string;
  provider?: string;
  model?: string;
  creditsPerUnit: number;
  unitType: string;
  unitMultiplier: number;
  description?: string;
}

export interface CreditCostSummary {
  actionType: string;
  providers: string[];
  models: string[];
  ruleCount: number;
  minCost: number;
  maxCost: number;
}

export interface GetCostsOptions {
  actionType?: string;
  provider?: string;
}

// ============================================================================
// Billing Portal
// ============================================================================

export interface BillingPortalSession {
  url: string;
  expiresAt: string;
}

// ============================================================================
// Grace Period
// ============================================================================

export interface GracePeriodStatus {
  isActive: boolean;
  daysRemaining: number;
  endDate?: string;
  reason?: string;
}

// ============================================================================
// Invoices
// ============================================================================

export type InvoiceStatus = 'pending' | 'issued' | 'paid' | 'past_due' | 'void' | 'refunded';

export interface InvoiceAmount {
  amountCents: number;
  currency: string;
  formatted: string;
}

export interface InvoiceLineItem {
  description: string;
  amountCents: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  total: InvoiceAmount;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  items: InvoiceLineItem[];
  itemsCount: number;
  createdAt: string;
}

export interface InvoicePagination {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

export interface ListInvoicesOptions {
  limit?: number;
  page?: number;
  status?: InvoiceStatus;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: InvoicePagination;
}

export interface InvoicePDFResponse {
  url: string;
  expiresAt: string;
  cached: boolean;
}

// ============================================================================
// Audit Log
// ============================================================================

export interface AuditLogEntry {
  id: string;
  accountId: string;
  userId?: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface GetAuditLogOptions {
  limit?: number;
  offset?: number;
  action?: string;
}

export interface AuditLogResponse {
  auditLog: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Options
// ============================================================================

export interface UpgradeOptions {
  successUrl?: string;
}

export interface CancelOptions {
  immediately?: boolean;
  reason?: string;
}

export interface PauseOptions {
  reason?: string;
}
