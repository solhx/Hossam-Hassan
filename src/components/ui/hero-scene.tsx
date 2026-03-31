// ✅ FIXED — src/components/ui/hero-scene.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn, prefersReducedMotion } from '@/utils/utils';

export function HeroScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const container = containerRef.current;
    if (!container) return;

    // ✅ Skip Three.js on mobile — too heavy, battery drain
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // ✅ Disable antialias — big perf win, barely visible
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // ✅ Cap at 1.5 instead of 2 — saves ~44% GPU fill rate on retina
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // ✅ Reduce particle count on lower-end devices
    const count = navigator.hardwareConcurrency <= 4 ? 250 : 500;
    const geo = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color('#10b981'),
      new THREE.Color('#059669'),
      new THREE.Color('#34d399'),
      new THREE.Color('#6ee7b7'),
      new THREE.Color('#a3a3a3'),
      new THREE.Color('#d4d4d4'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r     = 15 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      const c     = palette[Math.floor(Math.random() * palette.length)];
      col[i3]     = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
      sizes[i]    = 0.5 + Math.random() * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec3 p = position;
          p.x += sin(uTime * 0.3 + position.y * 0.1) * 0.5;
          p.y += cos(uTime * 0.2 + position.x * 0.1) * 0.5;
          p.z += sin(uTime * 0.25 + position.z * 0.1) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * uPixelRatio * (80.0 / -mv.z);
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.3, 0.5, d);
          gl_FragColor = vec4(vColor, a * 0.4);
        }`,
      transparent:  true,
      vertexColors: true,
      depthWrite:   false,
      blending:     THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ✅ Reduce torus geometry segments — 100,16 → 60,12 saves ~40% vertices
    const tGeo = new THREE.TorusKnotGeometry(6, 2, 60, 12);
    const tMat = new THREE.MeshBasicMaterial({
      color:       0x10b981,
      wireframe:   true,
      transparent: true,
      opacity:     0.04,
    });
    const torus = new THREE.Mesh(tGeo, tMat);
    scene.add(torus);

    const mouse = { x: 0, y: 0 };

    // ✅ Use RAF throttle for mouse — not every mousemove event
    let mousePending = false;
    const onMouse = (e: MouseEvent) => {
      if (mousePending) return;
      mousePending = true;
      requestAnimationFrame(() => {
        mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        mousePending = false;
      });
    };

    // ✅ ResizeObserver instead of window resize — more accurate
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    window.addEventListener('mousemove', onMouse, { passive: true });

    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      particles.rotation.y = t * 0.05 + mouse.x * 0.3;
      particles.rotation.x = mouse.y * 0.2;

      torus.rotation.x = t * 0.15;
      torus.rotation.y = t * 0.1;
      torus.rotation.z = t * 0.05;

      // ✅ Smooth lerp factor — same as before
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouse);
      resizeObserver.disconnect(); // ✅ Disconnect observer

      // ✅ Full GPU memory cleanup
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      tGeo.dispose();
      tMat.dispose();

      // ✅ Force WebGL context loss to free VRAM immediately
      const gl = renderer.getContext();
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 w-full h-full', className)}
      aria-hidden="true"
    />
  );
}