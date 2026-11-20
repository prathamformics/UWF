/**
 * UnlimitedWF — Services Winding Path Controller
 * Exact two26.studio architecture:
 * - GSAP 3 + ScrollTrigger with scrub: 1.2 linked to Lenis
 * - 7 Proximity Lottie expansions with back.out(3.5) spring physics
 * - Word separation: center Lottie expands from 0 to 7.25em, pushing words apart
 * - Capsule pops open at -5deg rotation
 */

export function initServicesScrollPath() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded yet');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof DrawSVGPlugin !== 'undefined') {
    gsap.registerPlugin(DrawSVGPlugin);
  }

  const section = document.querySelector('.section-services-body');
  if (!section) return;

  const layers = Array.from(section.querySelectorAll('.service-layer'));
  const desktopDarkPath = section.querySelector('.services-path-svg-dark path');

  if (!desktopDarkPath) return;

  // 1. Setup Dark SVG Path Initial State
  // Accurately measure total path length (exact SVG viewBox units: ~6532)
  let pathLength = 6535;
  try {
    if (desktopDarkPath.getTotalLength && desktopDarkPath.getTotalLength() > 100) {
      pathLength = Math.ceil(desktopDarkPath.getTotalLength());
    }
  } catch (err) {
    pathLength = 6535;
  }

  desktopDarkPath.style.strokeLinecap = 'round';
  desktopDarkPath.style.strokeLinejoin = 'round';

  // Dash = pathLength, Gap = pathLength * 4 (Prevents any secondary repetition from ever appearing on the path)
  desktopDarkPath.style.strokeDasharray = `${pathLength} ${pathLength * 4}`;
  desktopDarkPath.style.strokeDashoffset = `${pathLength}`;

  // 2. Setup Service Blocks Initial State & Load Lottie Animations
  const lottieInstances = [];
  layers.forEach((layer) => {
    const block = layer.querySelector('.service-block') || layer;
    const centerSvg = block.querySelector('.service-svg');
    const paraWrapper = block.querySelector('.service-block-para-wrapper');

    if (centerSvg) {
      const lottieFile = centerSvg.dataset.lottie;
      if (lottieFile && typeof lottie !== 'undefined') {
        const anim = lottie.loadAnimation({
          container: centerSvg,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: lottieFile,
        });
        lottieInstances.push(anim);
      }

      centerSvg.style.transformOrigin = 'center center';
      centerSvg.style.willChange = 'transform, width, opacity';
      centerSvg.style.flexShrink = '0';

      gsap.set(centerSvg, {
        width: 0,
        scale: 0,
        opacity: 0,
        overflow: 'hidden',
        margin: '0px',
      });
    }

    if (paraWrapper) {
      paraWrapper.style.transformOrigin = 'center center';
      paraWrapper.style.willChange = 'transform, opacity';
      gsap.set(paraWrapper, {
        scale: 0,
        rotation: 0,
        opacity: 0,
      });
    }
  });

  // 3. Connect GSAP ScrollTrigger with Lenis Smooth Scroll
  if (window.lenis) {
    window.lenis.on('scroll', ScrollTrigger.update);
  }

  // 4. Create Master Scrubbed Timeline (Scrub 1.2 for buttery physical inertia)
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      scroller: window,
      start: 'top 70%',
      end: 'bottom 70%',
      scrub: 1.2,
      invalidateOnRefresh: true,
    },
  });

  // A. Dark Path draws 0% to 100% across the full scrub duration with zero wrapping
  masterTl.fromTo(
    desktopDarkPath,
    { strokeDashoffset: pathLength },
    {
      strokeDashoffset: 0,
      ease: 'none',
      duration: 1,
    },
    0
  );

  // B. Proximity Expansions for each of the 7 Service Layers (Curve Milestones)
  const layerMilestones = [0.145, 0.255, 0.415, 0.565, 0.635, 0.765, 0.875];
  const totalLayers = layers.length;

  layers.forEach((layer, index) => {
    const block = layer.querySelector('.service-block') || layer;
    const centerSvg = block.querySelector('.service-svg');
    const paraWrapper = block.querySelector('.service-block-para-wrapper');

    // Align animation start exactly when the curve sweeps through this milestone
    const point = layerMilestones[index] !== undefined ? layerMilestones[index] : (index / (totalLayers - 1));
    const stepDuration = 0.12;
    const startTime = Math.max(0, point - 0.045);

    // Center SVG container expands with prominent back.out(3.5) bounce
    if (centerSvg) {
      masterTl.to(
        centerSvg,
        {
          width: '7.25em',
          scale: 1,
          opacity: 1,
          duration: stepDuration,
          ease: 'back.out(3.5)',
        },
        startTime
      );
    }

    // Paragraph wrapper pops with scale 1, -3deg rotation, and prominent bounce
    if (paraWrapper) {
      masterTl.to(
        paraWrapper,
        {
          scale: 1,
          rotation: -3,
          opacity: 1,
          duration: stepDuration,
          ease: 'back.out(3.5)',
        },
        startTime + 0.02
      );
    }
  });

  // Refresh ScrollTrigger once everything is mounted
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
}
