type Point = { x: number; y: number };
type Grain = {
  from: Point;
  to: Point;
  burst: Point;
  near: Point;
  phase: number;
  previous: Point;
};
type RowPlayer = {
  row: HTMLElement;
  track: HTMLElement;
  visible: boolean;
  played: boolean;
  running: boolean;
  start: () => void;
  finish: (completed?: boolean) => void;
  reset: () => void;
};

/** One persistent set of sampled glyph particles: hold, radial burst, swirl, re-form. */
export function initPriceComparisons() {
  document.querySelectorAll<HTMLElement>('[data-price-comparison]').forEach((section) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const controls = section.querySelector<HTMLElement>('[data-comparison-controls]')!;
    const stop = section.querySelector<HTMLButtonElement>('[data-stop-comparisons]')!;
    const replay = section.querySelector<HTMLButtonElement>('[data-replay-comparisons]')!;
    const status = section.querySelector<HTMLElement>('[data-comparison-status]')!;
    const HOLD = 500,
      BURST = 120,
      SWIRL = 750,
      FORM = 425,
      SETTLE = 112.5;
    let enabled = !reduced.matches;
    let ready = false;
    let seed = 19;
    let cycle = 0;
    let viewportFrame = 0;
    let previousViewport: { top: number; bottom: number } | undefined;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const ease = (t: number) => t * t * (3 - 2 * t);
    const mix = (a: Point, b: Point, t: number): Point => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
    const shuffle = <T>(items: T[]) => {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    };
    const startVisibleRows = () => {
      if (!ready || !enabled || reduced.matches || document.hidden) return;
      for (const item of rows) if (item.visible && !item.played && !item.running) item.start();
    };
    const rows: RowPlayer[] = Array.from(
      section.querySelectorAll<HTMLElement>('[data-comparison-row]:not([data-comparison-pending])'),
    ).map((row) => {
      const track = row.querySelector<HTMLElement>('[data-price-track]')!;
      const source = row.querySelector<HTMLElement>('[data-source-number]')!;
      const target = row.querySelector<HTMLElement>('[data-target-number]')!;
      const canvas = row.querySelector<HTMLCanvasElement>('[data-price-canvas]')!;
      const context = canvas.getContext('2d');
      let frame = 0;
      const player: RowPlayer = {
        row,
        track,
        visible: false,
        played: false,
        running: false,
        start,
        finish,
        reset,
      };
      function finish(completed = true) {
        cancelAnimationFrame(frame);
        player.running = false;
        context?.clearRect(0, 0, canvas.width, canvas.height);
        row.classList.remove('is-running');
        row.classList.toggle('is-complete', completed);
        row.classList.toggle('has-shadow', completed);
        player.played = completed;
        row.dataset.state = completed ? 'complete' : 'waiting';
        scheduleViewportSync();
      }
      function reset() {
        finish(false);
        row.classList.toggle('motion-ready', enabled && !reduced.matches && !!context);
        row.dataset.state = enabled && !reduced.matches && context ? 'waiting' : 'static';
        if (!context) player.played = true;
      }
      function sample(element: HTMLElement, width: number, height: number, step: number) {
        const mask = document.createElement('canvas');
        mask.width = Math.ceil(width);
        mask.height = Math.ceil(height);
        const maskContext = mask.getContext('2d', { willReadFrequently: true });
        if (!maskContext) return [];
        const bounds = element.getBoundingClientRect(),
          area = track.getBoundingClientRect();
        const style = getComputedStyle(element);
        maskContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        maskContext.textAlign = 'center';
        const metrics = maskContext.measureText(element.textContent || '');
        const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
        const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
        const baseline = bounds.top - area.top + (bounds.height - ascent - descent) / 2 + ascent;
        maskContext.fillText(
          element.textContent || '',
          bounds.left - area.left + bounds.width / 2,
          baseline,
        );
        const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
        const points: Point[] = [];
        for (let y = 0; y < mask.height; y += step)
          for (let x = 0; x < mask.width; x += step) {
            if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] > 100)
              points.push({ x, y });
          }
        return points;
      }
      function start() {
        if (!context || player.running || !enabled || reduced.matches) return;
        row.classList.remove('is-complete', 'has-shadow');
        const particleColor = getComputedStyle(source).color;
        const { width, height } = track.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const step = width < 350 ? 1.15 : 1.8;
        const from = shuffle(sample(source, width, height, step));
        const to = shuffle(sample(target, width, height, step));
        if (!from.length || !to.length) {
          finish();
          return;
        }
        const sourceBox = source.getBoundingClientRect(),
          area = track.getBoundingClientRect();
        const center = {
          x: sourceBox.left - area.left + sourceBox.width / 2,
          y: sourceBox.top - area.top + sourceBox.height / 2,
        };
        const count = Math.min(1800, Math.max(from.length, to.length));
        const grains: Grain[] = Array.from({ length: count }, (_, i) => {
          const origin = from[Math.floor((i * from.length) / count)];
          const destination = to[Math.floor((i * to.length) / count)];
          const phase = random() * Math.PI * 2;
          const angle =
            Math.atan2(origin.y - center.y, origin.x - center.x) + (random() - 0.5) * 0.6;
          const radius = Math.min(width * 0.24, 115) * (0.3 + random() * 0.7);
          // Keep the existing random sequence so a color change does not alter trajectories.
          random();
          return {
            from: origin,
            to: destination,
            previous: origin,
            phase,
            burst: {
              x: Math.max(3, Math.min(width - 3, origin.x + Math.cos(angle) * radius)),
              y: Math.max(8, Math.min(height - 8, origin.y + Math.sin(angle) * radius)),
            },
            near: {
              x: destination.x + Math.cos(phase) * Math.min(width * 0.08, 35),
              y: destination.y + Math.sin(phase) * 34,
            },
          };
        });
        row.dataset.particleCount = String(count);
        row.dataset.sourceSamples = String(from.length);
        row.dataset.targetSamples = String(to.length);
        row.dataset.particleGeneration = String(++cycle);
        row.dataset.holdMs = String(HOLD);
        row.dataset.burstMs = String(BURST);
        row.dataset.swirlMs = String(SWIRL);
        row.dataset.formMs = String(FORM);
        row.dataset.settleMs = String(SETTLE);
        row.dataset.state = HOLD > 0 ? 'holding' : 'bursting';
        row.classList.add('is-running');
        row.classList.remove('is-complete', 'has-shadow');
        player.running = true;
        const began = performance.now();
        const draw = (now: number) => {
          // A frame timestamp can precede rows initialized later in that same frame.
          const elapsed = Math.max(0, now - began);
          context!.clearRect(0, 0, width, height);
          if (elapsed < HOLD) {
            row.dataset.state = 'holding';
            frame = requestAnimationFrame(draw);
            return;
          }
          row.classList.add('has-shadow');
          const time = elapsed - HOLD;
          row.dataset.state =
            time < BURST
              ? 'bursting'
              : time < BURST + SWIRL
                ? 'swirling'
                : time < BURST + SWIRL + FORM
                  ? 'reforming'
                  : 'settled';
          for (const grain of grains) {
            let point: Point;
            let flight = false;
            if (time < BURST) {
              const t = time / BURST;
              point = mix(grain.from, grain.burst, 1 - Math.pow(1 - t, 4));
              flight = true;
            } else if (time < BURST + SWIRL) {
              const t = (time - BURST) / SWIRL;
              point = mix(grain.burst, grain.near, ease(t));
              const envelope = Math.sin(Math.PI * t);
              const amplitude = Math.min(width * 0.11, 54) * envelope;
              point.x += Math.cos(grain.phase + t * Math.PI * 2.3) * amplitude * 0.45;
              point.y += Math.sin(grain.phase + t * Math.PI * 2.3) * amplitude;
              flight = t < 0.85;
            } else {
              const t = Math.min(1, (time - BURST - SWIRL) / FORM);
              point = mix(grain.near, grain.to, 1 - Math.pow(1 - t, 3));
            }
            if (flight && time >= BURST) {
              context!.globalAlpha = 0.22;
              context!.strokeStyle = particleColor;
              context!.lineWidth = step * 0.65;
              context!.beginPath();
              context!.moveTo(grain.previous.x, grain.previous.y);
              context!.lineTo(point.x, point.y);
              context!.stroke();
            }
            context!.globalAlpha = 1;
            context!.fillStyle = particleColor;
            context!.beginPath();
            context!.arc(point.x, point.y, step * (flight ? 0.62 : 0.64), 0, Math.PI * 2);
            context!.fill();
            grain.previous = point;
          }
          if (time < BURST + SWIRL + FORM + SETTLE) frame = requestAnimationFrame(draw);
          else finish();
        };
        draw(began);
      }
      new ResizeObserver(() => {
        if (player.running) finish();
      }).observe(track);
      return player;
    });

    // Source disclosures remain native details/summary controls without JavaScript.
    section.dataset.comparisonEnhanced = '';
    const details = Array.from(section.querySelectorAll<HTMLDetailsElement>('[data-source-info]'));
    const tableHead = section.querySelector<HTMLElement>('.comparison-table-head');
    function positionDisclosure(detail: HTMLDetailsElement) {
      if (!detail.open) {
        detail.style.removeProperty('--comparison-popup-top');
        detail.style.removeProperty('--comparison-popup-max-height');
        return;
      }
      const summary = detail.querySelector('summary');
      const popup = detail.querySelector<HTMLElement>('.comparison-evidence');
      const track = detail.closest<HTMLElement>('[data-price-track]');
      if (!summary || !popup || !track) return;
      const trigger = summary.getBoundingClientRect();
      const headBounds = tableHead?.getBoundingClientRect();
      const headerAbove =
        headBounds &&
        headBounds.bottom > 0 &&
        headBounds.top < window.innerHeight &&
        headBounds.top <= trigger.top;
      const floor = headerAbove ? Math.max(8, headBounds.bottom + 8) : 8;
      const viewportBottom = window.innerHeight - 8;
      const below = Math.max(floor, trigger.bottom + 8);
      const above = Math.min(viewportBottom, trigger.top - 8);
      const roomBelow = Math.max(0, viewportBottom - below);
      const roomAbove = Math.max(0, above - floor);
      detail.style.removeProperty('--comparison-popup-max-height');
      const naturalHeight = popup.getBoundingClientRect().height;
      const offscreen = trigger.bottom <= floor || trigger.top >= viewportBottom;
      const placeBelow =
        naturalHeight <= roomBelow || (naturalHeight > roomAbove && roomBelow >= roomAbove);
      const maxHeight = offscreen
        ? Math.max(0, viewportBottom - floor)
        : placeBelow
          ? roomBelow
          : roomAbove;
      detail.style.setProperty('--comparison-popup-max-height', `${maxHeight}px`);
      const height = popup.getBoundingClientRect().height;
      const desired = placeBelow ? below : above - height;
      const top = Math.max(floor, Math.min(desired, viewportBottom - height));
      detail.style.setProperty(
        '--comparison-popup-top',
        `${top - track.getBoundingClientRect().top}px`,
      );
    }
    const positionOpenDisclosures = () => {
      details.forEach((detail) => {
        if (detail.open) positionDisclosure(detail);
      });
    };
    window.addEventListener('scroll', positionOpenDisclosures, { passive: true });
    window.addEventListener('resize', positionOpenDisclosures);
    details.forEach((detail) => {
      const close = detail.querySelector<HTMLButtonElement>('[data-close-source]')!;
      close.hidden = false;
      close.addEventListener('click', () => {
        detail.open = false;
        detail.querySelector('summary')?.focus();
      });
      detail.addEventListener('toggle', () => {
        if (detail.open)
          details.forEach((other) => {
            if (other !== detail) other.open = false;
          });
        positionDisclosure(detail);
      });
      detail.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          detail.open = false;
          detail.querySelector('summary')?.focus();
        }
      });
    });
    document.addEventListener('click', (event) => {
      if (event.target instanceof Node)
        details.forEach((detail) => {
          if (!detail.contains(event.target as Node)) detail.open = false;
        });
    });

    function syncViewport() {
      cancelAnimationFrame(viewportFrame);
      viewportFrame = 0;
      if (!enabled || reduced.matches || document.hidden) return;
      const viewport = {
        top: window.scrollY + Math.min(80, window.innerHeight * 0.25),
        bottom: window.scrollY + window.innerHeight * 0.95,
      };
      const sweptTop = Math.min(previousViewport?.top ?? viewport.top, viewport.top);
      const sweptBottom = Math.max(previousViewport?.bottom ?? viewport.bottom, viewport.bottom);
      for (const item of rows) {
        // On narrow screens the description sits above the prices; start when the price area enters view.
        const bounds = item.track.getBoundingClientRect();
        const top = bounds.top + window.scrollY;
        const bottom = bounds.bottom + window.scrollY;
        item.visible = bottom > viewport.top && top < viewport.bottom;
        // A triggered row keeps its own hold and animation timeline, even after scrolling offscreen.
        // Only resolve untriggered rows skipped entirely by a scroll jump.
        const crossed = previousViewport
          ? bottom >= sweptTop && top <= sweptBottom
          : bottom <= viewport.top;
        if (!item.visible && !item.played && !item.running && crossed) item.finish();
      }
      previousViewport = viewport;
      startVisibleRows();
    }
    function scheduleViewportSync() {
      if (!viewportFrame) viewportFrame = requestAnimationFrame(syncViewport);
    }
    // IO also wakes reconciliation after layout changes; its cached entries never set state.
    const observer = new IntersectionObserver(scheduleViewportSync, { threshold: 0 });
    rows.forEach((item) => observer.observe(item.track));
    window.addEventListener('scroll', scheduleViewportSync, { passive: true });
    window.addEventListener('resize', scheduleViewportSync);

    const showStatic = () => {
      enabled = false;
      rows.forEach((item) => item.finish());
      stop.hidden = true;
      replay.hidden = reduced.matches;
      status.textContent =
        'All agency estimates and FM prices are shown. Each service has a separate agreement.';
    };
    stop.addEventListener('click', () => {
      showStatic();
      replay.focus();
    });
    replay.addEventListener('click', () => {
      enabled = !reduced.matches;
      rows.forEach((item) => item.reset());
      previousViewport = undefined;
      stop.hidden = false;
      replay.hidden = true;
      stop.focus();
      status.textContent =
        'Each visible row plays once, independently. No click needed. All prices in USD.';
      syncViewport();
    });
    const syncMotion = () => {
      const focusedMotionControl = controls.contains(document.activeElement);
      enabled = !reduced.matches;
      rows.forEach((item) => item.reset());
      previousViewport = undefined;
      controls.hidden = reduced.matches;
      stop.hidden = false;
      replay.hidden = true;
      status.textContent = reduced.matches
        ? 'Reduced motion: all agency estimates and FM prices are shown without animation.'
        : 'Each visible row plays once, independently. No click needed. All prices in USD.';
      if (reduced.matches && focusedMotionControl) {
        const heading = section.querySelector<HTMLElement>('#comparison-title');
        heading?.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
      }
      syncViewport();
    };
    reduced.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        for (const item of rows) if (item.running) item.finish();
      } else syncViewport();
    });
    syncMotion();
    void document.fonts.ready.then(() => {
      ready = true;
      syncViewport();
    });
  });
}
