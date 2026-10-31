import { animate, stagger } from 'motion';

const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isLeaving = false;
const pageTargets = (root: Document = document) =>
  ['.site-header', '#main-content', '.site-footer']
    .map((selector) => root.querySelector<HTMLElement>(selector))
    .filter((element): element is HTMLElement => Boolean(element));
const rowTargets = (root: Document = document) =>
  Array.from(root.querySelectorAll<HTMLElement>('.project-row, .writing-list article, .contact-list a, .setup-app-grid a, .setup-tool-grid a'));

const reset = (elements: HTMLElement[]) => {
  for (const element of elements) {
    element.style.opacity = '';
    element.style.transform = '';
  }
};

const prepare = (root: Document) => {
  for (const element of pageTargets(root)) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(12px)';
  }
  for (const element of rowTargets(root)) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(7px)';
  }
};

const enterPage = async () => {
  const page = pageTargets();
  const rows = rowTargets();
  if (!motionAllowed()) {
    document.documentElement.classList.remove('motion-pending');
    reset([...page, ...rows]);
    return;
  }

  prepare(document);
  document.documentElement.classList.remove('motion-pending');

  const entrance = animate(
    page,
    { opacity: [0, 1], y: [12, 0] },
    { duration: 0.46, delay: stagger(0.05), ease: [0.22, 1, 0.36, 1] },
  );
  const rowEntrance = rows.length
    ? animate(
        rows,
        { opacity: [0, 1], y: [7, 0] },
        { duration: 0.34, delay: stagger(0.04, { startDelay: 0.18 }), ease: [0.22, 1, 0.36, 1] },
      )
    : null;

  try {
    await Promise.all([entrance.finished, rowEntrance?.finished]);
  } catch {
    // A new navigation may interrupt the current entrance.
  } finally {
    if (!isLeaving) reset([...page, ...rows]);
  }
};

const exitPage = async () => {
  if (!motionAllowed()) return;
  const page = pageTargets();
  if (!page.length) return;
  const exit = animate(
    page,
    { opacity: 0, y: -8 },
    { duration: 0.21, delay: stagger(0.025, { from: 'last' }), ease: [0.4, 0, 1, 1] },
  );
  await exit.finished.catch(() => {});
};

let blinkAnimation: { stop: () => void } | undefined;
const setupMascot = () => {
  blinkAnimation?.stop();
  blinkAnimation = undefined;
  if (!motionAllowed()) return;

  const mascot = document.querySelector<HTMLElement>('.margin-mascot');
  const illustration = mascot?.querySelector<SVGElement>('svg');
  const eyes = mascot?.querySelector<SVGGElement>('.mascot-eyes');
  if (!mascot || !illustration || !eyes) return;

  blinkAnimation = animate(
    eyes,
    { scaleY: [1, 0.08, 1] },
    { duration: 0.18, delay: 3.4, repeat: Infinity, repeatDelay: 4.8, ease: 'easeInOut' },
  );
  mascot.addEventListener('pointerenter', () => {
    animate(illustration, { rotate: -7, y: -3 }, { type: 'spring', stiffness: 280, damping: 17 });
  });
  mascot.addEventListener('pointerleave', () => {
    animate(illustration, { rotate: 0, y: 0 }, { type: 'spring', stiffness: 260, damping: 18 });
  });
};

document.addEventListener('astro:before-preparation', (event) => {
  isLeaving = true;
  const preparation = event as Event & { loader: () => Promise<void> };
  const originalLoader = preparation.loader;
  preparation.loader = async () => {
    try {
      await originalLoader();
      await exitPage();
    } catch (error) {
      isLeaving = false;
      reset(pageTargets());
      throw error;
    }
  };
});

document.addEventListener('astro:before-swap', (event) => {
  blinkAnimation?.stop();
  const swap = event as Event & { newDocument: Document };
  if (motionAllowed()) prepare(swap.newDocument);
});

document.addEventListener('astro:after-swap', () => {
  isLeaving = false;
  void enterPage();
  setupMascot();
});

const start = () => {
  void enterPage();
  setupMascot();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
