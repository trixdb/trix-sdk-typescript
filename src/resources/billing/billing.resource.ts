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

import type { Trix } from '../../client.js';
import { BaseResource } from '../base.js';
import type {
  SubscriptionPlan,
  Subscription,
  CheckoutSession,
  PauseSubscriptionResponse,
  UnpauseSubscriptionResponse,
  DowngradeResponse,
  DowngradeStatus,
  CancelDowngradeResponse,
  CreditBalance,
  TransactionsResponse,
  CreditPackagesResponse,
  CreditPurchaseResponse,
  UsageReport,
  UsageAggregate,
  SpendingLimit,
  NotificationPreferences,
  CreditCost,
  CreditCostSummary,
  BillingPortalSession,
  GracePeriodStatus,
  InvoicesResponse,
  Invoice,
  InvoicePDFResponse,
  AuditLogResponse,
  BillingPeriod,
  UpgradeOptions,
  CancelOptions,
  PauseOptions,
  GetTransactionsOptions,
  PurchaseCreditsOptions,
  GetUsageHistoryOptions,
  UpdateNotificationPreferencesOptions,
  GetCostsOptions,
  GetAuditLogOptions,
  ListInvoicesOptions,
} from './billing.types.js';
import {
  buildUpgradeBody,
  buildCancelBody,
  buildPauseBody,
  buildTransactionsParams,
  buildUsageHistoryParams,
  buildCostsParams,
  buildAuditLogParams,
  buildInvoicesParams,
  buildPurchaseCreditsBody,
  buildNotificationPreferencesBody,
} from './billing.helpers.js';

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
   */
  async upgrade(
    plan: string,
    period: BillingPeriod,
    options?: UpgradeOptions
  ): Promise<CheckoutSession> {
    return this.request<CheckoutSession>({
      method: 'POST',
      path: '/v1/billing/subscription/checkout',
      body: buildUpgradeBody(plan, period, options),
    });
  }

  /**
   * Cancel the current subscription.
   */
  async cancel(options?: CancelOptions): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/v1/billing/subscription/cancel',
      body: buildCancelBody(options),
    });
  }

  /**
   * Resume a cancelled subscription.
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
   */
  async pause(options?: PauseOptions): Promise<PauseSubscriptionResponse> {
    return this.request<PauseSubscriptionResponse>({
      method: 'POST',
      path: '/v1/billing/subscription/pause',
      body: buildPauseBody(options),
    });
  }

  /**
   * Unpause (resume) a paused subscription.
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
   */
  async getDowngradeStatus(): Promise<DowngradeStatus> {
    return this.request<DowngradeStatus>({
      method: 'GET',
      path: '/v1/billing/subscription/downgrade',
    });
  }

  /**
   * Cancel a scheduled subscription downgrade.
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
   */
  async getTransactions(options?: GetTransactionsOptions): Promise<TransactionsResponse> {
    return this.request<TransactionsResponse>({
      method: 'GET',
      path: '/v1/billing/credits/transactions',
      params: buildTransactionsParams(options),
    });
  }

  /**
   * Get available credit packages for purchase.
   */
  async getCreditPackages(): Promise<CreditPackagesResponse> {
    return this.request<CreditPackagesResponse>({
      method: 'GET',
      path: '/v1/billing/credits/packages',
    });
  }

  /**
   * Create a checkout session to purchase credits.
   */
  async purchaseCredits(
    credits: number,
    options?: PurchaseCreditsOptions
  ): Promise<CreditPurchaseResponse> {
    return this.request<CreditPurchaseResponse>({
      method: 'POST',
      path: '/v1/billing/credits/purchase',
      body: buildPurchaseCreditsBody(credits, options),
    });
  }

  // ==========================================================================
  // USAGE
  // ==========================================================================

  /**
   * Get usage for the current billing period.
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
   */
  async getUsageHistory(options?: GetUsageHistoryOptions): Promise<UsageAggregate[]> {
    const response = await this.request<{ history: UsageAggregate[] }>({
      method: 'GET',
      path: '/v1/billing/usage/history',
      params: buildUsageHistoryParams(options),
    });
    return response.history;
  }

  // ==========================================================================
  // SPENDING LIMIT
  // ==========================================================================

  /**
   * Get the current spending limit configuration.
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
   */
  async updateNotificationPreferences(
    options: UpdateNotificationPreferencesOptions
  ): Promise<NotificationPreferences> {
    const response = await this.request<{ preferences: NotificationPreferences }>({
      method: 'PUT',
      path: '/v1/billing/notification-preferences',
      body: buildNotificationPreferencesBody(options),
    });
    return response.preferences;
  }

  // ==========================================================================
  // COSTS
  // ==========================================================================

  /**
   * Get credit cost configuration.
   */
  async getCosts(options?: GetCostsOptions): Promise<CreditCost[]> {
    const response = await this.request<{ costs: CreditCost[] }>({
      method: 'GET',
      path: '/v1/billing/costs',
      params: buildCostsParams(options),
    });
    return response.costs;
  }

  /**
   * Get credit cost summary by action type.
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
   */
  async getAuditLog(options?: GetAuditLogOptions): Promise<AuditLogResponse> {
    return this.request<AuditLogResponse>({
      method: 'GET',
      path: '/v1/billing/audit',
      params: buildAuditLogParams(options),
    });
  }

  // ==========================================================================
  // INVOICES
  // ==========================================================================

  /**
   * List invoices for the account.
   */
  async getInvoices(options?: ListInvoicesOptions): Promise<InvoicesResponse> {
    return this.request<InvoicesResponse>({
      method: 'GET',
      path: '/v1/billing/invoices',
      params: buildInvoicesParams(options),
    });
  }

  /**
   * Get details of a specific invoice.
   */
  async getInvoice(id: string): Promise<{ invoice: Invoice }> {
    return this.request<{ invoice: Invoice }>({
      method: 'GET',
      path: `/v1/billing/invoices/${id}`,
    });
  }

  /**
   * Get PDF download URL for an invoice.
   */
  async getInvoicePDF(id: string): Promise<InvoicePDFResponse> {
    return this.request<InvoicePDFResponse>({
      method: 'GET',
      path: `/v1/billing/invoices/${id}/pdf`,
    });
  }
}
