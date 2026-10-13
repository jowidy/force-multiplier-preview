import assert from 'node:assert/strict';
import test from 'node:test';
import { serializeInquiry, submitInquiry } from '../src/lib/inquiry.mjs';

test('serializes the registered form fields without losing punctuation or line breaks', () => {
  const data = new FormData();
  data.set('name', '  Jos\u00e9 & Co  ');
  data.set('email', ' owner@example.com ');
  data.set('business', ' A+B = 1 ');
  data.set('interest', 'Website and messaging');
  data.set('message', '  First line?\nSecond line: 50% & more.  ');
  data.set('form-name', 'unexpected');
  data.set('bot-field', ' ');
  data.set('unregistered', 'omit me');
  const decoded = new URLSearchParams(serializeInquiry(data));
  assert.equal(decoded.get('form-name'), 'inquiry');
  assert.equal(decoded.get('name'), 'Jos\u00e9 & Co');
  assert.equal(decoded.get('email'), 'owner@example.com');
  assert.equal(decoded.get('business'), 'A+B = 1');
  assert.equal(decoded.get('message'), 'First line?\nSecond line: 50% & more.');
  assert.equal(decoded.get('bot-field'), ' ');
  assert.equal(decoded.has('unregistered'), false);
});

test('sends the body to the exact slash-normalized action and confirms an accepted response', async () => {
  const outcome = await submitInquiry('/thank-you/', 'form-name=inquiry&name=John', {
    fetcher: async (action, options) => {
      assert.equal(action, '/thank-you/');
      assert.equal(options.method, 'POST');
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
      assert.equal(options.body, 'form-name=inquiry&name=John');
      return new Response(null, { status: 200 });
    },
  });
  assert.equal(outcome, 'accepted');
});

test('a fulfilled fetch with an HTTP error is not a successful submission', async () => {
  for (const status of [400, 404, 405, 429, 500, 503]) {
    assert.equal(
      await submitInquiry('/thank-you/', '', {
        fetcher: async () => new Response(null, { status }),
      }),
      'rejected',
    );
  }
});

test('a successful redirected GET cannot stand in for an accepted POST', async () => {
  assert.equal(
    await submitInquiry('/thank-you/', '', {
      fetcher: async () => ({ ok: true, redirected: true, type: 'basic' }),
    }),
    'unconfirmed',
  );
});

test('network failure is unconfirmed rather than a claim that nothing was received', async () => {
  assert.equal(
    await submitInquiry('/thank-you/', '', {
      fetcher: async () => {
        throw new TypeError('Connection lost');
      },
    }),
    'unconfirmed',
  );
});

test('a request timeout aborts the pending fetch and stays unconfirmed', async () => {
  assert.equal(
    await submitInquiry('/thank-you/', '', {
      timeoutMs: 5,
      fetcher: (_action, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    }),
    'timed-out',
  );
});
