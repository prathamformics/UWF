/**
 * Custom Square Outline Cursor with Magnetic Menu Box Morph
 * - Default State: Precision square outline with UNLIMITEDWF brand blue (#1162DD) jewel dot
 * - Menu Hover State: Morphs smoothly into the exact outline box enclosing the menu text
 * - High-precision 60fps lerp physics
 * - Seamless support for desktop mouse; gracefully disabled on touch devices
 */

export function initCustomCursor() {
  // Only activate on pointer-fine devices (mouse, trackpad)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursorEl = document.getElementById('customCursor');
  const boxEl = document.getElementById('cursorBox');
  const dotEl = document.getElementById('cursorDot');
  if (!cursorEl || !boxEl || !dotEl) return;

  document.body.classList.add('has-custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let boxX = -100;
  let boxY = -100;

  const DEFAULT_SIZE = 28;
  const DEFAULT_RADIUS = 5;

  let boxW = DEFAULT_SIZE;
  let boxH = DEFAULT_SIZE;
  let boxRadius = DEFAULT_RADIUS;

  let targetX = -100;
  let targetY = -100;
  let targetW = DEFAULT_SIZE;
  let targetH = DEFAULT_SIZE;
  let targetRadius = DEFAULT_RADIUS;

  let isHovering = false;
  let isDown = false;
  let isVisible = false;

  const navItems = document.querySelectorAll('.site-nav .nav-item');

  function render() {
    // Dot tracks mouse coordinates immediately for zero-latency feedback
    dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Outer outline box lerps smoothly to target position and shape
    const ease = isHovering ? 0.22 : 0.18;
    boxX += (targetX - boxX) * ease;
    boxY += (targetY - boxY) * ease;
    boxW += (targetW - boxW) * ease;
    boxH += (targetH - boxH) * ease;
    boxRadius += (targetRadius - boxRadius) * ease;

    const scale = isDown ? 0.92 : 1.0;

    boxEl.style.transform = `translate3d(${boxX}px, ${boxY}px, 0) translate(-50%, -50%) scale(${scale})`;
    boxEl.style.width = `${boxW}px`;
    boxEl.style.height = `${boxH}px`;
    boxEl.style.borderRadius = `${boxRadius}px`;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorEl.classList.add('is-visible');
      boxX = mouseX;
      boxY = mouseY;
    }

    if (!isHovering) {
      targetX = mouseX;
      targetY = mouseY;
      targetW = DEFAULT_SIZE;
      targetH = DEFAULT_SIZE;
      targetRadius = DEFAULT_RADIUS;
    }
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    isDown = true;
  });

  window.addEventListener('pointerup', () => {
    isDown = false;
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorEl.classList.remove('is-visible');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorEl.classList.add('is-visible');
  });

  const MAGNETIC_SELECTOR = '.site-nav .nav-item, .btn-cta, .projects-all-btn, .project-arrow-btn, .plan-btn, .pricing-toggle-btn, .carousel-btn, .lightbox-close, .mobile-toggle, [data-magnetic]';
  let activeMagneticItem = null;

  function snapToItem(item) {
    const rect = item.getBoundingClientRect();
    const compStyle = window.getComputedStyle(item);
    const rawRadius = parseFloat(compStyle.borderRadius) || 7;
    const isPill = rawRadius >= Math.min(rect.height / 2 - 2, 20);

    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
    targetW = rect.width + 8;
    targetH = rect.height + 8;
    targetRadius = isPill ? 9999 : rawRadius + 3;
  }

  // Delegated pointer events for zero-overhead, dynamic magnetic hover morph
  document.addEventListener('pointerover', (e) => {
    const item = e.target.closest(MAGNETIC_SELECTOR);
    if (item) {
      activeMagneticItem = item;
      isHovering = true;
      cursorEl.classList.add('is-nav-hover');
      snapToItem(item);
    }
  });

  document.addEventListener('pointerout', (e) => {
    if (!activeMagneticItem) return;
    const item = e.target.closest(MAGNETIC_SELECTOR);
    if (item === activeMagneticItem) {
      if (e.relatedTarget && activeMagneticItem.contains(e.relatedTarget)) {
        return;
      }
      activeMagneticItem = null;
      isHovering = false;
      cursorEl.classList.remove('is-nav-hover');
      targetX = mouseX;
      targetY = mouseY;
      targetW = DEFAULT_SIZE;
      targetH = DEFAULT_SIZE;
      targetRadius = DEFAULT_RADIUS;
    }
  });

  // Keep target pinned to item position on mousemove/scroll
  window.addEventListener('pointermove', () => {
    if (isHovering && activeMagneticItem) {
      snapToItem(activeMagneticItem);
    }
  }, { passive: true });
}

