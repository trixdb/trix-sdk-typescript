/**
 * Tests for inbound webhook signature verification.
 *
 * Fixtures are signed with Node's `crypto` exactly as the Trix API does
 * (`src/lib/webhook-service.js` → `generateSignature`), which also proves the
 * SDK's Web Crypto implementation interoperates with Node's HMAC.
 */

import { createHmac } from 'crypto';
import { Webhooks } from '../src/resources/webhooks';
import { WebhookVerificationError } from '../src/errors';

const SECRET = 'whsec_test_secret';
const PAYLOAD = JSON.stringify({ event: 'memory.created', id: 'mem_123' });

/** Build an `X-Webhook-Signature` header the way the Trix API signs deliveries. */
function makeHeader(secret: string, timestamp: number, payload: string): string {
  const hmac = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return `t=${timestamp},v1=${hmac}`;
}

const now = (): number => Math.floor(Date.now() / 1000);

describe('Webhooks.verifySignature', () => {
  let webhooks: Webhooks;

  beforeEach(() => {
    webhooks = new Webhooks({ request: jest.fn() } as never);
  });

  it('returns true for a correctly-signed payload', async () => {
    const header = makeHeader(SECRET, now(), PAYLOAD);
    await expect(webhooks.verifySignature(PAYLOAD, header, SECRET)).resolves.toBe(true);
  });

  it('returns false when the payload is tampered with', async () => {
    const header = makeHeader(SECRET, now(), PAYLOAD);
    const tampered = PAYLOAD.replace('mem_123', 'mem_999');
    await expect(webhooks.verifySignature(tampered, header, SECRET)).resolves.toBe(false);
  });

  it('returns false for the wrong secret', async () => {
    const header = makeHeader(SECRET, now(), PAYLOAD);
    await expect(webhooks.verifySignature(PAYLOAD, header, 'whsec_wrong')).resolves.toBe(false);
  });

  it('returns false for an expired timestamp (beyond tolerance)', async () => {
    const stale = now() - 301; // default tolerance is 300s
    const header = makeHeader(SECRET, stale, PAYLOAD);
    await expect(webhooks.verifySignature(PAYLOAD, header, SECRET)).resolves.toBe(false);
  });

  it('accepts a stale timestamp within a widened tolerance', async () => {
    const stale = now() - 301;
    const header = makeHeader(SECRET, stale, PAYLOAD);
    await expect(
      webhooks.verifySignature(PAYLOAD, header, SECRET, { toleranceSeconds: 600 })
    ).resolves.toBe(true);
  });

  it('returns false for a future timestamp beyond tolerance', async () => {
    const future = now() + 400;
    const header = makeHeader(SECRET, future, PAYLOAD);
    await expect(webhooks.verifySignature(PAYLOAD, header, SECRET)).resolves.toBe(false);
  });

  it('returns false for malformed headers', async () => {
    const valid = makeHeader(SECRET, now(), PAYLOAD);
    const hex = valid.split('v1=')[1];
    const malformed = [
      '',
      'garbage',
      `v1=${hex}`, // missing t=
      `t=${now()}`, // missing v1=
      `t=abc,v1=${hex}`, // non-numeric timestamp
      `t=${now()},v1=NOTHEX!!`, // non-hex signature
      `t=${now()},v1=${hex.toUpperCase()}`, // uppercase hex rejected by pattern
    ];
    for (const header of malformed) {
      await expect(webhooks.verifySignature(PAYLOAD, header, SECRET)).resolves.toBe(false);
    }
  });

  it('returns false (no throw) when the signature length differs', async () => {
    const header = `t=${now()},v1=abcdef`; // valid hex, wrong length
    await expect(webhooks.verifySignature(PAYLOAD, header, SECRET)).resolves.toBe(false);
  });

  it('returns false for an empty secret', async () => {
    const header = makeHeader(SECRET, now(), PAYLOAD);
    await expect(webhooks.verifySignature(PAYLOAD, header, '')).resolves.toBe(false);
  });
});

describe('Webhooks.unwrap', () => {
  let webhooks: Webhooks;

  beforeEach(() => {
    webhooks = new Webhooks({ request: jest.fn() } as never);
  });

  it('returns the parsed payload when the signature is valid', async () => {
    const header = makeHeader(SECRET, now(), PAYLOAD);
    const event = await webhooks.unwrap<{ event: string; id: string }>(PAYLOAD, header, SECRET);
    expect(event).toEqual({ event: 'memory.created', id: 'mem_123' });
  });

  it('throws WebhookVerificationError when verification fails', async () => {
    const header = makeHeader('whsec_wrong', now(), PAYLOAD);
    await expect(webhooks.unwrap(PAYLOAD, header, SECRET)).rejects.toBeInstanceOf(
      WebhookVerificationError
    );
  });
});
