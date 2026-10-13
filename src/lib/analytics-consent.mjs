export const ANALYTICS_STORAGE_KEY = 'fm-analytics-choice';
export const ANALYTICS_DISABLE_PARAMETER = 'fm_analytics';
export const GOOGLE_TAG_MANAGER_ID = 'GTM-MNZSRTLV';

// The only values that grant or deny analytics are these explicit choices.
export function createAnalyticsConsent({
  readChoice,
  saveChoice,
  startAnalytics,
  reloadWithoutAnalytics,
  initialChoice = null,
}) {
  let choice = initialChoice === 'no' ? 'no' : null;
  let started = false;
  let storageAvailable = true;
  if (!choice) {
    try {
      const stored = readChoice();
      if (stored === 'yes' || stored === 'no') choice = stored;
    } catch {
      storageAvailable = false;
    }
  }
  const remember = (value) => {
    try {
      saveChoice(value);
      storageAvailable = true;
      return true;
    } catch {
      storageAvailable = false;
      return false;
    }
  };
  const start = () => {
    if (started) return;
    started = true;
    startAnalytics();
  };
  const decline = () => {
    choice = 'no';
    const persisted = remember(choice);
    if (started) reloadWithoutAnalytics(persisted);
  };
  if (initialChoice === 'no') remember('no');
  if (choice === 'yes') start();
  return {
    get choice() {
      return choice;
    },
    get storageAvailable() {
      return storageAvailable;
    },
    accept() {
      choice = 'yes';
      remember(choice);
      start();
    },
    decline,
    reconcile(savedChoice) {
      let latest = savedChoice;
      if (latest === undefined) {
        try {
          latest = readChoice();
        } catch {
          storageAvailable = false;
          return;
        }
      }
      // Revocation on another page must also stop an already-running tag here.
      if (choice === 'yes' && latest === 'no') decline();
    },
  };
}

export function loadGoogleTagManager(browserWindow, document) {
  if (document.getElementById('fm-gtm-loader')) return;
  browserWindow.dataLayer = browserWindow.dataLayer || [];
  browserWindow.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'fm-gtm-loader';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}`;
  document.head.appendChild(script);
}

// A failed write must not let a stale saved "yes" restart analytics on reload.
// This exceptional override can only deny analytics and is removed immediately.
export function consumeDisableOverride(href, replaceUrl) {
  const url = new URL(href);
  if (url.searchParams.get(ANALYTICS_DISABLE_PARAMETER) !== 'no') return false;
  url.searchParams.delete(ANALYTICS_DISABLE_PARAMETER);
  try {
    replaceUrl(url.href);
  } catch {
    // Keeping the deny-only URL flag is safer than resuming analytics.
  }
  return true;
}

export function initializeAnalyticsConsent(browserWindow, document) {
  const notice = document.getElementById('analytics-consent');
  const settings = document.getElementById('analytics-settings');
  const accept = document.getElementById('analytics-accept');
  const decline = document.getElementById('analytics-decline');
  const status = document.getElementById('analytics-choice-status');
  if (!notice || !settings || !accept || !decline || !status) return;

  const override = consumeDisableOverride(browserWindow.location.href, (url) => {
    browserWindow.history.replaceState(browserWindow.history.state, '', url);
  });
  const consent = createAnalyticsConsent({
    readChoice: () => browserWindow.localStorage.getItem(ANALYTICS_STORAGE_KEY),
    saveChoice: (value) => browserWindow.localStorage.setItem(ANALYTICS_STORAGE_KEY, value),
    startAnalytics: () => loadGoogleTagManager(browserWindow, document),
    reloadWithoutAnalytics: (persisted) => {
      if (persisted) browserWindow.location.reload();
      else {
        const url = new URL(browserWindow.location.href);
        url.searchParams.set(ANALYTICS_DISABLE_PARAMETER, 'no');
        browserWindow.location.replace(url.href);
      }
    },
    initialChoice: override ? 'no' : null,
  });

  let openedFromSettings = false;
  const setOpen = (open) => {
    notice.hidden = !open;
    settings.setAttribute('aria-expanded', String(open));
  };
  const updateStatus = () => {
    if (!consent.choice) return;
    status.textContent = `Analytics ${consent.choice === 'yes' ? 'on' : 'off'}.${
      consent.storageAvailable
        ? ''
        : ' Browser storage is unavailable, so you may need to choose again on another page or visit.'
    }`;
  };
  const closeAfterChoice = () => {
    const moveFocus = notice.contains(document.activeElement);
    setOpen(false);
    updateStatus();
    if (moveFocus)
      (openedFromSettings ? settings : document.querySelector('main'))?.focus({
        preventScroll: true,
      });
  };
  settings.addEventListener('click', () => {
    openedFromSettings = true;
    setOpen(true);
    accept.focus({ preventScroll: true });
  });
  accept.addEventListener('click', () => {
    consent.accept();
    closeAfterChoice();
  });
  decline.addEventListener('click', () => {
    consent.decline();
    closeAfterChoice();
  });
  browserWindow.addEventListener('storage', (event) => {
    if (event.key === ANALYTICS_STORAGE_KEY) consent.reconcile(event.newValue);
  });
  browserWindow.addEventListener('pageshow', (event) => {
    if (event.persisted) consent.reconcile();
  });
  settings.hidden = false;
  setOpen(consent.choice === null);
  updateStatus();
}

// Imported by Node tests without a browser, and inlined only in production HTML.
if (typeof window !== 'undefined' && typeof document !== 'undefined')
  initializeAnalyticsConsent(window, document);
