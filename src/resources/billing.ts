/**
 * Billing resource for subscription, credits, and usage management.
 *
 * Provides complete billing functionality including:
 * - Subscription management (upgrade, downgrade, cancel, pause/unpause)
 * - Credit balance and transaction history
 * - Usage tracking and history
 * - Spending limits and notification preferences
 * - Cost information and audit logs
 */

import type { Trix } from '../client.js';
import { BaseResource } from './base.js';

// ============================================================================
// TYPES - Plans
// ============================================================================

/**
 * Subscription plan representing a billing tier.
 */
export interface SubscriptionPlan {
  /** Unique plan identifier */
  id: string;
  /** Plan name (free, plus, max) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Plan description */
  description?: string;
  /** Monthly credits included with plan */
  includedCredits: number;
  /** API rate limit (requests per minute) */
  rateLimitApi: number;
  /** Search rate limit (requests per minute) */
  rateLimitSearch: number;
  /** Bulk operation rate limit (requests per minute) */
  rateLimitBulk: number;
  /** Feature flags for this plan */
  features?: Record<string, boolean | string | number>;
  /** Monthly price in cents */
  priceMonthly: number;
  /** Yearly price in cents */
  priceYearly: number;
}

// ============================================================================
// TYPES - Subscription
// ============================================================================

/**
 * Subscription status values.
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'paused'
  | 'trialing';

/**
 * Billing period options.
 */
export type BillingPeriod = 'monthly' | 'yearly';

/**
 * Account subscription information.
 */
export interface Subscription {
  /** Unique subscription identifier */
  id: string;
  /** Current plan */
  plan: SubscriptionPlan;
  /** Subscription status */
  status: SubscriptionStatus;
  /** Current billing period */
  billingPeriod: BillingPeriod;
  /** Start of current billing period (ISO 8601) */
  currentPeriodStart: string;
  /** End of current billing period (ISO 8601) */
  currentPeriodEnd: string;
  /** Whether subscription will cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** Trial end date if in trial (ISO 8601) */
  trialEnd?: string;
}

/**
 * Checkout session for subscription upgrade.
 */
export interface CheckoutSession {
  /** URL to redirect user for payment */
  checkoutUrl: string;
  /** Transaction ID for tracking */
  transactionId?: string;
}

/**
 * Response from pausing a subscription.
 */
export interface PauseSubscriptionResponse {
  /** Confirmation message */
  message: string;
  /** New subscription status */
  status: string;
  /** Timestamp when paused (ISO 8601) */
  pausedAt?: string;
}

/**
 * Response from unpausing a subscription.
 */
export interface UnpauseSubscriptionResponse {
  /** Confirmation message */
  message: string;
  /** New subscription status */
  status: string;
}

/**
 * Rate limit change during downgrade.
 */
export interface RateLimitChange {
  /** Rate limit before downgrade */
  from: number;
  /** Rate limit after downgrade */
  to: number;
}

/**
 * Rate limit reductions during downgrade.
 */
export interface RateLimitReductions {
  /** API rate limit change */
  api: RateLimitChange;
  /** Search rate limit change */
  search: RateLimitChange;
  /** Bulk operation rate limit change */
  bulk: RateLimitChange;
}

/**
 * Preview of changes when downgrading.
 */
export interface DowngradePreview {
  /** Monthly credits reduction */
  creditsReduction: number;
  /** Features that will be lost */
  featuresLost: string[];
  /** Rate limit changes */
  rateLimitReductions: RateLimitReductions;
}

/**
 * Response from scheduling a downgrade.
 */
export interface DowngradeResponse {
  /** Confirmation message */
  message: string;
  /** Target plan for downgrade */
  downgradeTo: string;
  /** Date when downgrade takes effect (ISO 8601) */
  effectiveDate: string;
  /** Preview of changes */
  preview: DowngradePreview;
}

/**
 * Status of a scheduled downgrade.
 */
export interface DowngradeStatus {
  /** Whether a downgrade is scheduled */
  hasScheduledDowngrade: boolean;
  /** Current plan name */
  currentPlan: string;
  /** Target plan for downgrade */
  downgradeTo?: string;
  /** Human-readable target plan name */
  downgradeToDisplay?: string;
  /** Date when downgrade takes effect (ISO 8601) */
  effectiveDate?: string;
  /** Date when downgrade was scheduled (ISO 8601) */
  scheduledAt?: string;
}

/**
 * Response from canceling a scheduled downgrade.
 */
export interface CancelDowngradeResponse {
  /** Confirmation message */
  message: string;
  /** Current plan name */
  currentPlan: string;
}

// ============================================================================
// TYPES - Credits
// ============================================================================

/**
 * Account credit balance information.
 */
export interface CreditBalance {
  /** Credits available for use */
  creditsAvailable: number;
  /** Credits used in current billing period */
  creditsUsedThisPeriod: number;
  /** Credits included from plan */
  creditsIncluded: number;
  /** Credits from purchases */
  creditsPurchased: number;
  /** Start of current period (ISO 8601) */
  periodStart: string;
  /** End of current period (ISO 8601) */
  periodEnd: string;
}

/**
 * Credit transaction type.
 */
export type TransactionType = 'credit' | 'debit';

/**
 * Credit transaction record.
 */
export interface CreditTransaction {
  /** Unique transaction identifier */
  id: string;
  /** Transaction type (credit or debit) */
  type: TransactionType;
  /** Amount (positive for credit, negative for debit) */
  amount: number;
  /** Balance after transaction */
  balanceAfter: number;
  /** Action type that triggered the transaction */
  actionType?: string;
  /** Provider used (for AI operations) */
  provider?: string;
  /** Model used (for AI operations) */
  model?: string;
  /** Human-readable description */
  description?: string;
  /** Timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Options for retrieving credit transactions.
 */
export interface GetTransactionsOptions {
  /** Maximum number of transactions to return */
  limit?: number;
  /** Number of transactions to skip */
  offset?: number;
  /** Filter by transaction type */
  type?: TransactionType;
  /** Filter by action type */
  actionType?: string;
}

/**
 * Response containing credit transactions.
 */
export interface TransactionsResponse {
  /** List of transactions */
  transactions: CreditTransaction[];
  /** Total number of transactions matching filters */
  total: number;
}

/**
 * Credit package available for purchase.
 */
export interface CreditPackage {
  /** Package identifier */
  id: string;
  /** Number of credits */
  credits: number;
  /** Price in cents */
  priceCents: number;
  /** Package name */
  name: string;
  /** Package description */
  description?: string;
  /** Price per credit in cents */
  pricePerCreditCents: number;
  /** Savings percentage compared to base rate */
  savingsPercent: number;
}

/**
 * Response containing available credit packages.
 */
export interface CreditPackagesResponse {
  /** Available packages */
  packages: CreditPackage[];
  /** Minimum credits per purchase */
  minimumPurchase: number;
  /** Base rate per credit in cents */
  baseRateCents: number;
}

/**
 * Response from credit purchase request.
 */
export interface CreditPurchaseResponse {
  /** URL to redirect user for payment */
  checkoutUrl: string;
  /** Transaction ID for tracking */
  transactionId?: string;
  /** Number of credits being purchased */
  credits: number;
  /** Total price in cents */
  priceCents: number;
  /** Package name if applicable */
  packageName?: string;
}

/**
 * Options for credit purchase.
 */
export interface PurchaseCreditsOptions {
  /** URL to redirect to after successful purchase */
  successUrl?: string;
}

// ============================================================================
// TYPES - Usage
// ============================================================================

/**
 * Usage report for a billing period.
 */
export interface UsageReport {
  /** Start of period (ISO 8601) */
  periodStart: string;
  /** End of period (ISO 8601) */
  periodEnd: string;
  /** Number of memories created */
  memoriesCreated: number;
  /** Number of embeddings generated */
  embeddingsGenerated: number;
  /** Number of searches performed */
  searchesPerformed: number;
  /** Total API calls */
  apiCalls: number;
  /** Minutes of audio transcribed */
  audioMinutesTranscribed: number;
  /** Credits used in period */
  creditsUsed: number;
  /** Credits remaining */
  creditsRemaining: number;
  /** Credits broken down by action type */
  creditsByAction?: Record<string, number>;
}

/**
 * Historical usage aggregate for a billing period.
 */
export interface UsageAggregate {
  /** Unique aggregate identifier */
  id: string;
  /** Start of period (ISO 8601) */
  periodStart: string;
  /** End of period (ISO 8601) */
  periodEnd: string;
  /** Number of memories created */
  memoriesCreated: number;
  /** Number of embeddings generated */
  embeddingsGenerated: number;
  /** Number of searches performed */
  searchesPerformed: number;
  /** Total API calls */
  apiCalls: number;
  /** Minutes of audio transcribed */
  audioMinutesTranscribed: number;
  /** Number of compute jobs run */
  computeJobsRun: number;
  /** Storage used in MB */
  storageMBUsed: number;
  /** Credits used in period */
  creditsUsed: number;
  /** Credits broken down by action type */
  creditsByAction?: Record<string, number>;
  /** Tokens broken down by model */
  tokensByModel?: Record<string, number>;
  /** Whether the period is finalized */
  isFinalized: boolean;
}

/**
 * Options for retrieving usage history.
 */
export interface GetUsageHistoryOptions {
  /** Maximum number of periods to return */
  limit?: number;
}

// ============================================================================
// TYPES - Spending Limit
// ============================================================================

/**
 * Spending limit configuration.
 */
export interface SpendingLimit {
  /** Whether spending limit is enabled */
  enabled: boolean;
  /** Maximum credits per period */
  limitCredits: number;
  /** Credits used toward limit */
  creditsUsed: number;
  /** Credits remaining before limit */
  remaining: number;
}

// ============================================================================
// TYPES - Notification Preferences
// ============================================================================

/**
 * Billing notification preferences.
 */
export interface NotificationPreferences {
  /** Enable email alerts */
  emailAlerts: boolean;
  /** Credit threshold percentage for alerts (0-100) */
  creditThreshold: number;
  /** Whether threshold alerts are enabled */
  thresholdEnabled: boolean;
  /** Enable weekly usage digest */
  weeklyDigest: boolean;
  /** Enable invoice alerts */
  invoiceAlerts: boolean;
  /** Enable usage alerts */
  usageAlerts: boolean;
}

/**
 * Options for updating notification preferences.
 */
export interface UpdateNotificationPreferencesOptions {
  /** Enable/disable email alerts */
  emailAlerts?: boolean;
  /** Credit threshold percentage (0-100) */
  creditThreshold?: number;
  /** Enable/disable threshold alerts */
  thresholdEnabled?: boolean;
  /** Enable/disable weekly digest */
  weeklyDigest?: boolean;
  /** Enable/disable invoice alerts */
  invoiceAlerts?: boolean;
  /** Enable/disable usage alerts */
  usageAlerts?: boolean;
}

// ============================================================================
// TYPES - Costs
// ============================================================================

/**
 * Credit cost configuration for an action.
 */
export interface CreditCost {
  /** Action type (embedding, search, etc.) */
  actionType: string;
  /** Provider (openai, cohere, etc.) */
  provider?: string;
  /** Model name */
  model?: string;
  /** Credits per unit */
  creditsPerUnit: number;
  /** Unit type (token_1k, request, etc.) */
  unitType: string;
  /** Unit multiplier */
  unitMultiplier: number;
  /** Description of the cost rule */
  description?: string;
}

/**
 * Aggregated cost summary by action type.
 */
export interface CreditCostSummary {
  /** Action type */
  actionType: string;
  /** Available providers */
  providers: string[];
  /** Available models */
  models: string[];
  /** Number of cost rules */
  ruleCount: number;
  /** Minimum cost */
  minCost: number;
  /** Maximum cost */
  maxCost: number;
}

/**
 * Options for retrieving credit costs.
 */
export interface GetCostsOptions {
  /** Filter by action type */
  actionType?: string;
  /** Filter by provider */
  provider?: string;
}

// ============================================================================
// TYPES - Billing Portal
// ============================================================================

/**
 * Billing portal session.
 */
export interface BillingPortalSession {
  /** URL to the billing portal */
  url: string;
  /** When the session expires (ISO 8601) */
  expiresAt: string;
}

// ============================================================================
// TYPES - Grace Period
// ============================================================================

/**
 * Grace period status for subscription.
 */
export interface GracePeriodStatus {
  /** Whether grace period is currently active */
  isActive: boolean;
  /** Days remaining in grace period */
  daysRemaining: number;
  /** Grace period end date (ISO 8601) */
  endDate?: string;
  /** Reason for grace period */
  reason?: string;
}

// ============================================================================
// TYPES - Invoices
// ============================================================================

/**
 * Invoice status values.
 */
export type InvoiceStatus =
  | 'pending'
  | 'issued'
  | 'paid'
  | 'past_due'
  | 'void'
  | 'refunded';

/**
 * Invoice amount breakdown.
 */
export interface InvoiceAmount {
  /** Amount in cents */
  amountCents: number;
  /** Currency code (e.g., USD) */
  currency: string;
  /** Formatted amount (e.g., "$29.00 USD") */
  formatted: string;
}

/**
 * Line item on an invoice.
 */
export interface InvoiceLineItem {
  /** Item description */
  description: string;
  /** Amount in cents */
  amountCents: number;
  /** Quantity */
  quantity: number;
}

/**
 * Invoice representing a billing transaction.
 */
export interface Invoice {
  /** Unique invoice identifier */
  id: string;
  /** Human-readable invoice number */
  invoiceNumber: string;
  /** Invoice status */
  status: InvoiceStatus;
  /** Total amount */
  total: InvoiceAmount;
  /** When invoice was issued (ISO 8601) */
  issuedAt: string;
  /** Payment due date (ISO 8601) */
  dueAt?: string;
  /** When payment was received (ISO 8601) */
  paidAt?: string;
  /** Line items on the invoice */
  items: InvoiceLineItem[];
  /** Number of line items */
  itemsCount: number;
  /** When invoice was created (ISO 8601) */
  createdAt: string;
}

/**
 * Pagination info for invoice list.
 */
export interface InvoicePagination {
  /** Total number of invoices */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Options for listing invoices.
 */
export interface ListInvoicesOptions {
  /** Number of invoices per page */
  limit?: number;
  /** Page number */
  page?: number;
  /** Filter by status */
  status?: InvoiceStatus;
}

/**
 * Response containing a list of invoices.
 */
export interface InvoicesResponse {
  /** List of invoices */
  invoices: Invoice[];
  /** Pagination info */
  pagination: InvoicePagination;
}

/**
 * Invoice PDF download URL response.
 */
export interface InvoicePDFResponse {
  /** URL to download the PDF */
  url: string;
  /** When the URL expires (ISO 8601) */
  expiresAt: string;
  /** Whether the URL was served from cache */
  cached: boolean;
}

// ============================================================================
// TYPES - Audit Log
// ============================================================================

/**
 * Billing audit log entry.
 */
export interface AuditLogEntry {
  /** Entry identifier */
  id: string;
  /** Account identifier */
  accountId: string;
  /** User identifier (if applicable) */
  userId?: string;
  /** Action performed */
  action: string;
  /** Additional details */
  details: Record<string, unknown>;
  /** IP address of request */
  ipAddress?: string;
  /** User agent of request */
  userAgent?: string;
  /** Timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Options for retrieving audit log.
 */
export interface GetAuditLogOptions {
  /** Maximum number of entries to return */
  limit?: number;
  /** Number of entries to skip */
  offset?: number;
  /** Filter by action type */
  action?: string;
}

/**
 * Response containing audit log entries.
 */
export interface AuditLogResponse {
  /** List of audit log entries */
  auditLog: AuditLogEntry[];
  /** Total number of entries matching filters */
  total: number;
  /** Limit used in query */
  limit: number;
  /** Offset used in query */
  offset: number;
}

// ============================================================================
// TYPES - Options
// ============================================================================

/**
 * Options for subscription upgrade.
 */
export interface UpgradeOptions {
  /** URL to redirect to after successful upgrade */
  successUrl?: string;
}

/**
 * Options for subscription cancellation.
 */
export interface CancelOptions {
  /** Whether to cancel immediately vs at period end */
  immediately?: boolean;
  /** Reason for cancellation */
  reason?: string;
}

/**
 * Options for pausing subscription.
 */
export interface PauseOptions {
  /** Reason for pausing */
  reason?: string;
}

// ============================================================================
// BILLING RESOURCE
// ============================================================================

/**
 * Billing resource for managing subscriptions, credits, and usage.
 *
 * @example
 * ```typescript
 * // Get current subscription
 * const subscription = await client.billing.getSubscription();
 * console.log(`Plan: ${subscription.plan.displayName}`);
 *
 * // Check credit balance
 * const credits = await client.billing.getCredits();
 * console.log(`Available: ${credits.creditsAvailable}`);
 *
 * // Get usage for current period
 * const usage = await client.billing.getUsage();
 * console.log(`Credits used: ${usage.creditsUsed}`);
 * ```
 */
export class Billing extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  // ==========================================================================
  // PLANS
  // ==========================================================================

  /**
   * Get all available subscription plans.
   *
   * @returns List of available plans
   *
   * @example
   * ```typescript
   * const plans = await client.billing.getPlans();
   * for (const plan of plans) {
   *   console.log(`${plan.displayName}: ${plan.includedCredits} credits`);
   * }
   * ```
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.request<{ plans: SubscriptionPlan[] }>({
      method: 'GET',
      path: '/v1/billing/plans',
    });
    return response.plans;
  }

  // ==========================================================================
  // SUBSCRIPTION
  // ==========================================================================

  /**
   * Get the current subscription.
   *
   * @returns Current subscription details
   *
   * @example
   * ```typescript
   * const subscription = await client.billing.getSubscription();
   * if (subscription.status === 'active') {
   *   console.log(`Active until: ${subscription.currentPeriodEnd}`);
   * }
   * ```
   */
  async getSubscription(): Promise<Subscription> {
    const response = await this.request<{ subscription: Subscription }>({
      method: 'GET',
      path: '/v1/billing/subscription',
    });
    return response.subscription;
  }

  /**
   * Create a checkout session to upgrade the subscription.
   *
   * @param plan - Target plan name (plus, max)
   * @param period - Billing period (monthly, yearly)
   * @param options - Additional options
   * @returns Checkout session with URL for payment
   *
   * @example
   * ```typescript
   * const session = await client.billing.upgrade('plus', 'monthly');
   * // Redirect user to session.checkoutUrl
   * ```
   */
  async upgrade(
    plan: string,
    period: BillingPeriod,
    options?: UpgradeOptions
  ): Promise<CheckoutSession> {
    const body: Record<string, unknown> = {
      plan,
      billing_period: period,
    };
    if (options?.successUrl) {
      body.success_url = options.successUrl;
    }

    return this.request<CheckoutSession>({
      method: 'POST',
      path: '/v1/billing/subscription/checkout',
      body,
    });
  }

  /**
   * Cancel the current subscription.
   *
   * @param options - Cancellation options
   *
   * @example
   * ```typescript
   * // Cancel at period end
   * await client.billing.cancel();
   *
   * // Cancel immediately
   * await client.billing.cancel({ immediately: true });
   *
   * // Cancel with reason
   * await client.billing.cancel({ reason: 'Switching to competitor' });
   * ```
   */
  async cancel(options?: CancelOptions): Promise<void> {
    const body: Record<string, unknown> = {
      immediately: options?.immediately ?? false,
    };
    if (options?.reason) {
      body.reason = options.reason;
    }

    await this.request<void>({
      method: 'POST',
      path: '/v1/billing/subscription/cancel',
      body,
    });
  }

  /**
   * Resume a cancelled subscription.
   *
   * Can only be used if the subscription is set to cancel at period end.
   *
   * @example
   * ```typescript
   * await client.billing.resume();
   * ```
   */
  async resume(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/v1/billing/subscription/resume',
      body: {},
    });
  }

  /**
   * Pause the current subscription.
   *
   * Paused subscriptions retain data but lose API access.
   * Billing is stopped until the subscription is unpaused.
   *
   * @param options - Pause options
   * @returns Pause response with status
   *
   * @example
   * ```typescript
   * const result = await client.billing.pause({ reason: 'Taking a break' });
   * console.log(`Status: ${result.status}`);
   * ```
   */
  async pause(options?: PauseOptions): Promise<PauseSubscriptionResponse> {
    const body: Record<string, unknown> = {};
    if (options?.reason) {
      body.reason = options.reason;
    }

    return this.request<PauseSubscriptionResponse>({
      method: 'POST',
      path: '/v1/billing/subscription/pause',
      body,
    });
  }

  /**
   * Unpause (resume) a paused subscription.
   *
   * Restores API access and resumes billing.
   *
   * @returns Unpause response with status
   *
   * @example
   * ```typescript
   * const result = await client.billing.unpause();
   * console.log(`Status: ${result.status}`);
   * ```
   */
  async unpause(): Promise<UnpauseSubscriptionResponse> {
    return this.request<UnpauseSubscriptionResponse>({
      method: 'POST',
      path: '/v1/billing/subscription/unpause',
      body: {},
    });
  }

  /**
   * Schedule a subscription downgrade to a lower tier plan.
   *
   * The downgrade takes effect at the end of the current billing period.
   *
   * @param plan - Target plan name (free, plus)
   * @returns Downgrade response with preview of changes
   *
   * @example
   * ```typescript
   * const result = await client.billing.downgrade('free');
   * console.log(`Effective: ${result.effectiveDate}`);
   * console.log(`Credits reduction: ${result.preview.creditsReduction}`);
   * ```
   */
  async downgrade(plan: string): Promise<DowngradeResponse> {
    return this.request<DowngradeResponse>({
      method: 'POST',
      path: '/v1/billing/subscription/downgrade',
      body: { plan },
    });
  }

  /**
   * Get the status of any scheduled downgrade.
   *
   * @returns Downgrade status
   *
   * @example
   * ```typescript
   * const status = await client.billing.getDowngradeStatus();
   * if (status.hasScheduledDowngrade) {
   *   console.log(`Downgrading to ${status.downgradeTo} on ${status.effectiveDate}`);
   * }
   * ```
   */
  async getDowngradeStatus(): Promise<DowngradeStatus> {
    return this.request<DowngradeStatus>({
      method: 'GET',
      path: '/v1/billing/subscription/downgrade',
    });
  }

  /**
   * Cancel a scheduled subscription downgrade.
   *
   * @returns Cancel response
   *
   * @example
   * ```typescript
   * const result = await client.billing.cancelDowngrade();
   * console.log(`Staying on: ${result.currentPlan}`);
   * ```
   */
  async cancelDowngrade(): Promise<CancelDowngradeResponse> {
    return this.request<CancelDowngradeResponse>({
      method: 'DELETE',
      path: '/v1/billing/subscription/downgrade',
    });
  }

  // ==========================================================================
  // CREDITS
  // ==========================================================================

  /**
   * Get the current credit balance.
   *
   * @returns Credit balance information
   *
   * @example
   * ```typescript
   * const credits = await client.billing.getCredits();
   * console.log(`Available: ${credits.creditsAvailable}`);
   * console.log(`Used this period: ${credits.creditsUsedThisPeriod}`);
   * ```
   */
  async getCredits(): Promise<CreditBalance> {
    const response = await this.request<{ balance: CreditBalance }>({
      method: 'GET',
      path: '/v1/billing/credits',
    });
    return response.balance;
  }

  /**
   * Get credit transaction history.
   *
   * @param options - Filtering and pagination options
   * @returns Transactions response
   *
   * @example
   * ```typescript
   * // Get recent transactions
   * const result = await client.billing.getTransactions({ limit: 20 });
   * for (const txn of result.transactions) {
   *   console.log(`${txn.type}: ${txn.amount} credits`);
   * }
   *
   * // Filter by type
   * const debits = await client.billing.getTransactions({ type: 'debit' });
   * ```
   */
  async getTransactions(options?: GetTransactionsOptions): Promise<TransactionsResponse> {
    const params: Record<string, unknown> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.type !== undefined) params.type = options.type;
    if (options?.actionType !== undefined) params.action_type = options.actionType;

    return this.request<TransactionsResponse>({
      method: 'GET',
      path: '/v1/billing/credits/transactions',
      params,
    });
  }

  /**
   * Get available credit packages for purchase.
   *
   * @returns Available packages and pricing info
   *
   * @example
   * ```typescript
   * const packages = await client.billing.getCreditPackages();
   * for (const pkg of packages.packages) {
   *   console.log(`${pkg.name}: ${pkg.credits} credits for $${pkg.priceCents / 100}`);
   * }
   * ```
   */
  async getCreditPackages(): Promise<CreditPackagesResponse> {
    return this.request<CreditPackagesResponse>({
      method: 'GET',
      path: '/v1/billing/credits/packages',
    });
  }

  /**
   * Create a checkout session to purchase credits.
   *
   * @param credits - Number of credits to purchase
   * @param options - Additional options
   * @returns Purchase response with checkout URL
   *
   * @example
   * ```typescript
   * const result = await client.billing.purchaseCredits(5000);
   * console.log(`Price: $${result.priceCents / 100}`);
   * // Redirect user to result.checkoutUrl
   * ```
   */
  async purchaseCredits(
    credits: number,
    options?: PurchaseCreditsOptions
  ): Promise<CreditPurchaseResponse> {
    const body: Record<string, unknown> = { credits };
    if (options?.successUrl) {
      body.success_url = options.successUrl;
    }

    return this.request<CreditPurchaseResponse>({
      method: 'POST',
      path: '/v1/billing/credits/purchase',
      body,
    });
  }

  // ==========================================================================
  // USAGE
  // ==========================================================================

  /**
   * Get usage for the current billing period.
   *
   * @returns Current period usage report
   *
   * @example
   * ```typescript
   * const usage = await client.billing.getUsage();
   * console.log(`Memories created: ${usage.memoriesCreated}`);
   * console.log(`Credits used: ${usage.creditsUsed}`);
   * console.log(`Credits remaining: ${usage.creditsRemaining}`);
   * ```
   */
  async getUsage(): Promise<UsageReport> {
    const response = await this.request<{ usage: UsageReport }>({
      method: 'GET',
      path: '/v1/billing/usage',
    });
    return response.usage;
  }

  /**
   * Get historical usage data.
   *
   * @param options - Options including limit
   * @returns Array of usage aggregates for past periods
   *
   * @example
   * ```typescript
   * const history = await client.billing.getUsageHistory({ limit: 6 });
   * for (const period of history) {
   *   console.log(`${period.periodStart}: ${period.creditsUsed} credits`);
   * }
   * ```
   */
  async getUsageHistory(options?: GetUsageHistoryOptions): Promise<UsageAggregate[]> {
    const params: Record<string, unknown> = {};
    if (options?.limit !== undefined) params.limit = options.limit;

    const response = await this.request<{ history: UsageAggregate[] }>({
      method: 'GET',
      path: '/v1/billing/usage/history',
      params,
    });
    return response.history;
  }

  // ==========================================================================
  // SPENDING LIMIT
  // ==========================================================================

  /**
   * Get the current spending limit configuration.
   *
   * @returns Spending limit details
   *
   * @example
   * ```typescript
   * const limit = await client.billing.getSpendingLimit();
   * if (limit.enabled) {
   *   console.log(`Limit: ${limit.limitCredits}, Remaining: ${limit.remaining}`);
   * }
   * ```
   */
  async getSpendingLimit(): Promise<SpendingLimit> {
    const response = await this.request<{ spendingLimit: SpendingLimit }>({
      method: 'GET',
      path: '/v1/billing/spending-limit',
    });
    return response.spendingLimit;
  }

  /**
   * Set or update the spending limit.
   *
   * @param limitCredits - Maximum credits to allow per period
   * @returns Updated spending limit
   *
   * @example
   * ```typescript
   * const limit = await client.billing.setSpendingLimit(10000);
   * console.log(`New limit: ${limit.limitCredits}`);
   * ```
   */
  async setSpendingLimit(limitCredits: number): Promise<SpendingLimit> {
    const response = await this.request<{ spendingLimit: SpendingLimit }>({
      method: 'PUT',
      path: '/v1/billing/spending-limit',
      body: { limit_credits: limitCredits, enabled: true },
    });
    return response.spendingLimit;
  }

  /**
   * Disable the spending limit.
   *
   * @returns Updated spending limit (disabled)
   *
   * @example
   * ```typescript
   * const limit = await client.billing.disableSpendingLimit();
   * console.log(`Enabled: ${limit.enabled}`); // false
   * ```
   */
  async disableSpendingLimit(): Promise<SpendingLimit> {
    const response = await this.request<{ spendingLimit: SpendingLimit }>({
      method: 'PUT',
      path: '/v1/billing/spending-limit',
      body: { enabled: false },
    });
    return response.spendingLimit;
  }

  // ==========================================================================
  // NOTIFICATION PREFERENCES
  // ==========================================================================

  /**
   * Get current notification preferences.
   *
   * @returns Notification preferences
   *
   * @example
   * ```typescript
   * const prefs = await client.billing.getNotificationPreferences();
   * console.log(`Email alerts: ${prefs.emailAlerts}`);
   * console.log(`Threshold: ${prefs.creditThreshold}%`);
   * ```
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await this.request<{ preferences: NotificationPreferences }>({
      method: 'GET',
      path: '/v1/billing/notification-preferences',
    });
    return response.preferences;
  }

  /**
   * Update notification preferences.
   *
   * @param options - Preferences to update
   * @returns Updated preferences
   *
   * @example
   * ```typescript
   * const prefs = await client.billing.updateNotificationPreferences({
   *   creditThreshold: 10,
   *   weeklyDigest: true,
   * });
   * ```
   */
  async updateNotificationPreferences(
    options: UpdateNotificationPreferencesOptions
  ): Promise<NotificationPreferences> {
    const body: Record<string, unknown> = {};
    if (options.emailAlerts !== undefined) body.email_alerts = options.emailAlerts;
    if (options.creditThreshold !== undefined) body.credit_threshold = options.creditThreshold;
    if (options.thresholdEnabled !== undefined) body.threshold_enabled = options.thresholdEnabled;
    if (options.weeklyDigest !== undefined) body.weekly_digest = options.weeklyDigest;
    if (options.invoiceAlerts !== undefined) body.invoice_alerts = options.invoiceAlerts;
    if (options.usageAlerts !== undefined) body.usage_alerts = options.usageAlerts;

    const response = await this.request<{ preferences: NotificationPreferences }>({
      method: 'PUT',
      path: '/v1/billing/notification-preferences',
      body,
    });
    return response.preferences;
  }

  // ==========================================================================
  // COSTS
  // ==========================================================================

  /**
   * Get credit cost configuration.
   *
   * @param options - Filtering options
   * @returns List of cost rules
   *
   * @example
   * ```typescript
   * // Get all costs
   * const costs = await client.billing.getCosts();
   *
   * // Filter by action type
   * const embeddingCosts = await client.billing.getCosts({ actionType: 'embedding' });
   * ```
   */
  async getCosts(options?: GetCostsOptions): Promise<CreditCost[]> {
    const params: Record<string, unknown> = {};
    if (options?.actionType !== undefined) params.action_type = options.actionType;
    if (options?.provider !== undefined) params.provider = options.provider;

    const response = await this.request<{ costs: CreditCost[] }>({
      method: 'GET',
      path: '/v1/billing/costs',
      params,
    });
    return response.costs;
  }

  /**
   * Get credit cost summary by action type.
   *
   * @returns List of cost summaries
   *
   * @example
   * ```typescript
   * const summary = await client.billing.getCostsSummary();
   * for (const item of summary) {
   *   console.log(`${item.actionType}: ${item.minCost} - ${item.maxCost} credits`);
   * }
   * ```
   */
  async getCostsSummary(): Promise<CreditCostSummary[]> {
    const response = await this.request<{ summary: CreditCostSummary[] }>({
      method: 'GET',
      path: '/v1/billing/costs/summary',
    });
    return response.summary;
  }

  // ==========================================================================
  // BILLING PORTAL
  // ==========================================================================

  /**
   * Get a URL to the billing portal.
   *
   * @returns Portal session with URL
   *
   * @example
   * ```typescript
   * const portal = await client.billing.getPortal();
   * // Redirect user to portal.url
   * ```
   */
  async getPortal(): Promise<BillingPortalSession> {
    const response = await this.request<{ url: string; expiresAt: string }>({
      method: 'POST',
      path: '/v1/billing/portal',
      body: {},
    });
    return {
      url: response.url,
      expiresAt: response.expiresAt,
    };
  }

  // ==========================================================================
  // GRACE PERIOD
  // ==========================================================================

  /**
   * Get the grace period status for the subscription.
   *
   * A grace period is granted when there are billing issues, allowing
   * continued access while the payment issue is being resolved.
   *
   * @returns Grace period status
   *
   * @example
   * ```typescript
   * const status = await client.billing.getGracePeriodStatus();
   * if (status.isActive) {
   *   console.log(`Grace period ends: ${status.endDate}`);
   *   console.log(`Days remaining: ${status.daysRemaining}`);
   * }
   * ```
   */
  async getGracePeriodStatus(): Promise<GracePeriodStatus> {
    const response = await this.request<{ gracePeriod: GracePeriodStatus }>({
      method: 'GET',
      path: '/v1/billing/subscription/grace-period',
    });
    return response.gracePeriod;
  }

  // ==========================================================================
  // AUDIT LOG
  // ==========================================================================

  /**
   * Get the billing audit log.
   *
   * @param options - Filtering and pagination options
   * @returns Audit log response
   *
   * @example
   * ```typescript
   * const log = await client.billing.getAuditLog({ limit: 50 });
   * for (const entry of log.auditLog) {
   *   console.log(`${entry.action} at ${entry.createdAt}`);
   * }
   *
   * // Filter by action
   * const upgrades = await client.billing.getAuditLog({
   *   action: 'subscription_upgrade',
   * });
   * ```
   */
  async getAuditLog(options?: GetAuditLogOptions): Promise<AuditLogResponse> {
    const params: Record<string, unknown> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.action !== undefined) params.action = options.action;

    return this.request<AuditLogResponse>({
      method: 'GET',
      path: '/v1/billing/audit',
      params,
    });
  }

  // ==========================================================================
  // INVOICES
  // ==========================================================================

  /**
   * List invoices for the account.
   *
   * @param options - Pagination and filtering options
   * @returns List of invoices with pagination info
   *
   * @example
   * ```typescript
   * // Get all invoices
   * const result = await client.billing.getInvoices();
   * for (const invoice of result.invoices) {
   *   console.log(`${invoice.invoiceNumber}: ${invoice.total.formatted}`);
   * }
   *
   * // Filter by status
   * const paidInvoices = await client.billing.getInvoices({ status: 'paid' });
   *
   * // Paginate
   * const page2 = await client.billing.getInvoices({ page: 2, limit: 10 });
   * ```
   */
  async getInvoices(options?: ListInvoicesOptions): Promise<InvoicesResponse> {
    const params: Record<string, unknown> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.page !== undefined) params.page = options.page;
    if (options?.status !== undefined) params.status = options.status;

    return this.request<InvoicesResponse>({
      method: 'GET',
      path: '/v1/billing/invoices',
      params,
    });
  }

  /**
   * Get details of a specific invoice.
   *
   * @param id - Invoice ID
   * @returns Invoice details
   *
   * @example
   * ```typescript
   * const result = await client.billing.getInvoice('inv_abc123');
   * console.log(`Invoice: ${result.invoice.invoiceNumber}`);
   * console.log(`Status: ${result.invoice.status}`);
   * console.log(`Total: ${result.invoice.total.formatted}`);
   * for (const item of result.invoice.items) {
   *   console.log(`  - ${item.description}: ${item.amountCents / 100}`);
   * }
   * ```
   */
  async getInvoice(id: string): Promise<{ invoice: Invoice }> {
    return this.request<{ invoice: Invoice }>({
      method: 'GET',
      path: `/v1/billing/invoices/${id}`,
    });
  }

  /**
   * Get PDF download URL for an invoice.
   *
   * The URL is time-limited and will expire. If the cached URL has expired,
   * a fresh URL will be fetched from the payment provider.
   *
   * @param id - Invoice ID
   * @returns PDF download URL and expiration info
   *
   * @example
   * ```typescript
   * const result = await client.billing.getInvoicePDF('inv_abc123');
   * console.log(`Download URL: ${result.url}`);
   * console.log(`Expires: ${result.expiresAt}`);
   * console.log(`Cached: ${result.cached}`);
   *
   * // Download the PDF
   * const response = await fetch(result.url);
   * const pdfBlob = await response.blob();
   * ```
   */
  async getInvoicePDF(id: string): Promise<InvoicePDFResponse> {
    return this.request<InvoicePDFResponse>({
      method: 'GET',
      path: `/v1/billing/invoices/${id}/pdf`,
    });
  }
}
