/**
 * Inbound webhook signature verification.
 *
 * Verifies the `X-Webhook-Signature` header Trix sends with every webhook
 * delivery, so receivers can prove a payload is authentic and un-tampered.
 *
 * The scheme mirrors the Trix API (`src/lib/webhook-service.js`) exactly:
 *   - Header format: `t=<unixSeconds>,v1=<hexHmac>`.
 *   - `v1` is the lowercase-hex HMAC-SHA256 of `` `${t}.${rawBody}` ``, keyed by
 *     the endpoint's signing secret.
 *   - Deliveries whose timestamp is more than `toleranceSeconds` (default 300)
 *     away from now are rejected, to defeat replay attacks.
 *
 * Implemented with Web Crypto (`globalThis.crypto.subtle`) so it runs unchanged
 * in Node 20+, Deno, Bun, Cloudflare Workers and the browser.
 */

import { WebhookVerificationError } from '../errors.js';

/** Default replay-protection window, in seconds (matches the Trix API). */
export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;

/** Options for {@link verifyWebhookSignature} and {@link unwrapWebhookPayload}. */
export interface VerifyWebhookOptions {
  /**
   * Maximum accepted age of the signed timestamp, in seconds. A delivery whose
   * timestamp differs from the current time by more than this is rejected.
   * Defaults to {@link DEFAULT_WEBHOOK_TOLERANCE_SECONDS} (300).
   */
  toleranceSeconds?: number;
}

/** Header shape: `t=<digits>,v1=<lowercase-hex>`. */
const SIGNATURE_HEADER_PATTERN = /^t=(\d+),v1=([a-f0-9]+)$/;

interface ParsedSignature {
  timestamp: number;
  rawTimestamp: string;
  signature: string;
}

/** Parse a well-formed `X-Webhook-Signature` header, or return `null`. */
function parseSignatureHeader(header: string): ParsedSignature | null {
  if (typeof header !== 'string') {
    return null;
  }
  const match = SIGNATURE_HEADER_PATTERN.exec(header.trim());
  if (!match) {
    return null;
  }
  return { timestamp: parseInt(match[1], 10), rawTimestamp: match[1], signature: match[2] };
}

/** Lowercase-hex encode raw bytes (matches Node's `.digest('hex')`). */
function bytesToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/** Compute the lowercase-hex HMAC-SHA256 of `message` under `secret`. */
async function computeHmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(signature);
}

/**
 * Constant-time comparison of two hex strings. Any length difference is folded
 * into the result and the loop always runs over `expected`, so the running time
 * never depends on where (or whether) the strings first diverge.
 */
function timingSafeHexEqual(expected: string, provided: string): boolean {
  let mismatch = expected.length === provided.length ? 0 : 1;
  for (let i = 0; i < expected.length; i++) {
    const providedCharCode = i < provided.length ? provided.charCodeAt(i) : 0;
    mismatch |= expected.charCodeAt(i) ^ providedCharCode;
  }
  return mismatch === 0;
}

/**
 * Verify an inbound webhook signature.
 *
 * @param payload - The exact raw request body string as received. Verify the
 *   raw bytes, never a re-serialized object — re-`JSON.stringify` reorders keys
 *   and breaks the HMAC.
 * @param signatureHeader - The `X-Webhook-Signature` header value.
 * @param secret - The endpoint's signing secret.
 * @param options - Optional overrides (see {@link VerifyWebhookOptions}).
 * @returns `true` iff the signature is valid and within the tolerance window;
 *   `false` for tampering, a wrong secret, an expired timestamp or a malformed
 *   header. Fails closed and never throws for verification outcomes.
 *
 * @example
 * ```typescript
 * const ok = await verifyWebhookSignature(
 *   rawBody,
 *   request.headers['x-webhook-signature'] as string,
 *   process.env.TRIX_WEBHOOK_SECRET!
 * );
 * if (!ok) throw new Error('Untrusted webhook');
 * ```
 */
export async function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  options: VerifyWebhookOptions = {}
): Promise<boolean> {
  if (typeof payload !== 'string' || typeof secret !== 'string' || secret.length === 0) {
    return false;
  }
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    return false;
  }

  const tolerance = options.toleranceSeconds ?? DEFAULT_WEBHOOK_TOLERANCE_SECONDS;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > tolerance) {
    return false;
  }

  const expected = await computeHmacHex(secret, `${parsed.rawTimestamp}.${payload}`);
  return timingSafeHexEqual(expected, parsed.signature);
}

/**
 * Verify an inbound webhook signature and return the parsed JSON body.
 *
 * @typeParam T - Expected shape of the decoded payload.
 * @param payload - The exact raw request body string as received.
 * @param signatureHeader - The `X-Webhook-Signature` header value.
 * @param secret - The endpoint's signing secret.
 * @param options - Optional overrides (see {@link VerifyWebhookOptions}).
 * @returns The parsed payload (`JSON.parse(payload)`).
 * @throws {WebhookVerificationError} If the signature is invalid, expired or
 *   the header is malformed.
 *
 * @example
 * ```typescript
 * const event = await unwrapWebhookPayload<{ type: string }>(rawBody, header, secret);
 * ```
 */
export async function unwrapWebhookPayload<T = unknown>(
  payload: string,
  signatureHeader: string,
  secret: string,
  options: VerifyWebhookOptions = {}
): Promise<T> {
  const valid = await verifyWebhookSignature(payload, signatureHeader, secret, options);
  if (!valid) {
    throw new WebhookVerificationError();
  }
  return JSON.parse(payload) as T;
}
