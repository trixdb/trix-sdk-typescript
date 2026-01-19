/**
 * Billing resource for subscription, credits, and usage management.
 *
 * This file re-exports from the modular billing implementation for backward compatibility.
 * The implementation is now split into:
 * - billing/billing.types.ts: All type definitions
 * - billing/billing.helpers.ts: Parameter building utilities
 * - billing/billing.resource.ts: Main Billing class
 *
 * @see billing/index.ts for the complete export list
 */

export * from './billing/index.js';
