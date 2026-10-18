type Point = { x: number; y: number };
type Grain = { from: Point; to: Point; loose: Point; near: Point; delay: number; tint: number };

/** Sample the actual rendered price glyphs, then carry those pixels to the $400 glyphs. */
export function initPriceComparisons() {
  document.querySelectorAll<HTMLElement>('[data-price-comparison]').forEach((section) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const controls = section.querySelector<HTMLElement>('[data-comparison-controls]')!;
    const playAll = section.querySelector<HTMLButtonElement>('[data-play-comparisons]')!;
    const stopAll = section.querySelector<HTMLButtonElement>('[data-stop-comparisons]')!;
    const status = section.querySelector<HTMLElement>('[data-comparison-status]')!;
    let armed = false;
    let seed = 19;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const ease = (t: number) => t * t * (3 - 2 * t);
    const between = (a: Point, b: Point, t: number): Point => ({
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
    const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-comparison-row]')).map(
      (row) => {
        const track = row.querySelector<HTMLElement>('[data-price-track]')!;
        const source = row.querySelector<HTMLElement>('[data-source-number]')!;
        const target = row.querySelector<HTMLElement>('[data-target-number]')!;
        const canvas = row.querySelector<HTMLCanvasElement>('[data-price-canvas]')!;
        const context = canvas.getContext('2d');
        const rowControls = row.querySelector<HTMLElement>('[data-row-controls]')!;
        const play = row.querySelector<HTMLButtonElement>('[data-play-row]')!;
        const skip = row.querySelector<HTMLButtonElement>('[data-skip-row]')!;
        let frame = 0;
        let running = false;
        let pending = false;
        let played = false;
        let generation = 0;
        const finish = (completed = true) => {
          generation++;
          pending = false;
          cancelAnimationFrame(frame);
          running = false;
          context?.clearRect(0, 0, canvas.width, canvas.height);
          row.classList.remove('is-running');
          if (completed) {
            played = true;
            row.classList.add('has-played');
          }
          row.dataset.state = completed ? 'complete' : 'static';
          play.setAttribute('aria-disabled', 'false');
          play.innerHTML = completed
            ? 'Replay this price <span aria-hidden="true">↻</span>'
            : 'Watch this price <span aria-hidden="true">→</span>';
          const focusSkip = document.activeElement === skip;
          skip.hidden = true;
          if (focusSkip && !reduced.matches) play.focus();
        };
        const sample = (element: HTMLElement, width: number, height: number, step: number) => {
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
          maskContext.fillStyle = '#000';
          const text = element.textContent || '';
          const metrics = maskContext.measureText(text);
          const centerX = bounds.left - area.left + bounds.width / 2;
          const centerY = bounds.top - area.top + bounds.height / 2;
          maskContext.fillText(
            text,
            centerX,
            centerY + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2,
          );
          const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
          const points: Point[] = [];
          for (let y = 0; y < mask.height; y += step) {
            for (let x = 0; x < mask.width; x += step) {
              if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] > 100)
                points.push({ x, y });
            }
          }
          return points;
        };
        const start = async () => {
          if (reduced.matches || !context || running || pending) return;
          pending = true;
          const current = ++generation;
          await document.fonts.ready;
          if (current !== generation || reduced.matches) return;
          pending = false;
          const { width, height } = track.getBoundingClientRect();
          if (!width || !height) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          const step = width < 500 ? 1.8 : 2.2;
          const from = shuffle(sample(source, width, height, step));
          const to = shuffle(sample(target, width, height, step));
          if (!from.length || !to.length) {
            finish();
            return;
          }
          const count = Math.min(1400, Math.max(from.length, to.length));
          const grains: Grain[] = Array.from({ length: count }, (_, i) => {
            const origin = from[Math.floor((i * from.length) / count)];
            const destination = to[Math.floor((i * to.length) / count)];
            return {
              from: origin,
              to: destination,
              loose: {
                x: Math.max(8, Math.min(width - 8, origin.x + (random() - 0.2) * width * 0.24)),
                y: Math.max(45, Math.min(height - 34, origin.y + (random() - 0.5) * 100)),
              },
              near: {
                x: Math.max(
                  width * 0.42,
                  Math.min(width - 10, destination.x + (random() - 0.6) * width * 0.36),
                ),
                y: Math.max(45, Math.min(height - 34, destination.y + (random() - 0.5) * 100)),
              },
              delay: 180 + (origin.x / width) * 460 + random() * 380,
              tint: Math.floor(random() * 3),
            };
          });
          row.dataset.particleCount = String(count);
          row.dataset.sourceSamples = String(from.length);
          row.dataset.targetSamples = String(to.length);
          row.dataset.state = 'dissolving';
          row.classList.add('is-running', 'has-played');
          play.setAttribute('aria-disabled', 'true');
          skip.hidden = false;
          running = true;
          played = true;
          const began = performance.now();
          const draw = (now: number) => {
            const elapsed = now - began;
            context.clearRect(0, 0, width, height);
            row.dataset.state =
              elapsed < 1400 ? 'dissolving' : elapsed < 2700 ? 'travelling' : 'reforming';
            for (const grain of grains) {
              const t = Math.max(0, Math.min(1, (elapsed - grain.delay) / 3400));
              let point: Point;
              if (t < 0.26) point = between(grain.from, grain.loose, ease(t / 0.26));
              else if (t < 0.66) point = between(grain.loose, grain.near, ease((t - 0.26) / 0.4));
              else point = between(grain.near, grain.to, ease((t - 0.66) / 0.34));
              const inFlight = t > 0.08 && t < 0.78;
              context.fillStyle = inFlight
                ? ['#06529f', '#e58b20', '#df6344'][grain.tint]
                : '#06529f';
              context.beginPath();
              context.arc(point.x, point.y, step * (inFlight ? 0.55 : 0.61), 0, Math.PI * 2);
              context.fill();
            }
            if (elapsed < 4450) frame = requestAnimationFrame(draw);
            else finish();
          };
          frame = requestAnimationFrame(draw);
        };
        play.addEventListener('click', () => {
          void start();
        });
        skip.addEventListener('click', () => {
          finish();
          play.focus();
        });
        new ResizeObserver(() => {
          if (running || pending) finish();
        }).observe(track);
        return {
          row,
          start,
          finish,
          get played() {
            return played;
          },
          rearm() {
            played = false;
          },
          sync() {
            finish(false);
            rowControls.hidden = reduced.matches || !context;
          },
        };
      },
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (!armed || reduced.matches) return;
        for (const entry of entries) {
          const item = rows.find((candidate) => candidate.row === entry.target);
          if (entry.isIntersecting && item && !item.played) void item.start();
        }
      },
      { threshold: 0.25 },
    );
    rows.forEach(({ row }) => observer.observe(row));
    playAll.addEventListener('click', () => {
      if (reduced.matches) return;
      armed = true;
      stopAll.hidden = false;
      playAll.textContent = 'Replay visible comparisons';
      status.textContent =
        'Prices animate once as you scroll. You can stop at any time or replay an individual price.';
      rows.forEach((item) => {
        item.rearm();
        const box = item.row.getBoundingClientRect();
        if (box.bottom > 0 && box.top < innerHeight) void item.start();
      });
    });
    stopAll.addEventListener('click', () => {
      armed = false;
      rows.forEach((item) => item.finish());
      stopAll.hidden = true;
      status.textContent =
        'All prices shown. Agency reference prices remain visible alongside FM fees.';
      playAll.focus();
    });
    const syncMotion = () => {
      const focusedControl =
        reduced.matches &&
        section.contains(document.activeElement) &&
        document.activeElement instanceof HTMLButtonElement;
      armed = false;
      rows.forEach((item) => item.sync());
      controls.hidden = reduced.matches;
      stopAll.hidden = true;
      playAll.textContent = 'Play comparisons as I scroll';
      status.textContent = reduced.matches
        ? 'Reduced motion: all agency examples and FM prices are shown without animation.'
        : 'Seven monthly services. Four one-time projects. Each contracted separately.';
      if (focusedControl) {
        const heading = section.querySelector<HTMLElement>('#comparison-title');
        heading?.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
      }
    };
    reduced.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        armed = false;
        rows.forEach((item) => item.finish());
        stopAll.hidden = true;
        playAll.textContent = 'Play comparisons as I scroll';
        status.textContent = reduced.matches
          ? 'Reduced motion: all agency examples and FM prices are shown without animation.'
          : 'All prices shown. Press play to animate comparisons as you scroll again.';
      }
    });
    syncMotion();
  });
}
