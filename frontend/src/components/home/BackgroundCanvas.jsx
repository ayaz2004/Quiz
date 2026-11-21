import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const LINK_DISTANCE = 150;

const createParticle = (width, height) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 8 + 4,
  speedX: Math.random() * 0.5 - 0.25,
  speedY: Math.random() * 0.5 - 0.25,
  opacity: Math.random() * 0.5 + 0.2,
  rotation: Math.random() * Math.PI * 2,
  rotationSpeed: (Math.random() - 0.5) * 0.02,
  // circle, square, triangle, diamond, hexagon
  shape: Math.floor(Math.random() * 5),
});

const stepParticle = (p, width, height) => {
  p.x += p.speedX;
  p.y += p.speedY;
  p.rotation += p.rotationSpeed;
  if (p.x > width) p.x = 0;
  if (p.x < 0) p.x = width;
  if (p.y > height) p.y = 0;
  if (p.y < 0) p.y = height;
};

const drawParticle = (ctx, p, rgb) => {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = `rgba(${rgb}, ${p.opacity})`;
  ctx.beginPath();

  switch (p.shape) {
    case 0:
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      break;
    case 1:
      ctx.rect(-p.size, -p.size, p.size * 2, p.size * 2);
      break;
    case 2:
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size, p.size);
      ctx.lineTo(-p.size, p.size);
      ctx.closePath();
      break;
    case 3:
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size, 0);
      ctx.closePath();
      break;
    default:
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = p.size * Math.cos(angle);
        const y = p.size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
  }

  ctx.fill();
  ctx.restore();
};

const drawLinks = (ctx, particles, rgb) => {
  ctx.lineWidth = 1.5;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < LINK_DISTANCE) {
        ctx.strokeStyle = `rgba(${rgb}, ${0.2 * (1 - distance / LINK_DISTANCE)})`;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
};

/**
 * Animated particle background.
 * - fewer particles on phones
 * - pauses while the tab is hidden
 * - with prefers-reduced-motion it draws a single still frame
 */
const BackgroundCanvas = ({ isDark }) => {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const rgb = isDark ? '59, 130, 246' : '16, 185, 129';
    let frameId = null;
    let particles = [];

    const targetCount = () => (window.innerWidth < 640 ? 22 : window.innerWidth < 1024 ? 40 : 60);

    const renderFrame = (advance) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        if (advance) stepParticle(p, canvas.width, canvas.height);
        drawParticle(ctx, p, rgb);
      });
      drawLinks(ctx, particles, rgb);
    };

    const loop = () => {
      renderFrame(true);
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || frameId !== null) return;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = targetCount();
      if (particles.length > count) particles = particles.slice(0, count);
      while (particles.length < count) particles.push(createParticle(canvas.width, canvas.height));
      if (reduceMotion) renderFrame(false);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isDark, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
};

export default BackgroundCanvas;
