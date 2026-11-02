const sceneSelector = '[data-packet-scene]';

const hash = (x: number, y: number, seed = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
};

const color = (from: [number, number, number], to: [number, number, number], amount: number) => {
  const t = Math.max(0, Math.min(1, amount));
  return `rgb(${Math.round(from[0] + (to[0] - from[0]) * t)}, ${Math.round(from[1] + (to[1] - from[1]) * t)}, ${Math.round(from[2] + (to[2] - from[2]) * t)})`;
};

function mountScene(scene: HTMLElement) {
  const canvas = scene.querySelector('canvas');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return () => {};

  const backing = document.createElement('canvas');
  const backdrop = backing.getContext('2d');
  const trainSprite = document.createElement('canvas');
  const trainInk = trainSprite.getContext('2d');
  if (!backdrop || !trainInk) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let cellWidth = 5;
  let cellHeight = 7;
  let trainWidth = 0;
  let trainHeight = 0;
  let frame = 0;
  let lastFrame = 0;
  let inView = false;
  let disposed = false;

  const drawBackdrop = () => {
    const gradient = backdrop.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#080809');
    gradient.addColorStop(0.2, '#111932');
    gradient.addColorStop(0.48, '#512b4d');
    gradient.addColorStop(0.75, '#173a42');
    gradient.addColorStop(0.88, '#0a2831');
    gradient.addColorStop(1, '#080809');
    backdrop.fillStyle = gradient;
    backdrop.fillRect(0, 0, width, height);

    backdrop.font = `${Math.max(6, cellWidth * 1.2)}px "JetBrains Mono Variable", monospace`;
    backdrop.textBaseline = 'middle';

    const columns = Math.ceil(width / cellWidth);
    const rows = Math.ceil(height / cellHeight);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = column * cellWidth;
        const y = row * cellHeight;
        const nx = x / width;
        const ny = y / height;
        const grain = hash(column, row);
        const variation = hash(column, row, 3);
        let mark = grain > 0.84 ? ':' : '.';
        let tint = '#34406a';
        let alpha = 0.65 + variation * 0.32;

        const fujiRidge = 0.23 + Math.abs(nx - 0.72) * 0.91;
        const farRidge = 0.47 + Math.sin(nx * 12) * 0.045 + Math.sin(nx * 29) * 0.018;
        const nearRidge = 0.60 + Math.sin(nx * 13 + 1.2) * 0.045 + Math.sin(nx * 37) * 0.019;
        const fuji = nx > 0.39 && nx < 1.04 && ny > fujiRidge && ny < 0.73;
        const farMountain = ny > farRidge && ny < 0.75;
        const foreground = ny > nearRidge && ny < 0.82;

        if (ny > 0.79) {
          mark = grain > 0.77 ? '=' : grain > 0.43 ? '~' : '-';
          const shimmer = Math.sin(nx * 31 + ny * 14) * 0.5 + 0.5;
          const reflection = Math.max(
            Math.exp(-Math.pow((nx - 0.08) / 0.035, 2)),
            Math.exp(-Math.pow((nx - 0.92) / 0.035, 2)),
          );
          tint = reflection > 0.28
            ? color([63, 151, 151], [239, 170, 116], reflection * 0.82)
            : color([46, 124, 139], [119, 207, 187], shimmer * 0.8 + variation * 0.2);
          alpha = 0.7 + variation * 0.28;
        } else if (foreground) {
          mark = grain > 0.72 ? '*' : grain > 0.35 ? '+' : ':';
          tint = color([33, 116, 110], [111, 185, 137], variation);
          alpha = 0.8 + variation * 0.18;
        } else if (fuji) {
          mark = grain > 0.82 ? '*' : grain > 0.42 ? ':' : '.';
          const snow = ny < 0.38 && Math.abs(nx - 0.72) < (ny - 0.22) * 1.25;
          tint = snow
            ? color([178, 210, 224], [245, 235, 219], variation)
            : color([90, 114, 161], [154, 157, 203], variation);
          alpha = snow ? 1 : 0.94;
        } else if (farMountain) {
          mark = grain > 0.72 ? '+' : grain > 0.38 ? ':' : '.';
          tint = color([63, 84, 134], [118, 131, 167], variation);
          alpha = 0.84;
        } else {
          const horizonGlow = Math.exp(-Math.pow((nx - 0.62) / 0.34, 2)) * Math.exp(-Math.pow((ny - 0.47) / 0.22, 2));
          tint = color([86, 112, 177], [245, 139, 125], horizonGlow * 0.9 + variation * 0.1);
          if (grain > 0.994 && ny < 0.5) {
            mark = '*';
            tint = '#e6dfd5';
            alpha = 0.94;
          } else {
            alpha = 0.45 + variation * 0.42;
          }
        }

        if (grain < 0.08 && ny < 0.79) continue;
        backdrop.globalAlpha = alpha;
        backdrop.fillStyle = tint;
        backdrop.fillText(mark, x, y);
      }
    }
    backdrop.globalAlpha = 1;

    // A warm moon and a faint ridge give the stippled sky a clear focal shape.
    const moonX = width * 0.23;
    const moonY = height * 0.24;
    const moonRadius = Math.min(width, height) * 0.065;
    for (let y = -moonRadius; y <= moonRadius; y += cellHeight) {
      for (let x = -moonRadius; x <= moonRadius; x += cellWidth) {
        const distance = Math.hypot(x, y) / moonRadius;
        if (distance > 1) continue;
        backdrop.fillStyle = distance < 0.67 ? '#f6d6a8' : '#d99888';
        backdrop.fillText(hash(x, y, 9) > 0.65 ? '*' : ':', moonX + x, moonY + y);
      }
    }
    backdrop.globalAlpha = 0.62;
    backdrop.fillStyle = '#c0bfd5';
    for (let x = width * 0.44; x < width; x += cellWidth * 2) {
      const nx = x / width;
      const ridge = (0.23 + Math.abs(nx - 0.72) * 0.91) * height;
      backdrop.fillText(nx < 0.72 ? '/' : '\\', x, ridge);
    }
    backdrop.globalAlpha = 1;

    // A few cedar silhouettes frame the rail without covering the mountain.
    const trees = [
      { x: 0.07, y: 0.59, size: 0.14 },
      { x: 0.16, y: 0.62, size: 0.11 },
      { x: 0.95, y: 0.59, size: 0.15 },
    ];
    for (const tree of trees) {
      const centerX = tree.x * width;
      const baseY = tree.y * height;
      const radius = tree.size * height;
      for (let iy = 0; iy < 8; iy++) {
        const fy = baseY - radius + (iy / 7) * radius;
        const halfWidth = (iy / 7) * radius * 0.9;
        for (let fx = -halfWidth; fx <= halfWidth; fx += cellWidth) {
          const noise = hash(Math.round(fx), iy, Math.round(centerX));
          if (noise < 0.12) continue;
          backdrop.fillStyle = noise > 0.78 ? '#aed7ad' : noise > 0.42 ? '#5db49c' : '#2f8e8a';
          backdrop.fillText(noise > 0.7 ? '*' : '+', centerX + fx, fy);
        }
      }
      backdrop.fillStyle = '#607776';
      for (let iy = 0; iy < 4; iy++) backdrop.fillText('|', centerX, baseY + iy * cellHeight);
    }

    const stationRows = [
      '     /\\________/\\',
      '  __/____________\\__',
      '  |  []  []  []  |',
      '  |__|________|__|',
    ];
    backdrop.save();
    const stationFont = Math.max(7, cellWidth * 1.45);
    backdrop.font = `${stationFont}px "JetBrains Mono Variable", monospace`;
    const stationCell = backdrop.measureText('M').width;
    const stationX = width * 0.26;
    const stationY = height * 0.57;
    stationRows.forEach((line, row) => {
      for (let column = 0; column < line.length; column++) {
        const character = line[column];
        if (character === ' ') continue;
        backdrop.fillStyle = row < 2 ? '#e7a07f' : character === '[' || character === ']' ? '#ffd089' : '#d2b7a2';
        backdrop.fillText(character, stationX + column * stationCell, stationY + row * stationFont * 1.15);
      }
    });
    backdrop.restore();

    const railY = height * 0.72;
    for (let x = 0; x < width; x += cellWidth) {
      const index = Math.round(x / cellWidth);
      backdrop.fillStyle = index % 7 === 0 ? '#dabd9c' : '#9a9ba5';
      backdrop.fillText('=', x, railY);
      backdrop.fillStyle = '#626c7c';
      backdrop.fillText(index % 5 === 0 ? '|' : '-', x, railY + cellHeight);
    }
    for (const fraction of [0.13, 0.37, 0.63, 0.87]) {
      const supportX = fraction * width;
      for (let y = railY + cellHeight * 2; y < height * 0.85; y += cellHeight) {
        backdrop.fillStyle = '#596b7a';
        backdrop.fillText('|', supportX, y);
        backdrop.fillText('|', supportX + cellWidth * 2, y);
      }
    }

    // The signal lamps make each end of the route legible in the scenery.
    for (const fraction of [0.08, 0.92]) {
      const lampX = fraction * width;
      const lampY = railY - cellHeight * 6;
      backdrop.fillStyle = '#bdada3';
      for (let y = lampY + cellHeight; y < railY; y += cellHeight) backdrop.fillText('|', lampX, y);
      backdrop.fillStyle = '#e6aa75';
      backdrop.fillText('*', lampX - cellWidth, lampY);
      backdrop.fillText('*', lampX, lampY);
      backdrop.fillText('*', lampX + cellWidth, lampY);
    }
  };

  const paintTrain = (density: number) => {
    const glyphWidth = width < 420 ? 4.2 : 5.2;
    const glyphHeight = width < 420 ? 5.1 : 6.1;
    const columns = Math.max(38, Math.floor(Math.min(width * 0.69, 440) / glyphWidth));
    trainWidth = columns * glyphWidth;
    trainHeight = 13 * glyphHeight;
    trainSprite.width = Math.ceil(trainWidth * density);
    trainSprite.height = Math.ceil(trainHeight * density);
    trainInk.setTransform(density, 0, 0, density, 0, 0);
    trainInk.clearRect(0, 0, trainWidth, trainHeight);
    trainInk.font = `${width < 420 ? 7.3 : 8.5}px "JetBrains Mono Variable", monospace`;
    trainInk.textBaseline = 'middle';

    for (let column = 0; column < columns; column++) {
      const u = column / (columns - 1);
      const nose = Math.max(0, (u - 0.68) / 0.32);
      const tip = Math.max(0, (u - 0.87) / 0.13);
      const roof = 0.12 + Math.pow(nose, 1.55) * 0.45;
      const floor = 0.85 - Math.pow(tip, 1.5) * 0.24;

      for (let row = 0; row < 10; row++) {
        const v = row / 10;
        if (v < roof || v > floor) continue;
        const grain = hash(column, row, 21);
        const topEdge = v - roof < 0.09;
        const bottomEdge = floor - v < 0.1;
        const windowBand = u > 0.095 && u < 0.69 && v > 0.31 && v < 0.53;
        const windowCell = (u * 92) % 8 < 6;
        const stripe = v > 0.57 && v < 0.72 && u > 0.05 && u < 0.97;
        let glyph = grain > 0.78 ? '#' : grain > 0.37 ? '@' : '%';
        let tint = color([104, 143, 158], [239, 240, 231], 1 - v * 0.61 + grain * 0.08);

        if (topEdge) {
          glyph = u > 0.69 ? '·' : '_';
          tint = '#f5efe5';
        } else if (bottomEdge) {
          glyph = u > 0.85 ? '-' : '=';
          tint = '#758c96';
        } else if (windowBand && windowCell) {
          glyph = grain > 0.7 ? '▓' : '█';
          tint = grain > 0.78 ? '#6fa9b4' : '#284c60';
        } else if (windowBand) {
          glyph = '|';
          tint = '#f2e5d8';
        } else if (stripe) {
          glyph = grain > 0.8 ? '+' : '=';
          tint = u > 0.83 ? '#ec8e7c' : '#bd6969';
        } else if (v > 0.72) {
          glyph = grain > 0.62 ? ':' : '=';
          tint = '#8fa8ad';
        }

        if (u > 0.95 && v > 0.48 && v < 0.65) {
          glyph = '*';
          tint = '#ffd394';
          trainInk.shadowColor = '#f0a26d';
          trainInk.shadowBlur = 8;
        }
        trainInk.fillStyle = tint;
        trainInk.fillText(glyph, column * glyphWidth, row * glyphHeight + glyphHeight);
        trainInk.shadowBlur = 0;
      }
    }

    // Packet labels sit inside the glazing, while the bogies stay dark and fine.
    trainInk.fillStyle = '#ffad8a';
    for (const [label, fraction] of [['01', 0.21], ['10', 0.39], ['01', 0.57]] as const) {
      trainInk.fillText(label, fraction * trainWidth, glyphHeight * 4.85);
    }
    for (const fraction of [0.17, 0.42, 0.67]) {
      const bogieX = fraction * trainWidth;
      trainInk.fillStyle = '#536b77';
      trainInk.fillText('╞════╡', bogieX - glyphWidth * 3, glyphHeight * 10.6);
      trainInk.fillStyle = '#a5b9b9';
      trainInk.fillText('◉    ◉', bogieX - glyphWidth * 3, glyphHeight * 11.6);
    }
  };

  const drawTrain = (time: number) => {
    const phase = ((time / 11000 + 0.4) % 1 + 1) % 1;
    const approach = Math.min(1, phase / 0.2);
    const departure = Math.max(0, (phase - 0.8) / 0.2);
    const travel = (phase - 0.2) / 0.6;
    const x = reducedMotion.matches
      ? (width - trainWidth) / 2
      : phase < 0.2
        ? -trainWidth * Math.pow(1 - approach, 2)
        : phase < 0.8
          ? Math.max(0, width - trainWidth) * travel
          : Math.max(0, width - trainWidth) + trainWidth * departure * departure;
    context.drawImage(trainSprite, x, height * 0.72 - trainHeight + 3, trainWidth, trainHeight);
  };

  const render = (time: number) => {
    context.clearRect(0, 0, width, height);
    context.drawImage(backing, 0, 0, width, height);
    drawTrain(time);
    if (!reducedMotion.matches) {
      context.font = `${Math.max(6, cellWidth * 1.2)}px "JetBrains Mono Variable", monospace`;
      context.textBaseline = 'middle';
      for (let index = 0; index < 15; index++) {
        const x = hash(index, 4) * width;
        const y = (0.08 + hash(index, 9) * 0.42) * height;
        context.globalAlpha = 0.25 + (Math.sin(time / 850 + index * 2) + 1) * 0.24;
        context.fillStyle = index % 3 === 0 ? '#f4dfc8' : '#b5c7de';
        context.fillText(index % 4 === 0 ? '*' : '.', x, y);
      }
      context.globalAlpha = 1;
    }
    scene.dataset.ready = '';
  };

  const resize = () => {
    width = Math.max(1, Math.round(scene.clientWidth));
    height = Math.max(1, Math.round(scene.clientHeight));
    const density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    backing.width = canvas.width;
    backing.height = canvas.height;
    context.setTransform(density, 0, 0, density, 0, 0);
    backdrop.setTransform(density, 0, 0, density, 0, 0);
    cellWidth = width < 420 ? 4.8 : 5.4;
    cellHeight = cellWidth * 1.37;
    drawBackdrop();
    paintTrain(density);
    render(performance.now());
  };

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const tick = (time: number) => {
    if (disposed || !inView || reducedMotion.matches || document.hidden) {
      frame = 0;
      return;
    }
    if (time - lastFrame >= 50) {
      render(time);
      lastFrame = time;
    }
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!frame && inView && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const onMotionChange = () => {
    stop();
    render(performance.now());
    start();
  };
  const onVisibilityChange = () => document.hidden ? stop() : start();

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start();
    else stop();
  }, { rootMargin: '100px' });
  resizeObserver.observe(scene);
  intersectionObserver.observe(scene);
  reducedMotion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();

  return () => {
    disposed = true;
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    reducedMotion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

let unmount: (() => void) | undefined;
const mount = () => {
  unmount?.();
  const scene = document.querySelector<HTMLElement>(sceneSelector);
  unmount = scene ? mountScene(scene) : undefined;
};

document.addEventListener('astro:page-load', mount);
document.addEventListener('astro:before-swap', () => {
  unmount?.();
  unmount = undefined;
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
