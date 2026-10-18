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
  visible: boolean;
  played: boolean;
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
    const HOLD = 0,
      BURST = 120,
      SWIRL = 750,
      FORM = 425,
      SETTLE = 112.5;
    let active: RowPlayer | undefined;
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
    const pump = () => {
      if (!ready || !enabled || reduced.matches || document.hidden || active) return;
      const next = rows.find((item) => item.visible && !item.played);
      if (next) {
        active = next;
        next.start();
      }
    };
    const rows: RowPlayer[] = Array.from(
      section.querySelectorAll<HTMLElement>('[data-comparison-row]'),
    ).map((row) => {
      const track = row.querySelector<HTMLElement>('[data-price-track]')!;
      const source = row.querySelector<HTMLElement>('[data-source-number]')!;
      const target = row.querySelector<HTMLElement>('[data-target-number]')!;
      const canvas = row.querySelector<HTMLCanvasElement>('[data-price-canvas]')!;
      const context = canvas.getContext('2d');
      let frame = 0;
      let running = false;
      const player: RowPlayer = { row, visible: false, played: false, start, finish, reset };
      function finish(completed = true) {
        cancelAnimationFrame(frame);
        running = false;
        context?.clearRect(0, 0, canvas.width, canvas.height);
        row.classList.remove('is-running');
        row.classList.toggle('is-complete', completed);
        row.classList.toggle('has-shadow', completed);
        player.played = completed;
        row.dataset.state = completed ? 'complete' : 'waiting';
        if (active === player) active = undefined;
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
        if (!context || running || !enabled || reduced.matches) {
          if (active === player) active = undefined;
          return;
        }
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
        running = true;
        const began = performance.now();
        const draw = (now: number) => {
          const elapsed = now - began;
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
        if (running) finish();
      }).observe(track);
      return player;
    });

    // Source disclosures remain native details/summary controls without JavaScript.
    const details = Array.from(section.querySelectorAll<HTMLDetailsElement>('[data-source-info]'));
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
        const bounds = item.row.getBoundingClientRect();
        const top = bounds.top + window.scrollY;
        const bottom = bounds.bottom + window.scrollY;
        item.visible = bottom > viewport.top && top < viewport.bottom;
        // A single scroll jump can skip IntersectionObserver's visible states entirely.
        // Resolve every crossed offscreen row so returning never reveals an untouched price.
        const crossed = previousViewport
          ? bottom >= sweptTop && top <= sweptBottom
          : bottom <= viewport.top;
        if (!item.visible && !item.played && (crossed || active === item)) item.finish();
      }
      previousViewport = viewport;
      pump();
    }
    function scheduleViewportSync() {
      if (!viewportFrame) viewportFrame = requestAnimationFrame(syncViewport);
    }
    // IO also wakes reconciliation after layout changes; its cached entries never set state.
    const observer = new IntersectionObserver(scheduleViewportSync, { threshold: 0 });
    rows.forEach((item) => observer.observe(item.row));
    window.addEventListener('scroll', scheduleViewportSync, { passive: true });
    window.addEventListener('resize', scheduleViewportSync);

    const showStatic = () => {
      enabled = false;
      rows.forEach((item) => item.finish());
      stop.hidden = true;
      replay.hidden = reduced.matches;
      status.textContent =
        'All agency examples and FM prices are shown. Each service has a separate agreement.';
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
        'Each visible row plays once, in order. No click needed. All prices in USD.';
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
        ? 'Reduced motion: all agency examples and FM prices are shown without animation.'
        : 'Each visible row plays once, in order. No click needed. All prices in USD.';
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
        if (active) active.finish();
      } else syncViewport();
    });
    syncMotion();
    void document.fonts.ready.then(() => {
      ready = true;
      syncViewport();
    });
  });
}
