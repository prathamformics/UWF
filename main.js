/**
 * UnlimitedWF — anfalova.art Liquid Glass WebGL Carousel & Hero Controller
 * Clean, seamless full-hero canvas with:
 * - Real Three.js Liquid Glass distortion engine covering the full hero
 * - Smooth cylindrical rim swirl & chromatic dispersion
 * - Autoplay, pause toggle button (Ⅱ / ▶), drag & touch inertia
 * - Zero stepped lines, zero background box cutoffs
 * - Headline tooltip cards & mobile navigation
 */

import { createLiquidCarousel, cl as getLiquidConfig } from './LiquidGlassEngine.js';
import { initPixelGrid } from './pixelGrid.js';
import { initCustomCursor } from './cursor.js';
import { initProcessAnimations } from './processAnimations.js';
import { initServicesScrollPath } from './servicesPath.js';
import Lenis from './lenis.mjs';

function triggerSiteEntrance() {
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.classList.add('is-loaded');
    }, 40);
  });
}

/**
 * Lenis Smooth Scroll Engine
 * Provides buttery-smooth momentum scrolling across the entire site
 */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.8,
    infinite: false,
  });

  window.lenis = lenis;

  // Synchronize Lenis and GSAP ScrollTrigger to identical microsecond ticker (exact two26 architecture)
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth scroll to anchor targets (#projects, #process, #services, #contact, etc.)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      // Ignore hash links that are for lightbox, tabs or js routing (like #case/surfsky)
      if (href.startsWith('#case/')) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.3 });
      }
    });
  });

  return lenis;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    triggerSiteEntrance();
    initSmoothScroll();
    initCustomCursor();
    initPixelGrid();
    initWebGLLiquidCarousel();
    initHeadlineHints();
    initLightbox();
    initMobileNav();
    initProjectsSection();
    initProcessAnimations();
    initScrollReveal();
    initServicesScrollPath();
    initPricingToggle();
    initCtaLiquidCarousel();
    initCtaAndFooter();
  });
} else {
  triggerSiteEntrance();
  initSmoothScroll();
  initCustomCursor();
  initPixelGrid();
  initWebGLLiquidCarousel();
  initHeadlineHints();
  initLightbox();
  initMobileNav();
  initProjectsSection();
  initProcessAnimations();
  initScrollReveal();
  initServicesScrollPath();
  initPricingToggle();
  initCtaLiquidCarousel();
  initCtaAndFooter();
}

/* ==========================================================================
   WEBGL LIQUID GLASS CAROUSEL (Full-Hero Mount)
   ========================================================================== */
function initWebGLLiquidCarousel() {
  const surface = document.getElementById('originkitSurface');
  const pauseBtn = document.getElementById('carouselPauseBtn');
  const heroEl = document.getElementById('hero');
  const shellEl = document.getElementById('hero-carousel');
  if (!surface) return;

  let isPaused = false;
  let carouselInstance = null;

  // Project cards from workspace
  const items = [
    { src: 'Rectangle 11.png', type: 'image', aspect: 1.776 },
    { src: 'Rectangle 12.png', type: 'image', aspect: 1.776 },
    { src: 'Rectangle 13.png', type: 'image', aspect: 1.776 },
    { src: 'Rectangle 14.png', type: 'image', aspect: 1.776 },
    { src: 'Rectangle 15.png', type: 'image', aspect: 1.776 },
    { src: 'Rectangle 16.png', type: 'image', aspect: 1.776 }
  ];

  function getConfig() {
    const w = Math.max(1, surface.clientWidth || window.innerWidth);
    const h = Math.max(1, surface.clientHeight || window.innerHeight);
    const aspect = w / h;
    const b = Math.max(1, aspect / (1440 / 1028));

    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    const cardW = isMobile
      ? Math.min(345, Math.max(290, w * 0.82))
      : isTablet
        ? Math.min(460, Math.max(350, w * 0.44))
        : Math.min(520, Math.max(390, w * 0.28));
    const cardH = cardW / 1.52;
    // Calculate vertical center of the carousel accurately anchored to the #hero-carousel shell
    let centerY = h * 0.42;
    if (heroEl && shellEl) {
      const heroRect = heroEl.getBoundingClientRect();
      const shellRect = shellEl.getBoundingClientRect();
      if (heroRect.height > 0 && shellRect.height > 0) {
        centerY = (shellRect.top - heroRect.top) + shellRect.height / 2;
      }
    }

    // Responsive liquid glass lens geometry:
    // Increased lens size so the blue refraction ring expands across the viewport
    // showing expansive, sweeping liquid glass arcs rather than a small enclosed ring
    let lensWidth, lensHeight, lensRotation, lensDispersion, lensRim;
    if (isMobile) {
      lensWidth = Math.max(0.34, 0.72 * aspect);
      lensHeight = Math.max(0.54, 1.15 * aspect);
      lensRotation = 55;
      lensDispersion = 16;
      lensRim = 0.85;
    } else if (isTablet) {
      const tb = Math.max(0.7, aspect / 1.15);
      lensWidth = 0.44 * tb;
      lensHeight = 0.78 * tb;
      lensRotation = 60;
      lensDispersion = 14;
      lensRim = 0.75;
    } else {
      lensWidth = 0.565 * b;
      lensHeight = b;
      lensRotation = 65;
      lensDispersion = 12;
      lensRim = 0.65;
    }

    return getLiquidConfig({
      cardWidth: cardW,
      cardHeight: cardH,
      gap: isMobile ? 14 : 18,
      cardRadius: 16,
      rowCenterY: centerY,
      background: '#09090a',
      sizeMode: 'same',
      lens: {
        enabled: true,
        width: lensWidth,
        height: lensHeight,
        whiteGlow: 0,
        ringColor: '#1162dd', // UNLIMITEDWF Official Brand Blue (#1162DD) refraction ring!
        dispersion: lensDispersion, // Chromatic dispersion for color fringes
        rimTangential: lensRim,     // Liquid rim wave distortion
        rotation: lensRotation,
        shimmer: true
      },
      motion: { sensitivity: 3.6, glide: 5.5, snap: false },
      autoplaySpeed: 0.85,
      interaction: {
        wheel: false,
        drag: true,
        clickToFocus: false,
        focusTransition: { duration: 0.65, ease: 'easeInOut' }
      },
      paused: isPaused,
      entry: {
        enabled: false // Immediate drag readiness without animation lock
      }
    });
  }

  try {
    carouselInstance = createLiquidCarousel(surface, getConfig);
    carouselInstance.setItems(items);
  } catch (err) {
    console.error('Liquid glass WebGL carousel failed to initialize:', err);
  }

  // Floating pause / resume button
  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '▶' : 'Ⅱ';
      pauseBtn.setAttribute('aria-pressed', isPaused);
      pauseBtn.setAttribute('aria-label', isPaused ? 'Resume gallery' : 'Pause gallery');
    });
  }

  // Window resize handler
  window.addEventListener('resize', () => {
    if (carouselInstance) {
      carouselInstance.frame?.();
    }
  });
}

/* ==========================================================================
   HEADLINE INTERACTIVE HINTS
   ========================================================================== */
function initHeadlineHints() {
  const popup = document.getElementById('hintPopup');
  const hintText = document.getElementById('hintText');
  const hintWraps = document.querySelectorAll('.hint-wrap');

  if (!popup || !hintText || hintWraps.length === 0) return;

  hintWraps.forEach(wrap => {
    wrap.addEventListener('mouseenter', (e) => {
      const text = wrap.getAttribute('data-hint');
      if (!text) return;
      hintText.textContent = text;
      popup.classList.add('is-active');
      popup.setAttribute('aria-hidden', 'false');
      updatePosition(e);
    });

    wrap.addEventListener('mousemove', (e) => {
      updatePosition(e);
    });

    wrap.addEventListener('mouseleave', () => {
      popup.classList.remove('is-active');
      popup.setAttribute('aria-hidden', 'true');
    });
  });

  function updatePosition(e) {
    const x = Math.min(window.innerWidth - 340, Math.max(20, e.clientX - 16));
    const y = e.clientY - 90;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  }
}

/* ==========================================================================
   LIGHTBOX MODAL PREVIEW
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (!modal || !modalImg) return;

  window.openLightbox = (src, caption) => {
    modalImg.src = src;
    if (modalCaption) modalCaption.textContent = caption || '';
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  };

  const closeLightbox = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.querySelector('.site-nav');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  menu.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   LATEST PROJECTS SECTION — Minimalist Editorial Project List (anfalova UI)
   - Interactive hover color morph to vivid red (#f03d24)
   - Dual typography morph for Proof into signature italic serif (Instrument Serif)
   - Red circular arrow button reveals smoothly on the right edge
   - Floating interactive cursor preview card tracking pointer movement with 60fps lerp
   - Click to open project preview in full lightbox
   ========================================================================== */
function initProjectsSection() {
  const section = document.querySelector('.projects-section');
  const projectRows = document.querySelectorAll('.project-row');
  const floatingPreview = document.getElementById('projectFloatingPreview');
  const previewImg = document.getElementById('floatingPreviewImg');
  const allProjectsBtn = document.getElementById('projectsAllBtn');

  if (!section || !projectRows.length) return;

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  let mouseX = -500;
  let mouseY = -500;
  let previewX = -500;
  let previewY = -500;
  let isHoveringSection = false;
  let isPreviewVisible = false;

  // 60fps Spring/Lerp Loop for the floating preview card
  function renderPreview() {
    if (isFinePointer && floatingPreview) {
      const ease = 0.16;
      previewX += (mouseX - previewX) * ease;
      previewY += (mouseY - previewY) * ease;

      floatingPreview.style.transform = `translate3d(${previewX}px, ${previewY}px, 0) translate(-50%, -50%) scale(${isPreviewVisible ? 1 : 0.88})`;
    }
    requestAnimationFrame(renderPreview);
  }

  if (isFinePointer) {
    requestAnimationFrame(renderPreview);
  }

  // Pointer movement tracking over section
  section.addEventListener('pointerenter', () => {
    isHoveringSection = true;
  });

  section.addEventListener('pointerleave', () => {
    isHoveringSection = false;
    isPreviewVisible = false;
    if (floatingPreview) floatingPreview.classList.remove('is-visible');
    projectRows.forEach(row => row.classList.remove('is-active-pointer'));
  });

  window.addEventListener('pointermove', (e) => {
    if (!isHoveringSection) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Attach hover interactions to each project row
  projectRows.forEach((row) => {
    const previewSrc = row.getAttribute('data-preview');
    const projectTitle = row.querySelector('.project-title')?.textContent.trim() || 'Project';

    row.addEventListener('pointerenter', (e) => {
      projectRows.forEach(r => r.classList.toggle('is-active-pointer', r === row));

      if (previewSrc && previewImg) {
        if (previewImg.getAttribute('src') !== previewSrc) {
          previewImg.style.opacity = '0.5';
          previewImg.src = previewSrc;
          setTimeout(() => {
            previewImg.style.opacity = '1';
          }, 60);
        }
      }

      if (isFinePointer && floatingPreview) {
        isPreviewVisible = true;
        floatingPreview.classList.add('is-visible');

        // Immediately set preview position if it was far away
        if (previewX < -100) {
          previewX = e.clientX;
          previewY = e.clientY;
        }
      }
    });

    row.addEventListener('pointerleave', () => {
      row.classList.remove('is-active-pointer');
    });

    // Click handler: opens lightbox preview
    row.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.openLightbox && previewSrc) {
        window.openLightbox(previewSrc, projectTitle);
      }
    });

    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  });

  // "All projects (+)" toggle
  if (allProjectsBtn) {
    allProjectsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const firstRow = projectRows[0];
      if (firstRow) {
        firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

/* ==========================================================================
   SCROLL TO REVEAL ENGINE
   IntersectionObserver with staggered delays & fluid cubic-bezier motion
   ========================================================================== */
function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll(
      '.projects-header, .projects-header-divider, .project-row, .bento-header, .bento-card, .bento-chip'
    ).forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // 1. Projects List: row stagger indices
  const projectRows = document.querySelectorAll('.project-row');
  projectRows.forEach((row, i) => {
    row.style.setProperty('--row-i', i);
  });

  // 2. Bento Grid Cards: staggered entrance delay by row
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach((card, i) => {
    // Row 1 (first 3 compact cards): 0.05s, 0.18s, 0.31s; Row 2 (2 wide cards): 0.06s, 0.20s
    const delay = (i < 3) ? (0.05 + i * 0.13) : (0.06 + (i - 3) * 0.15);
    card.style.setProperty('--card-delay', `${delay.toFixed(2)}s`);
  });

  // 3. Bento Chips: subtle wave stagger across the pills
  const chips = document.querySelectorAll('.bento-chip');
  chips.forEach((chip, i) => {
    chip.style.setProperty('--chip-i', i);
  });

  // 4. IntersectionObserver: smooth entry
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const targets = document.querySelectorAll(
    '.projects-header, .projects-header-divider, .project-row, .bento-header, .bento-card, .bento-chip, .pricing-kicker, .pricing-title-wrap, .pricing-toggle-wrap, .pricing-card, .pricing-footer'
  );

  targets.forEach(target => revealObserver.observe(target));
}

/* ==========================================================================
   PRICING SECTION TOGGLE
   Seamless toggle between Monthly Subscription plans and Project-Based plans
   ========================================================================== */
function initPricingToggle() {
  const btnMonthly = document.getElementById('pricingTabMonthly');
  const btnProject = document.getElementById('pricingTabProject');
  const gridMonthly = document.getElementById('pricingMonthlyGrid');
  const gridProject = document.getElementById('pricingProjectGrid');

  if (!btnMonthly || !btnProject || !gridMonthly || !gridProject) return;

  function switchTab(mode) {
    if (mode === 'monthly') {
      btnMonthly.classList.add('is-active');
      btnMonthly.setAttribute('aria-selected', 'true');
      btnProject.classList.remove('is-active');
      btnProject.setAttribute('aria-selected', 'false');

      gridMonthly.classList.add('is-active');
      gridMonthly.removeAttribute('hidden');
      gridProject.classList.remove('is-active');
      gridProject.setAttribute('hidden', '');
    } else {
      btnProject.classList.add('is-active');
      btnProject.setAttribute('aria-selected', 'true');
      btnMonthly.classList.remove('is-active');
      btnMonthly.setAttribute('aria-selected', 'false');

      gridProject.classList.add('is-active');
      gridProject.removeAttribute('hidden');
      gridMonthly.classList.remove('is-active');
      gridMonthly.setAttribute('hidden', '');
    }

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  btnMonthly.addEventListener('click', () => switchTab('monthly'));
  btnProject.addEventListener('click', () => switchTab('project'));
}

/* ==========================================================================
   CTA & Footer Controller: Email Clipboard & Smooth Back-to-Top
   ========================================================================== */
function initCtaAndFooter() {
  const emailBtn = document.getElementById('emailCopyBtn');
  const copyTag = document.getElementById('copyTag');
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (emailBtn && copyTag) {
    emailBtn.addEventListener('click', async () => {
      const email = 'hello@unlimitedwf.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        copyTag.textContent = 'Copied! ✓';
        copyTag.classList.add('copied');
        setTimeout(() => {
          copyTag.textContent = 'Copy';
          copyTag.classList.remove('copied');
        }, 2200);
      } catch (err) {
        console.warn('Could not copy email to clipboard', err);
      }
    });
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  initFooterAurora();
}

/* ==========================================================================
   DYNAMIC AURORA LIGHT CONTROLLER: Ultra-Smooth GPU-Composited Cursor Tracking
   High-performance 120FPS tracking via hardware-accelerated translate3d.
   ========================================================================== */
function initFooterAurora() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const cursorBeam = footer.querySelector('.aurora-cursor-beam');
  if (!cursorBeam) return;

  let currentOffsetX = 0;
  let targetOffsetX = 0;
  let isPointerOver = false;
  let isVisible = false;
  let idleTime = 0;
  let animFrameId = null;

  // Cache footer bounds without forcing reflows during pointermove
  let footerRect = footer.getBoundingClientRect();
  function updateBounds() {
    footerRect = footer.getBoundingClientRect();
  }

  function onPointerMove(e) {
    if (!isVisible) return;
    const topLimit = footerRect.top - 120;
    const bottomLimit = footerRect.bottom + 120;
    if (e.clientY >= topLimit && e.clientY <= bottomLimit) {
      isPointerOver = true;
      const footerWidth = footerRect.width || footer.clientWidth || 1200;
      const relX = Math.max(0, Math.min(footerWidth, e.clientX - footerRect.left));
      // Shift from center (-50% to +50% width scaled)
      targetOffsetX = (relX - footerWidth * 0.5) * 0.75;
    } else {
      isPointerOver = false;
    }
  }

  function onPointerLeave() {
    isPointerOver = false;
  }

  function animateAurora() {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    if (!isPointerOver) {
      idleTime += 0.012;
      targetOffsetX = Math.sin(idleTime) * 90;
    }

    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.08;

    // Direct GPU Composited Transform (Zero layout, zero paint, zero style invalidation)
    cursorBeam.style.transform = `translate3d(${currentOffsetX.toFixed(1)}px, 0, 0)`;

    animFrameId = requestAnimationFrame(animateAurora);
  }

  // IntersectionObserver: Only animate when footer is actually in the viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          updateBounds();
          if (!animFrameId) {
            animFrameId = requestAnimationFrame(animateAurora);
          }
        } else {
          if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        }
      });
    }, { threshold: 0.02 });
    observer.observe(footer);
  } else {
    isVisible = true;
    animFrameId = requestAnimationFrame(animateAurora);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', updateBounds, { passive: true });
  window.addEventListener('scroll', updateBounds, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave);
}

/* ==========================================================================
   CTA SECTION: LIQUID GLASS IMAGE SLIDER (Identical to Hero Carousel Engine)
   ========================================================================== */
function initCtaLiquidCarousel() {
  const surface = document.getElementById('ctaCarouselSurface');
  if (!surface) return;

  const items = [
    { src: 'Rectangle 11.png', type: 'image' },
    { src: 'Rectangle 12.png', type: 'image' },
    { src: 'Rectangle 13.png', type: 'image' },
    { src: 'Rectangle 14.png', type: 'image' },
    { src: 'Rectangle 15.png', type: 'image' },
    { src: 'Rectangle 16.png', type: 'image' },
  ];

  function getConfig() {
    const w = Math.max(1, surface.clientWidth || window.innerWidth);
    const h = Math.max(1, surface.clientHeight || window.innerHeight);
    const aspect = w / h;
    const b = Math.max(1, aspect / (1440 / 1028));
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    const cardW = isMobile ? Math.min(280, w * 0.70) : Math.min(340, w * 0.24);
    const cardH = cardW / 1.52;

    let lensWidth, lensHeight, lensRotation, lensDispersion, lensRim;
    if (isMobile) {
      lensWidth = Math.max(0.34, 0.72 * aspect);
      lensHeight = Math.max(0.54, 1.15 * aspect);
      lensRotation = 55;
      lensDispersion = 16;
      lensRim = 0.85;
    } else if (isTablet) {
      const tb = Math.max(0.7, aspect / 1.15);
      lensWidth = 0.44 * tb;
      lensHeight = 0.78 * tb;
      lensRotation = 60;
      lensDispersion = 14;
      lensRim = 0.75;
    } else {
      lensWidth = 0.55 * b;
      lensHeight = b * 0.95;
      lensRotation = 65;
      lensDispersion = 12;
      lensRim = 0.65;
    }

    return getLiquidConfig({
      cardWidth: cardW,
      cardHeight: cardH,
      gap: isMobile ? 12 : 16,
      cardRadius: 14,
      rowCenterY: h * 0.5,
      background: '#090a0f',
      sizeMode: 'same',
      lens: {
        enabled: true,
        width: lensWidth,
        height: lensHeight,
        whiteGlow: 0,
        ringColor: '#1162dd',
        dispersion: lensDispersion,
        rimTangential: lensRim,
        rotation: lensRotation,
        shimmer: true
      },
      motion: { sensitivity: 3.5, glide: 5.5, snap: false },
      autoplaySpeed: 0.85,
      interaction: {
        wheel: false,
        drag: true,
        clickToFocus: false
      },
      entry: {
        enabled: false
      }
    });
  }

  try {
    const ctaCarousel = createLiquidCarousel(surface, getConfig);
    ctaCarousel.setItems(items);

    window.addEventListener('resize', () => {
      ctaCarousel.frame?.();
    });
  } catch (err) {
    console.error('CTA Liquid glass carousel failed to initialize:', err);
  }
}


