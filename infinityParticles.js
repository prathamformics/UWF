/**
 * UnlimitedWF — Interactive Stardust Particle Infinity Engine
 *
 * Renders the iconic Unlimited Logo (∞ / Lemniscate of Bernoulli)
 * as a dense, luminous quantum stardust cloud on pitch black,
 * complete with subtle astronomical concentric radar rings, 3D perspective tilt,
 * magnetic swirl physics, and click shockwave ripple.
 */

export function initInfinityParticles() {
  const canvas = document.getElementById('infinityCanvas');
  const section = document.getElementById('infinity');
  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;
  let isVisible = true;

  // 3D Camera / Perspective
  let rotX = 0.08;
  let rotY = 0;
  let rotZ = 0;
  let targetRotX = 0.08;
  let targetRotY = 0;

  // Mouse / Pointer State
  let mouseX = -9999;
  let mouseY = -9999;
  let isHovered = false;

  // Shockwaves on click/tap
  const shockwaves = [];

  // Particle System Configuration
  // 6,800 particles for dense, stardust silhouette matching reference
  const PARTICLE_COUNT = 6800;
  const particles = [];

  // Color palette: Diamond White core, Electric Cyan, Azure, Sky Blue
  const PALETTE = [
    { r: 255, g: 255, b: 255, weight: 0.60 }, // Bright Diamond White (core stardust)
    { r: 220, g: 245, b: 255, weight: 0.18 }, // Crisp Icy White
    { r: 56,  g: 189, b: 248, weight: 0.12 }, // Electric Cyan (#38bdf8)
    { r: 17,  g: 98,  b: 221, weight: 0.07 }, // Brand Blue (#1162dd)
    { r: 147, g: 197, b: 253, weight: 0.03 }  // Soft Sky Light
  ];

  function pickColor() {
    const rand = Math.random();
    let cumulative = 0;
    for (const c of PALETTE) {
      cumulative += c.weight;
      if (rand <= cumulative) return c;
    }
    return PALETTE[0];
  }

  // Gaussian random helper (Box-Muller transform)
  function randomGaussian(mean = 0, stdev = 1) {
    const u1 = 1 - Math.random();
    const u2 = 1 - Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdev * randStdNormal;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Initialize Particles along Lemniscate of Bernoulli
  function createParticles() {
    particles.length = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Parameter t along the infinity loop (0 to 2*PI)
      const t = Math.random() * Math.PI * 2;

      // Classify particles into 3 layers:
      // 1) 68% Dense Core: very tight Gaussian scatter, high brightness
      // 2) 22% Mid Body: soft body thickness
      // 3) 10% Dispersed Cosmic Halo: scattered stardust grain
      const randLayer = Math.random();
      let layer = 'core';
      let scatterRad = 0;
      let baseSize = 1.0;
      let alpha = 0.85;

      if (randLayer < 0.68) {
        layer = 'core';
        scatterRad = randomGaussian(0, 10);
        baseSize = 0.8 + Math.random() * 1.5;
        alpha = 0.65 + Math.random() * 0.35;
      } else if (randLayer < 0.90) {
        layer = 'body';
        scatterRad = randomGaussian(0, 24);
        baseSize = 0.7 + Math.random() * 1.6;
        alpha = 0.35 + Math.random() * 0.45;
      } else {
        layer = 'halo';
        // Ethereal outer stardust dust
        scatterRad = randomGaussian(0, 52);
        baseSize = 0.6 + Math.random() * 1.8;
        alpha = 0.15 + Math.random() * 0.4;
      }

      const color = pickColor();

      particles.push({
        t,
        speed: (0.0004 + Math.random() * 0.001) * (Math.random() > 0.08 ? 1 : -1),
        scatterX: scatterRad * (Math.random() - 0.5) * 1.6,
        scatterY: scatterRad * (Math.random() - 0.5) * 1.2,
        scatterZ: randomGaussian(0, 16),
        layer,
        baseSize,
        color,
        alpha,
        twinkleSpeed: 0.015 + Math.random() * 0.035,
        twinklePhase: Math.random() * Math.PI * 2,
        // Elastic displacement physics
        offsetX: 0,
        offsetY: 0,
        vx: 0,
        vy: 0
      });
    }
  }

  createParticles();

  // Mouse / Pointer Interaction
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    const nx = (mouseX / width - 0.5) * 2;
    const ny = (mouseY / height - 0.5) * 2;

    targetRotY = nx * 0.35;
    targetRotX = -ny * 0.28 + 0.08;
    isHovered = true;
  });

  canvas.addEventListener('pointerleave', () => {
    mouseX = -9999;
    mouseY = -9999;
    targetRotY = 0;
    targetRotX = 0.08;
    isHovered = false;
  });

  // Shockwave trigger on click
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    shockwaves.push({
      x: cx,
      y: cy,
      radius: 0,
      maxRadius: Math.max(width, height) * 0.7,
      intensity: 1.0
    });
  });

  // Render Loop
  let lastTime = performance.now();
  let timeTotal = 0;

  function render(time) {
    if (!isVisible) return;
    animId = requestAnimationFrame(render);

    const dt = Math.min(36, time - lastTime);
    lastTime = time;
    timeTotal += dt * 0.001;

    // Solid pitch black background (reference aesthetic)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Camera rotation smoothing
    rotX += (targetRotX - rotX) * 0.06;
    rotY += (targetRotY - rotY) * 0.06;
    rotZ += (0 - rotZ) * 0.06;

    // Scale calculation: Lemniscate of Bernoulli
    const scale = Math.min(width * 0.36, height * 0.52, 360);
    const zDepth = scale * 0.32;

    // ── 1. Astronomical / Radar Concentric Circles & Coordinates ──
    ctx.save();
    ctx.lineWidth = 1;
    const ringRadii = [scale * 0.28, scale * 0.55, scale * 0.88, scale * 1.22, scale * 1.58];

    ringRadii.forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.038)' : 'rgba(255, 255, 255, 0.022)';
      ctx.stroke();
    });

    // Subtle crosshair axes through center
    ctx.beginPath();
    ctx.moveTo(centerX - scale * 1.7, centerY);
    ctx.lineTo(centerX + scale * 1.7, centerY);
    ctx.moveTo(centerX, centerY - scale * 1.3);
    ctx.lineTo(centerX, centerY + scale * 1.3);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.stroke();
    ctx.restore();

    // ── 2. Update Shockwaves ──
    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += 7.0 * (dt / 16.6);
      sw.intensity *= 0.96;
      if (sw.radius > sw.maxRadius || sw.intensity < 0.02) {
        shockwaves.splice(s, 1);
      }
    }

    // 3D rotation matrix coefficients
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
    const fov = 580;
    const repelRadius = 110;

    // Ambient floating oscillation
    const breath = Math.sin(timeTotal * 1.4) * 0.02;

    // ── 3. Transform & Project Particles ──
    const renderList = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Flow along path
      p.t = (p.t + p.speed * (dt / 16.6)) % (Math.PI * 2);

      // Lemniscate of Bernoulli parametric equations:
      // x = (a * sqrt(2) * cos(t)) / (sin(t)^2 + 1)
      // y = (a * sqrt(2) * cos(t) * sin(t)) / (sin(t)^2 + 1)
      const t = p.t;
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      const denom = sinT * sinT + 1;
      const factor = (scale * (1 + breath)) / denom;

      let bx = factor * cosT;
      let by = factor * cosT * sinT * 1.25; // elegant proportional height
      let bz = zDepth * sinT * cosT * 1.4;  // 3D figure-8 ribbon depth

      // Add Gaussian cross-sectional volume
      bx += p.scatterX;
      by += p.scatterY;
      bz += p.scatterZ;

      // 3D Rotation (Yaw -> Pitch -> Roll)
      const x1 = bx * cosY - bz * sinY;
      const z1 = bx * sinY + bz * cosY;

      const y2 = by * cosX - z1 * sinX;
      const z2 = by * sinX + z1 * cosX;

      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = x1 * sinZ + y2 * cosZ;

      // Perspective Projection
      const projScale = fov / (fov + z2 + 120);
      let screenX = centerX + x3 * projScale;
      let screenY = centerY + y3 * projScale;

      // Interactive Repulsion + Swirl
      if (isHovered && mouseX > -100) {
        const dx = screenX - mouseX;
        const dy = screenY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius && dist > 1) {
          const force = (1 - dist / repelRadius) * 34;
          const angle = Math.atan2(dy, dx);
          // Radial push + subtle vortex spin
          p.vx += Math.cos(angle) * force * 0.22 - Math.sin(angle) * force * 0.16;
          p.vy += Math.sin(angle) * force * 0.22 + Math.cos(angle) * force * 0.16;
        }
      }

      // Shockwave force
      shockwaves.forEach(sw => {
        const dx = screenX - sw.x;
        const dy = screenY - sw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = Math.abs(dist - sw.radius);

        if (diff < 40 && dist > 1) {
          const force = (1 - diff / 40) * sw.intensity * 28;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.35;
          p.vy += Math.sin(angle) * force * 0.35;
        }
      });

      // Spring physics returning displacement to 0
      p.vx += (0 - p.offsetX) * 0.085;
      p.vy += (0 - p.offsetY) * 0.085;
      p.vx *= 0.88;
      p.vy *= 0.88;
      p.offsetX += p.vx;
      p.offsetY += p.vy;

      screenX += p.offsetX;
      screenY += p.offsetY;

      // Twinkle & Luminance
      p.twinklePhase += p.twinkleSpeed;
      const twinkle = 0.82 + Math.sin(p.twinklePhase) * 0.18;
      const finalAlpha = Math.min(1, Math.max(0, p.alpha * twinkle * projScale));
      const finalSize = Math.max(0.4, p.baseSize * projScale);

      renderList.push({
        x: screenX,
        y: screenY,
        z: z2,
        size: finalSize,
        alpha: finalAlpha,
        color: p.color
      });
    }

    // Sort by depth for correct atmospheric rendering
    renderList.sort((a, b) => b.z - a.z);

    // ── 4. Subtle Central Ethereal Blue Glow ──
    ctx.save();
    const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 1.1);
    coreGlow.addColorStop(0, 'rgba(17, 98, 221, 0.12)');
    coreGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.05)');
    coreGlow.addColorStop(0.75, 'rgba(10, 20, 45, 0.02)');
    coreGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // ── 5. Draw Particles with Additive Stardust Glow ──
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < renderList.length; i++) {
      const pt = renderList[i];
      if (pt.alpha <= 0.015) continue;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);

      const rgb = `${pt.color.r}, ${pt.color.g}, ${pt.color.b}`;
      ctx.fillStyle = `rgba(${rgb}, ${pt.alpha.toFixed(3)})`;
      ctx.fill();

      // Soft stardust aura for bright points
      if (pt.size > 1.4 && pt.alpha > 0.5) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${(pt.alpha * 0.18).toFixed(3)})`;
        ctx.fill();
      }
    }

    ctx.restore();
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
  }, { threshold: 0.05 });

  observer.observe(section);
  animId = requestAnimationFrame(render);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    observer.disconnect();
    window.removeEventListener('resize', resize);
  };
}
