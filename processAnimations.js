/**
 * UnlimitedWF — Process & "What You'll Get" Bento Grid Interactive Engine
 * Provides high-fidelity animations for the 5 Bento Grid cards:
 * 1. Cost effective solution — Interactive growth equalizer bars with harmonic micro-pulses
 * 2. Tailor-made design — Dynamic Island with 3D tilt perspective & status beacon
 * 3. Scalable as you grow — Neon ascending trajectory curve canvas with pulsing peak node & hover inspection
 * 4. Workflow integration — Magnetic floating app icons with brand-colored glow
 * 5. Collaborate real-time — Spring-physics collaborator cursor ("Elia") & avatar ring glow
 */

export function initProcessAnimations() {
  const section = document.getElementById('process');
  if (!section) return;

  // Initialize all interactive widgets
  const cleanupCurve = initCurveCanvas();
  const cleanupBars = initGrowthBars();
  const cleanupNotification = initNotificationTilt();
  const cleanupCollab = initCollabCursor();
  const cleanupApps = initAppIcons();

  // Return master cleanup function
  return () => {
    if (cleanupCurve) cleanupCurve();
    if (cleanupBars) cleanupBars();
    if (cleanupNotification) cleanupNotification();
    if (cleanupCollab) cleanupCollab();
    if (cleanupApps) cleanupApps();
  };
}

/* ==========================================================================
   1. CARD 3: SCALABLE AS YOU GROW (Neon Trajectory Curve Canvas)
   ========================================================================== */
function initCurveCanvas() {
  const canvas = document.getElementById('curveCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;
  let isVisible = true;
  let isHovered = false;
  let hoverX = 0;
  let hoverY = 0;
  let currentT = 0.74; // Default resting position at the peak node (approx 74% along curve)
  let targetT = 0.74;

  // Concentric ripple wave state for the glowing peak node
  const ripples = [
    { r: 0, alpha: 0.8 },
    { r: 8, alpha: 0.5 },
    { r: 16, alpha: 0.2 }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 320;
    height = rect.height || 200;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Cubic Bezier curve control points defining the trajectory from reference image
  // The curve starts from left, dips slightly, then swoops sharply up to the peak node,
  // and finally extends faintly into the top-right corner.
  function getCurvePoints() {
    const p0 = { x: width * 0.12, y: height * 0.74 };
    const cp1 = { x: width * 0.35, y: height * 0.82 };
    const cp2 = { x: width * 0.55, y: height * 0.65 };
    const peak = { x: width * 0.74, y: height * 0.32 };
    const trailEnd = { x: width * 0.92, y: height * 0.14 };
    return { p0, cp1, cp2, peak, trailEnd };
  }

  // Calculate point along cubic bezier
  function getBezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    };
  }

  // Render loop
  let lastTime = performance.now();

  function render(time) {
    if (!isVisible) return;
    animId = requestAnimationFrame(render);

    const dt = Math.min(40, time - lastTime);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    const { p0, cp1, cp2, peak, trailEnd } = getCurvePoints();

    // 1. Draw subtle vertical dashed grid lines aligned with labels
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const numCols = 6;
    for (let i = 0; i < numCols; i++) {
      const gx = width * (0.12 + i * 0.152);
      ctx.beginPath();
      ctx.moveTo(gx, 15);
      ctx.lineTo(gx, height - 32);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Ambient radial glow under the peak node
    const ambientGlow = ctx.createRadialGradient(peak.x, peak.y, 4, peak.x, peak.y, width * 0.42);
    ambientGlow.addColorStop(0, 'rgba(17, 98, 221, 0.24)');
    ambientGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
    ambientGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Faint trailing curve past the peak (to top right)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.bezierCurveTo(
      peak.x + (trailEnd.x - peak.x) * 0.4, peak.y - 15,
      trailEnd.x - 20, trailEnd.y + 10,
      trailEnd.x, trailEnd.y
    );
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 4. Main glowing neon blue curve (p0 to peak)
    ctx.save();
    // Glow pass
    ctx.shadowColor = '#1162dd';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, peak.x, peak.y);
    ctx.stroke();

    // Crisp inner core pass
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.75;
    ctx.stroke();
    ctx.restore();

    // 5. Interpolate marker position
    currentT += (targetT - currentT) * 0.08;
    const activePoint = getBezierPoint(p0, cp1, cp2, peak, Math.min(1, Math.max(0, currentT)));

    // 6. Expanding ripple waves around active node
    ripples.forEach(rip => {
      rip.r += 0.35 * (dt / 16.6);
      rip.alpha -= 0.009 * (dt / 16.6);
      if (rip.alpha <= 0) {
        rip.r = 3;
        rip.alpha = 0.75;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(activePoint.x, activePoint.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, rip.alpha)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // 7. Glowing Solid Node at the active marker
    ctx.save();
    // Halo
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(activePoint.x, activePoint.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Bright white center dot
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(activePoint.x, activePoint.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  // Interactive hover tracking along the curve
  const parentCard = canvas.closest('.bento-card');
  if (parentCard) {
    parentCard.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      // Map pointer X (0.1 to 0.85) to curve parameter t (0.0 to 1.0)
      const clampedX = Math.max(0.12, Math.min(0.74, relX));
      targetT = (clampedX - 0.12) / (0.74 - 0.12);
      isHovered = true;
    });

    parentCard.addEventListener('pointerleave', () => {
      targetT = 1.0; // Return smoothly to the peak node
      isHovered = false;
    });
  }

  // Section visibility observer
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && !animId) {
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    } else if (!isVisible && animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.1 });

  observer.observe(canvas);
  animId = requestAnimationFrame(render);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    observer.disconnect();
    window.removeEventListener('resize', resize);
  };
}

/* ==========================================================================
   2. CARD 1: COST EFFECTIVE SOLUTION (Interactive Growth Equalizer)
   ========================================================================== */
function initGrowthBars() {
  const container = document.getElementById('growthBars');
  if (!container) return;

  const bars = container.querySelectorAll('.bar');
  const parentCard = container.closest('.bento-card');
  if (!parentCard) return;

  const originalHeights = Array.from(bars).map(b => b.style.getPropertyValue('--h') || '50%');

  let hoverAnim = null;
  let phase = 0;

  function pulse() {
    phase += 0.08;
    bars.forEach((bar, idx) => {
      const base = parseFloat(originalHeights[idx]) || 50;
      const wave = Math.sin(phase + idx * 0.45) * 18;
      const newHeight = Math.min(100, Math.max(20, base + wave));
      bar.style.setProperty('--h', `${newHeight}%`);
    });
    hoverAnim = requestAnimationFrame(pulse);
  }

  parentCard.addEventListener('pointerenter', () => {
    if (hoverAnim) cancelAnimationFrame(hoverAnim);
    pulse();
  });

  parentCard.addEventListener('pointerleave', () => {
    if (hoverAnim) {
      cancelAnimationFrame(hoverAnim);
      hoverAnim = null;
    }
    // Smoothly restore original heights
    bars.forEach((bar, idx) => {
      bar.style.setProperty('--h', originalHeights[idx]);
    });
  });

  return () => {
    if (hoverAnim) cancelAnimationFrame(hoverAnim);
  };
}

/* ==========================================================================
   3. CARD 2: TAILOR-MADE DESIGN (3D Tilt & Micro-Beacon)
   ========================================================================== */
function initNotificationTilt() {
  const card = document.querySelector('.widget-notification')?.closest('.bento-card');
  const islandCard = card?.querySelector('.island-card');
  if (!card || !islandCard) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovered = false;
  let rafId = null;

  function updateTilt() {
    if (!isHovered && Math.abs(currentRotX) < 0.05 && Math.abs(currentRotY) < 0.05) {
      islandCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      rafId = null;
      return;
    }

    const targetRotX = isHovered ? mouseY * -8 : 0;
    const targetRotY = isHovered ? mouseX * 8 : 0;
    const targetY = isHovered ? -3 : 0;

    currentRotX += (targetRotX - currentRotX) * 0.12;
    currentRotY += (targetRotY - currentRotY) * 0.12;

    islandCard.style.transform = `perspective(800px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateY(${targetY}px)`;
    rafId = requestAnimationFrame(updateTilt);
  }

  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  card.addEventListener('pointerleave', () => {
    isHovered = false;
    mouseX = 0;
    mouseY = 0;
  });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/* ==========================================================================
   4. CARD 4: WORKFLOW INTEGRATION (Magnetic Interactive App Icons)
   ========================================================================== */
function initAppIcons() {
  const appIcons = document.querySelectorAll('.app-icon');
  if (!appIcons.length) return;

  const cleanups = [];

  appIcons.forEach((icon) => {
    let boundRect = null;

    const onEnter = () => {
      boundRect = icon.getBoundingClientRect();
    };

    const onMove = (e) => {
      if (!boundRect) boundRect = icon.getBoundingClientRect();
      const centerX = boundRect.left + boundRect.width / 2;
      const centerY = boundRect.top + boundRect.height / 2;
      const dx = (e.clientX - centerX) * 0.28;
      const dy = (e.clientY - centerY) * 0.28;
      icon.style.transform = `translate(${dx}px, ${dy}px) scale(1.14)`;
    };

    const onLeave = () => {
      icon.style.transform = 'translate(0px, 0px) scale(1)';
      boundRect = null;
    };

    icon.addEventListener('pointerenter', onEnter);
    icon.addEventListener('pointermove', onMove);
    icon.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      icon.removeEventListener('pointerenter', onEnter);
      icon.removeEventListener('pointermove', onMove);
      icon.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach(fn => fn());
}

/* ==========================================================================
   5. CARD 5: COLLABORATE REAL-TIME (Interactive Remote Cursor "Elia")
   ========================================================================== */
function initCollabCursor() {
  const cursor = document.getElementById('collabCursor');
  const card = cursor?.closest('.bento-card-wide');
  if (!cursor || !card) return;

  let isHovered = false;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  function updateCursor() {
    if (!isHovered && Math.abs(currentX) < 0.5 && Math.abs(currentY) < 0.5) {
      cursor.style.transform = '';
      rafId = null;
      return;
    }

    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    cursor.style.transform = `translate(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px)`;
    rafId = requestAnimationFrame(updateCursor);
  }

  card.addEventListener('pointermove', (e) => {
    const cluster = card.querySelector('.avatars-cluster');
    if (!cluster) return;

    const clusterRect = cluster.getBoundingClientRect();
    // Offset relative to the initial cursor position
    const relX = (e.clientX - clusterRect.right) * 0.35;
    const relY = (e.clientY - clusterRect.bottom) * 0.35;

    targetX = Math.max(-120, Math.min(20, relX));
    targetY = Math.max(-70, Math.min(30, relY));

    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(updateCursor);
  });

  card.addEventListener('pointerleave', () => {
    isHovered = false;
    targetX = 0;
    targetY = 0;
  });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}
