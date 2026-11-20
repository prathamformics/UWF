/**
 * UnlimitedWF — Interactive Liquid Glass Shader for CTA Section
 * High-performance WebGL chromatic dispersion & liquid wave refraction engine
 */

export function initLiquidGlassCta() {
  const canvas = document.getElementById('ctaGlassCanvas');
  const container = document.getElementById('ctaGlassShell');
  if (!canvas || !container) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    console.warn('WebGL not supported for CTA liquid glass canvas.');
    return;
  }

  // Vertex Shader: full-screen quad
  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Liquid Glass Refraction & Chromatic Dispersion
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_hover;

    // Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,
                          0.366025403784439,
                         -0.577350269189626,
                          0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 p = (uv - 0.5) * aspect;
      vec2 m = (u_mouse - 0.5) * aspect;

      float d = length(p - m);
      float wave = sin(d * 16.0 - u_time * 2.4) * exp(-d * 3.2);

      // Multi-frequency organic liquid distortion
      float n1 = snoise(p * 2.4 + vec2(u_time * 0.12, u_time * 0.08));
      float n2 = snoise(p * 4.6 - vec2(u_time * 0.16, -u_time * 0.12));
      float n = n1 * 0.65 + n2 * 0.35;

      vec2 distortion = vec2(n1, n2) * 0.05 + (p - m) * wave * 0.06 * (0.3 + u_hover * 0.7);

      // Chromatic dispersion (splitting R, G, B refraction coords)
      float r = snoise((p + distortion * 1.15) * 2.8 + u_time * 0.1);
      float g = snoise((p + distortion * 1.00) * 2.8 + u_time * 0.1);
      float b = snoise((p + distortion * 0.85) * 2.8 + u_time * 0.1);

      // UnlimitedWF Brand Electric Blue Palette (Vibrant royal blue & cyan caustics)
      vec3 colorDark = vec3(0.04, 0.24, 0.68);     // Deep electric blue #0a3dae
      vec3 colorBlue = vec3(0.066, 0.384, 0.867);  // UnlimitedWF Brand Blue #1162dd
      vec3 colorElectric = vec3(0.18, 0.52, 1.0);  // High-saturation azure #2e85ff
      vec3 colorCyan = vec3(0.35, 0.82, 1.0);      // Cyan glass highlight #59d1ff
      vec3 colorWhite = vec3(1.0, 1.0, 1.0);

      // Specular highlights & refractive caustics
      float specular = pow(max(0.0, 1.0 - length(p - m) * 2.2), 3.0) * (0.35 + u_hover * 0.65);
      float caustic = pow(abs(wave), 2.2) * 1.5;

      vec3 col = mix(colorDark, colorBlue, uv.x * 0.8 + 0.2);
      col = mix(col, colorElectric, (r * 0.5 + 0.5) * 0.5);
      col += colorCyan * (g * 0.5 + 0.5) * 0.35;
      col += colorWhite * (specular * 0.7 + caustic * 0.45);

      gl_FragColor = vec4(col, 0.95);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Position buffer for full-screen quad
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uHover = gl.getUniformLocation(program, 'u_hover');

  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;
  let hoverAmount = 0;
  let targetHover = 0;
  let isVisible = false;

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    targetMouseX = (e.clientX - rect.left) / rect.width;
    targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height; // invert for WebGL Y
  }, { passive: true });

  container.addEventListener('pointerenter', () => {
    targetHover = 1.0;
  });

  container.addEventListener('pointerleave', () => {
    targetHover = 0.0;
    targetMouseX = 0.5;
    targetMouseY = 0.5;
  });

  // Only render when in viewport for optimal 60fps performance
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  let startTime = performance.now();

  function render(now) {
    requestAnimationFrame(render);
    if (!isVisible) return;

    const elapsed = (now - startTime) * 0.001;

    // Smooth physics lerp
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;
    hoverAmount += (targetHover - hoverAmount) * 0.06;

    gl.useProgram(program);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform1f(uTime, elapsed);
    gl.uniform1f(uHover, hoverAmount);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  requestAnimationFrame(render);
}
