/**
 * Interactive Dark-Mode Pixel Grid Canvas
 * Generates an ethereal digital pixel trail on cursor movement.
 * - Sharp pixel blocks on dark #121212 canvas
 * - Mix of UNLIMITEDWF brand blue (#1162dd) and translucent slate/white blocks
 * - Adjacent cluster spawning matching the reference aesthetic
 * - Smooth frame-rate independent exponential alpha decay
 * - Zero idle CPU/GPU consumption (RAF sleeps when inactive)
 * - Sharp Retina / High-DPI display rendering
 */

export function initPixelGrid() {
  const canvas = document.getElementById('pixelGridCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  const cellSize = 38; // Clean, modern pixel dimension

  // Active cells map: key -> { col, row, alpha, style, decay }
  const activeCells = new Map();

  let isRunning = false;
  let lastTime = performance.now();
  let lastCol = -999;
  let lastRow = -999;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    wake();
  }

  // Palettes tailored for deep dark background and hero overlay
  function getRandomStyle() {
    const r = Math.random();
    if (r < 0.45) {
      // Official UNLIMITEDWF Brand Blue (#1162DD)
      return {
        isBlue: true,
        fill: (a) => `rgba(17, 98, 221, ${a * 0.22})`,
        border: (a) => `rgba(17, 98, 221, ${a * 0.52})`
      };
    } else if (r < 0.65) {
      // Soft Ice Blue Accent
      return {
        isBlue: true,
        fill: (a) => `rgba(50, 130, 240, ${a * 0.18})`,
        border: (a) => `rgba(70, 150, 255, ${a * 0.42})`
      };
    } else {
      // Delicate Pure White / Slate Accent
      return {
        isBlue: false,
        fill: (a) => `rgba(255, 255, 255, ${a * 0.08})`,
        border: (a) => `rgba(255, 255, 255, ${a * 0.22})`
      };
    }
  }

  function activateCell(col, row, baseAlpha = 0.85) {
    if (col < 0 || row < 0 || col * cellSize >= width || row * cellSize >= height) return;
    const key = `${col}_${row}`;
    const existing = activeCells.get(key);

    if (existing) {
      existing.alpha = Math.min(0.85, existing.alpha + 0.35);
    } else {
      activeCells.set(key, {
        col,
        row,
        alpha: baseAlpha,
        style: getRandomStyle(),
        decay: 0.022 + Math.random() * 0.015
      });
    }
    wake();
  }

  function onPointerMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    if (x < 0 || x > width || y < 0 || y > height) return;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Primary cell under pointer
    activateCell(col, row, 0.85);

    // Subtle cluster spawning (recreating the organic stepping in reference)
    if (col !== lastCol || row !== lastRow) {
      lastCol = col;
      lastRow = row;

      // Horizontal neighbor
      if (Math.random() < 0.5) {
        const offsetCol = col + (Math.random() < 0.5 ? 1 : -1);
        activateCell(offsetCol, row, 0.55);
      }
      // Vertical neighbor
      if (Math.random() < 0.3) {
        const offsetRow = row + (Math.random() < 0.5 ? 1 : -1);
        activateCell(col, offsetRow, 0.45);
      }
      // Occasional 2nd-step neighbor
      if (Math.random() < 0.18) {
        const offsetCol2 = col + (Math.random() < 0.5 ? 2 : -2);
        activateCell(offsetCol2, row, 0.35);
      }
    }
  }

  function render(now) {
    if (!isRunning) return;

    const dt = Math.min(32, now - lastTime);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // Render active illuminated pixel blocks
    for (const [key, cell] of activeCells) {
      const a = cell.alpha;
      const x = cell.col * cellSize;
      const y = cell.row * cellSize;

      ctx.save();
      if (cell.style.isBlue) {
        ctx.shadowColor = `rgba(17, 98, 221, ${a * 0.4})`;
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }

      // Translucent inner fill
      ctx.fillStyle = cell.style.fill(a);
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Subtle 1px digital border
      ctx.strokeStyle = cell.style.border(a);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

      ctx.restore();

      // Exponential smooth decay over time
      cell.alpha -= cell.decay * (dt / 16.6);

      if (cell.alpha <= 0.01) {
        activeCells.delete(key);
      }
    }

    if (activeCells.size > 0) {
      requestAnimationFrame(render);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  function wake() {
    if (!isRunning) {
      isRunning = true;
      lastTime = performance.now();
      requestAnimationFrame(render);
    }
  }

  // Global pointer move listener
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  resize();
}
