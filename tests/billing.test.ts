/**
 * Tests for Billing resource - TDD approach
 * Tests written first, implementation follows
 */

import { Billing } from '../src/resources/billing';
import { buildParams } from '../src/resources/base';

// Mock client for testing
const mockClient = {
  request: jest.fn(),
};

describe('Billing', () => {
  let billing: Billing;

  beforeEach(() => {
    jest.clearAllMocks();
    billing = new Billing(mockClient as any);
  });

  // ============================================================================
  // PLANS
  // ============================================================================

  describe('getPlans', () => {
    it('should retrieve all available subscription plans', async () => {
      const mockPlans = [
        {
          id: 'free',
          name: 'free',
          displayName: 'Free',
          description: 'For personal projects',
          includedCredits: 1000,
          rateLimitApi: 60,
          rateLimitSearch: 30,
          rateLimitBulk: 10,
          features: { audioTranscription: false },
          priceMonthly: 0,
          priceYearly: 0,
        },
        {
          id: 'plus',
          name: 'plus',
          displayName: 'Plus',
          description: 'For growing teams',
          includedCredits: 10000,
          rateLimitApi: 300,
          rateLimitSearch: 100,
          rateLimitBulk: 50,
          features: { audioTranscription: true },
          priceMonthly: 2900,
          priceYearly: 29000,
        },
        {
          id: 'max',
          name: 'max',
          displayName: 'Max',
          description: 'For enterprises',
          includedCredits: 100000,
          rateLimitApi: 1000,
          rateLimitSearch: 500,
          rateLimitBulk: 200,
          features: { audioTranscription: true, prioritySupport: true },
          priceMonthly: 9900,
          priceYearly: 99000,
        },
      ];

      mockClient.request.mockResolvedValue({ plans: mockPlans });

      const result = await billing.getPlans();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/plans',
      });
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('free');
      expect(result[1].name).toBe('plus');
      expect(result[2].name).toBe('max');
    });
  });

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  describe('getSubscription', () => {
    it('should retrieve the current subscription', async () => {
      const mockSubscription = {
        id: 'sub_123',
        plan: {
          id: 'plus',
          name: 'plus',
          displayName: 'Plus',
          includedCredits: 10000,
        },
        status: 'active',
        billingPeriod: 'monthly',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
      };

      mockClient.request.mockResolvedValue({ subscription: mockSubscription });

      const result = await billing.getSubscription();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/subscription',
      });
      expect(result.id).toBe('sub_123');
      expect(result.status).toBe('active');
      expect(result.plan.name).toBe('plus');
    });

    it('should handle subscription with trial', async () => {
      const mockSubscription = {
        id: 'sub_124',
        plan: { id: 'plus', name: 'plus' },
        status: 'trialing',
        trialEnd: '2024-01-15T00:00:00Z',
      };

      mockClient.request.mockResolvedValue({ subscription: mockSubscription });

      const result = await billing.getSubscription();

      expect(result.status).toBe('trialing');
      expect(result.trialEnd).toBe('2024-01-15T00:00:00Z');
    });
  });

  describe('upgrade', () => {
    it('should create checkout session for upgrade', async () => {
      mockClient.request.mockResolvedValue({
        checkoutUrl: 'https://checkout.paddle.com/session_123',
        transactionId: 'txn_456',
      });

      const result = await billing.upgrade('max', 'monthly');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/checkout',
        body: { plan: 'max', billing_period: 'monthly' },
      });
      expect(result.checkoutUrl).toContain('checkout.paddle.com');
    });

    it('should support yearly billing period', async () => {
      mockClient.request.mockResolvedValue({
        checkoutUrl: 'https://checkout.paddle.com/session_789',
      });

      await billing.upgrade('plus', 'yearly');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/checkout',
        body: { plan: 'plus', billing_period: 'yearly' },
      });
    });

    it('should support custom success URL', async () => {
      mockClient.request.mockResolvedValue({
        checkoutUrl: 'https://checkout.paddle.com/session_abc',
      });

      await billing.upgrade('max', 'monthly', { successUrl: 'https://app.example.com/success' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/checkout',
        body: {
          plan: 'max',
          billing_period: 'monthly',
          success_url: 'https://app.example.com/success',
        },
      });
    });
  });

  describe('cancel', () => {
    it('should cancel subscription at period end', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription will be cancelled at period end',
      });

      await billing.cancel();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/cancel',
        body: { immediately: false },
      });
    });

    it('should cancel subscription immediately', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription cancelled immediately',
      });

      await billing.cancel({ immediately: true });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/cancel',
        body: { immediately: true },
      });
    });

    it('should cancel with reason', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription cancelled',
      });

      await billing.cancel({ reason: 'Too expensive' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/cancel',
        body: { immediately: false, reason: 'Too expensive' },
      });
    });
  });

  describe('resume', () => {
    it('should resume a cancelled subscription', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription resumed successfully',
      });

      await billing.resume();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/resume',
        body: {},
      });
    });
  });

  describe('pause', () => {
    it('should pause subscription', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription paused',
        status: 'paused',
        pausedAt: '2024-01-15T00:00:00Z',
      });

      const result = await billing.pause();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/pause',
        body: {},
      });
      expect(result.status).toBe('paused');
    });

    it('should pause with reason', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription paused',
        status: 'paused',
      });

      await billing.pause({ reason: 'Taking a break' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/pause',
        body: { reason: 'Taking a break' },
      });
    });
  });

  describe('unpause', () => {
    it('should unpause subscription', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Subscription resumed',
        status: 'active',
      });

      const result = await billing.unpause();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/unpause',
        body: {},
      });
      expect(result.status).toBe('active');
    });
  });

  describe('downgrade', () => {
    it('should schedule subscription downgrade', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Downgrade scheduled',
        downgradeTo: 'free',
        effectiveDate: '2024-02-01T00:00:00Z',
        preview: {
          creditsReduction: 9000,
          featuresLost: ['audioTranscription'],
          rateLimitReductions: {
            api: { from: 300, to: 60 },
            search: { from: 100, to: 30 },
            bulk: { from: 50, to: 10 },
          },
        },
      });

      const result = await billing.downgrade('free');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/subscription/downgrade',
        body: { plan: 'free' },
      });
      expect(result.downgradeTo).toBe('free');
      expect(result.preview.creditsReduction).toBe(9000);
    });
  });

  describe('getDowngradeStatus', () => {
    it('should get downgrade status when scheduled', async () => {
      mockClient.request.mockResolvedValue({
        hasScheduledDowngrade: true,
        currentPlan: 'plus',
        downgradeTo: 'free',
        downgradeToDisplay: 'Free',
        effectiveDate: '2024-02-01T00:00:00Z',
        scheduledAt: '2024-01-15T00:00:00Z',
      });

      const result = await billing.getDowngradeStatus();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/subscription/downgrade',
      });
      expect(result.hasScheduledDowngrade).toBe(true);
      expect(result.downgradeTo).toBe('free');
    });

    it('should get downgrade status when none scheduled', async () => {
      mockClient.request.mockResolvedValue({
        hasScheduledDowngrade: false,
        currentPlan: 'plus',
      });

      const result = await billing.getDowngradeStatus();

      expect(result.hasScheduledDowngrade).toBe(false);
      expect(result.downgradeTo).toBeUndefined();
    });
  });

  describe('cancelDowngrade', () => {
    it('should cancel scheduled downgrade', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Downgrade cancelled',
        currentPlan: 'plus',
      });

      const result = await billing.cancelDowngrade();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v1/billing/subscription/downgrade',
      });
      expect(result.currentPlan).toBe('plus');
    });
  });

  // ============================================================================
  // CREDITS
  // ============================================================================

  describe('getCredits', () => {
    it('should retrieve current credit balance', async () => {
      const mockBalance = {
        creditsAvailable: 5000,
        creditsUsedThisPeriod: 3000,
        creditsIncluded: 10000,
        creditsPurchased: 2000,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-02-01T00:00:00Z',
      };

      mockClient.request.mockResolvedValue({ balance: mockBalance });

      const result = await billing.getCredits();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/credits',
      });
      expect(result.creditsAvailable).toBe(5000);
      expect(result.creditsUsedThisPeriod).toBe(3000);
    });
  });

  describe('getTransactions', () => {
    it('should retrieve credit transactions', async () => {
      const mockTransactions = [
        {
          id: 'txn_1',
          type: 'debit',
          amount: -10,
          balanceAfter: 4990,
          actionType: 'embedding',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'txn_2',
          type: 'credit',
          amount: 1000,
          balanceAfter: 5000,
          description: 'Monthly credit allocation',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockClient.request.mockResolvedValue({
        transactions: mockTransactions,
        total: 2,
      });

      const result = await billing.getTransactions();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/credits/transactions',
        query: {},
      });
      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should retrieve transactions with filters', async () => {
      mockClient.request.mockResolvedValue({
        transactions: [],
        total: 0,
      });

      await billing.getTransactions({
        limit: 50,
        offset: 10,
        type: 'debit',
        actionType: 'embedding',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/credits/transactions',
        query: { limit: 50, offset: 10, type: 'debit', action_type: 'embedding' },
      });
    });
  });

  describe('purchaseCredits', () => {
    it('should create checkout session for credit purchase', async () => {
      mockClient.request.mockResolvedValue({
        checkoutUrl: 'https://checkout.paddle.com/credits_123',
        transactionId: 'txn_credit_456',
        credits: 5000,
        priceCents: 4999,
      });

      const result = await billing.purchaseCredits(5000);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/credits/purchase',
        body: { credits: 5000 },
      });
      expect(result.credits).toBe(5000);
      expect(result.priceCents).toBe(4999);
    });

    it('should support custom success URL', async () => {
      mockClient.request.mockResolvedValue({
        checkoutUrl: 'https://checkout.paddle.com/credits_789',
        credits: 10000,
        priceCents: 8999,
      });

      await billing.purchaseCredits(10000, { successUrl: 'https://app.example.com/credits/success' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/credits/purchase',
        body: { credits: 10000, success_url: 'https://app.example.com/credits/success' },
      });
    });
  });

  describe('getCreditPackages', () => {
    it('should retrieve available credit packages', async () => {
      mockClient.request.mockResolvedValue({
        packages: [
          {
            id: 'pkg_1000',
            credits: 1000,
            priceCents: 999,
            name: 'Starter Pack',
            pricePerCreditCents: 0.999,
            savingsPercent: 0,
          },
          {
            id: 'pkg_5000',
            credits: 5000,
            priceCents: 3999,
            name: 'Growth Pack',
            pricePerCreditCents: 0.8,
            savingsPercent: 20,
          },
        ],
        minimumPurchase: 500,
        baseRateCents: 1.0,
      });

      const result = await billing.getCreditPackages();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/credits/packages',
      });
      expect(result.packages).toHaveLength(2);
      expect(result.minimumPurchase).toBe(500);
    });
  });

  // ============================================================================
  // USAGE
  // ============================================================================

  describe('getUsage', () => {
    it('should retrieve current period usage', async () => {
      const mockUsage = {
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-02-01T00:00:00Z',
        memoriesCreated: 150,
        embeddingsGenerated: 300,
        searchesPerformed: 500,
        apiCalls: 1200,
        audioMinutesTranscribed: 45.5,
        creditsUsed: 3000,
        creditsRemaining: 7000,
        creditsByAction: {
          embedding: 1500,
          search: 500,
          transcription: 1000,
        },
      };

      mockClient.request.mockResolvedValue({ usage: mockUsage });

      const result = await billing.getUsage();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/usage',
      });
      expect(result.memoriesCreated).toBe(150);
      expect(result.creditsUsed).toBe(3000);
      expect(result.creditsByAction?.embedding).toBe(1500);
    });
  });

  describe('getUsageHistory', () => {
    it('should retrieve usage history', async () => {
      const mockHistory = [
        {
          id: 'usage_2024_01',
          periodStart: '2024-01-01T00:00:00Z',
          periodEnd: '2024-02-01T00:00:00Z',
          memoriesCreated: 200,
          creditsUsed: 5000,
          isFinalized: true,
        },
        {
          id: 'usage_2023_12',
          periodStart: '2023-12-01T00:00:00Z',
          periodEnd: '2024-01-01T00:00:00Z',
          memoriesCreated: 180,
          creditsUsed: 4500,
          isFinalized: true,
        },
      ];

      mockClient.request.mockResolvedValue({ history: mockHistory });

      const result = await billing.getUsageHistory();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/usage/history',
        query: {},
      });
      expect(result).toHaveLength(2);
      expect(result[0].isFinalized).toBe(true);
    });

    it('should retrieve usage history with limit', async () => {
      mockClient.request.mockResolvedValue({ history: [] });

      await billing.getUsageHistory({ limit: 6 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/usage/history',
        query: { limit: 6 },
      });
    });
  });

  // ============================================================================
  // SPENDING LIMIT
  // ============================================================================

  describe('getSpendingLimit', () => {
    it('should retrieve spending limit configuration', async () => {
      mockClient.request.mockResolvedValue({
        spendingLimit: {
          enabled: true,
          limitCredits: 5000,
          creditsUsed: 2500,
          remaining: 2500,
        },
      });

      const result = await billing.getSpendingLimit();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/spending-limit',
      });
      expect(result.enabled).toBe(true);
      expect(result.limitCredits).toBe(5000);
      expect(result.remaining).toBe(2500);
    });
  });

  describe('setSpendingLimit', () => {
    it('should set spending limit', async () => {
      mockClient.request.mockResolvedValue({
        spendingLimit: {
          enabled: true,
          limitCredits: 10000,
          creditsUsed: 0,
          remaining: 10000,
        },
      });

      const result = await billing.setSpendingLimit(10000);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v1/billing/spending-limit',
        body: { limit_credits: 10000, enabled: true },
      });
      expect(result.limitCredits).toBe(10000);
    });
  });

  describe('disableSpendingLimit', () => {
    it('should disable spending limit', async () => {
      mockClient.request.mockResolvedValue({
        spendingLimit: {
          enabled: false,
          limitCredits: 0,
          creditsUsed: 2500,
          remaining: 0,
        },
      });

      const result = await billing.disableSpendingLimit();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v1/billing/spending-limit',
        body: { enabled: false },
      });
      expect(result.enabled).toBe(false);
    });
  });

  // ============================================================================
  // NOTIFICATION PREFERENCES
  // ============================================================================

  describe('getNotificationPreferences', () => {
    it('should retrieve notification preferences', async () => {
      mockClient.request.mockResolvedValue({
        preferences: {
          emailAlerts: true,
          creditThreshold: 20,
          thresholdEnabled: true,
          weeklyDigest: true,
          invoiceAlerts: true,
          usageAlerts: false,
        },
      });

      const result = await billing.getNotificationPreferences();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/notification-preferences',
      });
      expect(result.emailAlerts).toBe(true);
      expect(result.creditThreshold).toBe(20);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      mockClient.request.mockResolvedValue({
        preferences: {
          emailAlerts: true,
          creditThreshold: 10,
          thresholdEnabled: true,
          weeklyDigest: false,
          invoiceAlerts: true,
          usageAlerts: true,
        },
      });

      const result = await billing.updateNotificationPreferences({
        creditThreshold: 10,
        weeklyDigest: false,
        usageAlerts: true,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v1/billing/notification-preferences',
        body: {
          credit_threshold: 10,
          weekly_digest: false,
          usage_alerts: true,
        },
      });
      expect(result.creditThreshold).toBe(10);
      expect(result.weeklyDigest).toBe(false);
    });
  });

  // ============================================================================
  // COSTS
  // ============================================================================

  describe('getCosts', () => {
    it('should retrieve credit costs', async () => {
      const mockCosts = [
        {
          actionType: 'embedding',
          provider: 'openai',
          model: 'text-embedding-ada-002',
          creditsPerUnit: 0.1,
          unitType: 'token_1k',
          unitMultiplier: 1.0,
        },
        {
          actionType: 'search',
          creditsPerUnit: 1.0,
          unitType: 'request',
          unitMultiplier: 1.0,
        },
      ];

      mockClient.request.mockResolvedValue({ costs: mockCosts });

      const result = await billing.getCosts();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/costs',
        query: {},
      });
      expect(result).toHaveLength(2);
      expect(result[0].actionType).toBe('embedding');
    });

    it('should retrieve costs with filters', async () => {
      mockClient.request.mockResolvedValue({ costs: [] });

      await billing.getCosts({ actionType: 'embedding', provider: 'openai' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/costs',
        query: { action_type: 'embedding', provider: 'openai' },
      });
    });
  });

  describe('getCostsSummary', () => {
    it('should retrieve cost summary by action type', async () => {
      const mockSummary = [
        {
          actionType: 'embedding',
          providers: ['openai', 'cohere'],
          models: ['text-embedding-ada-002', 'embed-english-v3.0'],
          ruleCount: 4,
          minCost: 0.05,
          maxCost: 0.2,
        },
        {
          actionType: 'search',
          providers: [],
          models: [],
          ruleCount: 1,
          minCost: 1.0,
          maxCost: 1.0,
        },
      ];

      mockClient.request.mockResolvedValue({ summary: mockSummary });

      const result = await billing.getCostsSummary();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/costs/summary',
      });
      expect(result).toHaveLength(2);
      expect(result[0].actionType).toBe('embedding');
      expect(result[0].providers).toContain('openai');
    });
  });

  // ============================================================================
  // BILLING PORTAL
  // ============================================================================

  describe('getPortal', () => {
    it('should get billing portal URL', async () => {
      mockClient.request.mockResolvedValue({
        url: 'https://billing.paddle.com/portal_session_123',
        expiresAt: '2024-01-15T12:00:00Z',
      });

      const result = await billing.getPortal();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/billing/portal',
        body: {},
      });
      expect(result.url).toContain('billing.paddle.com');
      expect(result.expiresAt).toBeDefined();
    });
  });

  // ============================================================================
  // GRACE PERIOD
  // ============================================================================

  describe('getGracePeriodStatus', () => {
    it('should retrieve grace period status when active', async () => {
      mockClient.request.mockResolvedValue({
        gracePeriod: {
          isActive: true,
          daysRemaining: 5,
          endDate: '2024-01-20T00:00:00Z',
          reason: 'payment_failed',
        },
      });

      const result = await billing.getGracePeriodStatus();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/subscription/grace-period',
      });
      expect(result.isActive).toBe(true);
      expect(result.daysRemaining).toBe(5);
      expect(result.reason).toBe('payment_failed');
    });

    it('should retrieve grace period status when inactive', async () => {
      mockClient.request.mockResolvedValue({
        gracePeriod: {
          isActive: false,
          daysRemaining: 0,
        },
      });

      const result = await billing.getGracePeriodStatus();

      expect(result.isActive).toBe(false);
      expect(result.endDate).toBeUndefined();
    });
  });

  // ============================================================================
  // AUDIT LOG
  // ============================================================================

  describe('getAuditLog', () => {
    it('should retrieve billing audit log', async () => {
      const mockAuditLog = [
        {
          id: 'audit_1',
          accountId: 'acc_123',
          userId: 'user_456',
          action: 'subscription_upgrade',
          details: { fromPlan: 'free', toPlan: 'plus' },
          ipAddress: '192.168.1.1',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'audit_2',
          accountId: 'acc_123',
          action: 'spending_limit_change',
          details: { newLimit: 5000 },
          createdAt: '2024-01-14T09:00:00Z',
        },
      ];

      mockClient.request.mockResolvedValue({
        auditLog: mockAuditLog,
        total: 2,
        limit: 50,
        offset: 0,
      });

      const result = await billing.getAuditLog();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/audit',
        query: {},
      });
      expect(result.auditLog).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should retrieve audit log with filters', async () => {
      mockClient.request.mockResolvedValue({
        auditLog: [],
        total: 0,
        limit: 20,
        offset: 10,
      });

      await billing.getAuditLog({
        limit: 20,
        offset: 10,
        action: 'subscription_upgrade',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/billing/audit',
        query: { limit: 20, offset: 10, action: 'subscription_upgrade' },
      });
    });
  });
});

// ============================================================================
// TYPE TESTS - Ensure types are properly exported
// ============================================================================

describe('Billing Types', () => {
  it('should have proper type exports', () => {
    // These tests ensure TypeScript compilation works with our types
    // They verify the shape of the types at compile time

    const plan: import('../src/resources/billing').SubscriptionPlan = {
      id: 'test',
      name: 'test',
      displayName: 'Test',
      includedCredits: 1000,
      rateLimitApi: 60,
      rateLimitSearch: 30,
      rateLimitBulk: 10,
      priceMonthly: 0,
      priceYearly: 0,
    };

    const subscription: import('../src/resources/billing').Subscription = {
      id: 'sub_1',
      plan,
      status: 'active',
      billingPeriod: 'monthly',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
    };

    const balance: import('../src/resources/billing').CreditBalance = {
      creditsAvailable: 5000,
      creditsUsedThisPeriod: 2500,
      creditsIncluded: 10000,
      creditsPurchased: 0,
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-02-01T00:00:00Z',
    };

    expect(plan.name).toBe('test');
    expect(subscription.status).toBe('active');
    expect(balance.creditsAvailable).toBe(5000);
  });
});
