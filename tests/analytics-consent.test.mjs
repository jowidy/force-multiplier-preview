import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAnalyticsConsent,
  consumeDisableOverride,
  loadGoogleTagManager,
} from '../src/lib/analytics-consent.mjs';

function fixture({
  stored = null,
  readFails = false,
  writeFails = false,
  initialChoice = null,
} = {}) {
  const events = [];
  const consent = createAnalyticsConsent({
    readChoice: () => {
      if (readFails) throw new Error('Storage blocked');
      return stored;
    },
    saveChoice: (value) => {
      if (writeFails) throw new Error('Storage blocked');
      events.push(['save', value]);
    },
    startAnalytics: () => events.push(['start']),
    reloadWithoutAnalytics: (persisted) => events.push(['reload', persisted]),
    initialChoice,
  });
  return {
    consent,
    events,
    setStored: (value) => {
      stored = value;
    },
  };
}

test('missing, invalid and declined consent never starts analytics', () => {
  for (const stored of [null, '', 'true', 'accepted', 'YES', 'no']) {
    const { consent, events } = fixture({ stored });
    assert.equal(consent.choice, stored === 'no' ? 'no' : null);
    assert.deepEqual(events, []);
  }
});

test('an explicit acceptance starts analytics once despite repeated clicks', () => {
  const { consent, events } = fixture();
  consent.accept();
  consent.accept();
  assert.equal(consent.choice, 'yes');
  assert.equal(events.filter(([event]) => event === 'start').length, 1);
  assert.deepEqual(events[0], ['save', 'yes']);
});

test('saved acceptance starts analytics without needing a new click', () => {
  const { consent, events } = fixture({ stored: 'yes' });
  consent.accept();
  assert.equal(events.filter(([event]) => event === 'start').length, 1);
});

test('declining before acceptance saves no without loading or reloading', () => {
  const { consent, events } = fixture();
  consent.decline();
  assert.equal(consent.choice, 'no');
  assert.deepEqual(events, [['save', 'no']]);
});

test('declining after acceptance saves no before requesting a reload', () => {
  const { consent, events } = fixture({ stored: 'yes' });
  consent.decline();
  assert.deepEqual(events, [['start'], ['save', 'no'], ['reload', true]]);
});

test('blocked storage does not grant consent and retains the current-page choice', () => {
  const { consent, events } = fixture({ readFails: true, writeFails: true });
  assert.equal(consent.choice, null);
  assert.equal(consent.storageAvailable, false);
  assert.deepEqual(events, []);
  consent.accept();
  consent.accept();
  assert.equal(consent.choice, 'yes');
  assert.equal(consent.storageAvailable, false);
  assert.deepEqual(events, [['start']]);
});

test('a failed decline write requires the deny-only reload override', () => {
  const { consent, events } = fixture({ stored: 'yes', writeFails: true });
  consent.decline();
  assert.equal(consent.choice, 'no');
  assert.deepEqual(events, [['start'], ['reload', false]]);
  const reloaded = fixture({ stored: 'yes', writeFails: true, initialChoice: 'no' });
  assert.equal(reloaded.consent.choice, 'no');
  assert.equal(reloaded.consent.storageAvailable, false);
  assert.deepEqual(reloaded.events, []);
});

test('a restored accepted page stops analytics when another page saved no', () => {
  const { consent, events, setStored } = fixture({ stored: 'yes' });
  setStored('no');
  consent.reconcile();
  assert.equal(consent.choice, 'no');
  assert.deepEqual(events, [['start'], ['save', 'no'], ['reload', true]]);
  consent.reconcile();
  assert.equal(events.filter(([event]) => event === 'reload').length, 1);
});

test('a cross-tab decline stops an accepted runtime even if writing storage fails', () => {
  const { consent, events } = fixture({ stored: 'yes', writeFails: true });
  consent.reconcile('no');
  assert.equal(consent.choice, 'no');
  assert.deepEqual(events, [['start'], ['reload', false]]);
});

test('reconciliation never grants consent or reloads a page without a loaded tag', () => {
  const { consent, events } = fixture();
  for (const value of ['yes', 'no', null, 'invalid']) consent.reconcile(value);
  assert.equal(consent.choice, null);
  assert.deepEqual(events, []);
});

test('the deny override is removed while other query values and fragments survive', () => {
  let cleaned;
  assert.equal(
    consumeDisableOverride('https://example.com/contact/?from=home&fm_analytics=no#form', (url) => {
      cleaned = url;
    }),
    true,
  );
  assert.equal(cleaned, 'https://example.com/contact/?from=home#form');
  assert.equal(
    consumeDisableOverride('https://example.com/?fm_analytics=yes', () =>
      assert.fail('must not consume yes'),
    ),
    false,
  );
  assert.equal(
    consumeDisableOverride('https://example.com/?fm_analytics=no', () => {
      throw new Error('Blocked history');
    }),
    true,
  );
});

test('loader inserts only the fixed async GTM script and initialization event once', () => {
  const nodes = [];
  const document = {
    getElementById: (id) => nodes.find((node) => node.id === id),
    createElement: (tag) => ({ tag }),
    head: { appendChild: (node) => nodes.push(node) },
  };
  const browser = {};
  loadGoogleTagManager(browser, document);
  loadGoogleTagManager(browser, document);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].tag, 'script');
  assert.equal(nodes[0].async, true);
  assert.equal(nodes[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-MNZSRTLV');
  assert.equal(browser.dataLayer.length, 1);
  assert.equal(browser.dataLayer[0].event, 'gtm.js');
  assert.equal(typeof browser.dataLayer[0]['gtm.start'], 'number');
  assert.deepEqual(Object.keys(browser.dataLayer[0]).sort(), ['event', 'gtm.start']);
});
