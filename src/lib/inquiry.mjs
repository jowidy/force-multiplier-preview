const fieldNames = ['name', 'email', 'business', 'interest', 'message'];

/** @param {{ get: (name: string) => unknown }} data */
export function serializeInquiry(data) {
  const body = new URLSearchParams({ 'form-name': 'inquiry' });
  for (const name of fieldNames) {
    const value = data.get(name);
    body.set(name, typeof value === 'string' ? value.trim() : '');
  }
  const honeypot = data.get('bot-field');
  body.set('bot-field', typeof honeypot === 'string' ? honeypot : '');
  return body.toString();
}

/**
 * A redirected GET can succeed even when the preceding POST was not processed.
 * Never turn a redirect or a failed request into a submission confirmation.
 * @param {string} action
 * @param {string} body
 * @param {{ fetcher?: typeof fetch, timeoutMs?: number }} [options]
 * @returns {Promise<'accepted' | 'rejected' | 'unconfirmed' | 'timed-out'>}
 */
export async function submitInquiry(action, body, options = {}) {
  const fetcher = options.fetcher ?? globalThis.fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const response = await fetcher(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      credentials: 'same-origin',
      redirect: 'error',
      signal: controller.signal,
    });
    if (response.redirected || response.type === 'opaqueredirect') return 'unconfirmed';
    return response.ok ? 'accepted' : 'rejected';
  } catch {
    return controller.signal.aborted ? 'timed-out' : 'unconfirmed';
  } finally {
    clearTimeout(timeout);
  }
}
