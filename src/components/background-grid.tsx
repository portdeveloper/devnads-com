"use client";

import { useEffect, useRef, useState } from "react";

const CELL_SIZE = 240;
const PARTICLE_COUNT = 18;
const GLOW_PATH_COUNT = 5;
const MAX_INTERSECTIONS = 4;

const LIGHTNING_MIN_INTERVAL = 8000;
const LIGHTNING_MAX_INTERVAL = 20000;
const LIGHTNING_FLASH_IN = 150;
const LIGHTNING_SUSTAIN_MIN = 400;
const LIGHTNING_SUSTAIN_MAX = 800;
const LIGHTNING_FADE_MIN = 1500;
const LIGHTNING_FADE_MAX = 3000;
const LIGHTNING_BRANCH_COUNT_MIN = 3;
const LIGHTNING_BRANCH_COUNT_MAX = 5;
const LIGHTNING_MIN_SEGMENT = 2;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

interface GlowPath {
  points: [number, number][];
  direction: number;
  progress: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface LightningBolt {
  trunk: [number, number][];
  branches: [number, number][][];
  startTime: number;
  totalDuration: number;
  sustainEnd: number;
  fadeStart: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function generateBoltPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displacement: number,
  minSeg: number
): [number, number][] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < minSeg * 2) return [[x1, y1], [x2, y2]];
  const px = -dy / len;
  const py = dx / len;
  const midX = (x1 + x2) / 2 + px * (Math.random() - 0.5) * displacement;
  const midY = (y1 + y2) / 2 + py * (Math.random() - 0.5) * displacement;
  const half = displacement * 0.5;
  if (half < 1) return [[x1, y1], [midX, midY], [x2, y2]];
  const left = generateBoltPath(x1, y1, midX, midY, half, minSeg);
  const right = generateBoltPath(midX, midY, x2, y2, half, minSeg);
  return [...left, ...right.slice(1)];
}

function generateBranches(
  trunk: [number, number][],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): [number, number][][] {
  const count = Math.floor(
    randomBetween(LIGHTNING_BRANCH_COUNT_MIN, LIGHTNING_BRANCH_COUNT_MAX + 1)
  );
  const branches: [number, number][][] = [];
  const trunkLen = trunk.length;
  for (let i = 0; i < count; i++) {
    const t = randomBetween(0.2, 0.8);
    const idx = Math.floor(t * (trunkLen - 1));
    const forkPt = trunk[idx];
    const nextIdx = Math.min(idx + 1, trunkLen - 1);
    const tdx = trunk[nextIdx][0] - forkPt[0];
    const tdy = trunk[nextIdx][1] - forkPt[1];
    const tLen = Math.sqrt(tdx * tdx + tdy * tdy);
    if (tLen === 0) continue;
    const angle = (i % 2 === 0 ? 1 : -1) * randomBetween(0.4, 0.6);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dirX = (tdx * cos - tdy * sin) / tLen;
    const dirY = (tdx * sin + tdy * cos) / tLen;
    const mainLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const branchLen = mainLen * (1 - t) * randomBetween(0.3, 0.6);
    const endX = forkPt[0] + dirX * branchLen;
    const endY = forkPt[1] + dirY * branchLen;
    const path = generateBoltPath(
      forkPt[0],
      forkPt[1],
      endX,
      endY,
      branchLen * 0.2,
      LIGHTNING_MIN_SEGMENT
    );
    branches.push(path);
  }
  return branches;
}

function createLightningBolt(
  w: number,
  h: number,
  now: number
): LightningBolt {
  const x1 = randomBetween(w * 0.1, w * 0.9);
  const y1 = randomBetween(-10, h * 0.05);
  const x2 = x1 + randomBetween(-w * 0.3, w * 0.3);
  const y2 = randomBetween(h * 0.85, h + 10);
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const displacement = dist * 0.25;
  const trunk = generateBoltPath(
    x1,
    y1,
    x2,
    y2,
    displacement,
    LIGHTNING_MIN_SEGMENT
  );
  const branches = generateBranches(trunk, x1, y1, x2, y2);
  const sustain = randomBetween(LIGHTNING_SUSTAIN_MIN, LIGHTNING_SUSTAIN_MAX);
  const fade = randomBetween(LIGHTNING_FADE_MIN, LIGHTNING_FADE_MAX);
  return {
    trunk,
    branches,
    startTime: now,
    totalDuration: LIGHTNING_FLASH_IN + sustain + fade,
    sustainEnd: LIGHTNING_FLASH_IN + sustain,
    fadeStart: LIGHTNING_FLASH_IN + sustain,
    x1,
    y1,
    x2,
    y2,
  };
}

const BOLT_LAYERS: [number, string, number][] = [
  [20, "rgba(100,180,255,", 0.02],
  [12, "rgba(140,200,255,", 0.04],
  [6, "rgba(180,220,255,", 0.08],
  [3, "rgba(200,230,255,", 0.2],
  [1, "rgba(230,240,255,", 0.4],
];

function drawBoltPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  alpha: number
) {
  if (points.length < 2) return;
  const prevOp = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [width, colorBase, layerAlpha] of BOLT_LAYERS) {
    const a = layerAlpha * alpha;
    if (a < 0.001) continue;
    ctx.strokeStyle = colorBase + a + ")";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = prevOp;
}

function drawLightning(
  ctx: CanvasRenderingContext2D,
  bolt: LightningBolt,
  now: number,
  w: number,
  h: number
) {
  const elapsed = now - bolt.startTime;
  let alpha: number;
  if (elapsed < LIGHTNING_FLASH_IN) {
    alpha = elapsed / LIGHTNING_FLASH_IN;
  } else if (elapsed < bolt.sustainEnd) {
    alpha = 1.0;
  } else {
    alpha =
      1.0 - (elapsed - bolt.fadeStart) / (bolt.totalDuration - bolt.fadeStart);
  }
  alpha = Math.max(0, Math.min(1, alpha));
  if (elapsed < LIGHTNING_FLASH_IN + 30) {
    const flashAlpha = 0.025 * alpha;
    ctx.fillStyle = `rgba(180,200,255,${flashAlpha})`;
    ctx.fillRect(0, 0, w, h);
  }
  drawBoltPath(ctx, bolt.trunk, alpha);
  for (const branch of bolt.branches) {
    drawBoltPath(ctx, branch, alpha * 0.6);
  }
}

function createGlowPath(w: number, h: number): GlowPath {
  const cols = Math.ceil(w / CELL_SIZE) + 1;
  const rows = Math.ceil(h / CELL_SIZE) + 1;
  return {
    points: [
      [
        Math.floor(Math.random() * cols) * CELL_SIZE,
        Math.floor(Math.random() * rows) * CELL_SIZE,
      ],
    ],
    direction: Math.floor(Math.random() * 4),
    progress: 0,
    speed: randomBetween(1, 2),
    opacity: randomBetween(0.06, 0.15),
  };
}

function createParticles(w: number, h: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: randomBetween(-0.15, 0.15),
    vy: randomBetween(-0.15, 0.15),
    radius: randomBetween(1, 2.5),
    opacity: randomBetween(0.1, 0.3),
  }));
}

export function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[];
    let glowPaths: GlowPath[];
    let w: number;
    let h: number;
    let activeBolt: LightningBolt | null = null;
    let nextStrikeTime =
      performance.now() +
      randomBetween(LIGHTNING_MIN_INTERVAL, LIGHTNING_MAX_INTERVAL);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(w, h);
      glowPaths = Array.from({ length: GLOW_PATH_COUNT }, () =>
        createGlowPath(w, h)
      );
    }

    resize();
    window.addEventListener("resize", resize);

    function drawStaticGrid() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.strokeStyle = "hsla(0, 0%, 100%, 0.04)";
      ctx!.lineWidth = 1;
      ctx!.lineCap = "butt";
      for (let x = 0; x <= w; x += CELL_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y <= h; y += CELL_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }
    }

    function draw() {
      if (prefersReducedMotion.current) {
        drawStaticGrid();
        return;
      }

      ctx!.clearRect(0, 0, w, h);

      ctx!.strokeStyle = "hsla(0, 0%, 100%, 0.04)";
      ctx!.lineWidth = 1;
      ctx!.lineCap = "butt";
      for (let x = 0; x <= w; x += CELL_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y <= h; y += CELL_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      for (const gp of glowPaths) {
        gp.progress += gp.speed;
        if (gp.progress >= CELL_SIZE) {
          const last = gp.points[gp.points.length - 1];
          const nx = last[0] + DX[gp.direction] * CELL_SIZE;
          const ny = last[1] + DY[gp.direction] * CELL_SIZE;
          gp.points.push([nx, ny]);
          gp.progress -= CELL_SIZE;
          const rev = (gp.direction + 2) % 4;
          const opts = [0, 1, 2, 3].filter((d) => d !== rev);
          gp.direction = opts[Math.floor(Math.random() * opts.length)];
          while (gp.points.length > MAX_INTERSECTIONS) gp.points.shift();
          if (
            nx < -CELL_SIZE * 2 ||
            nx > w + CELL_SIZE * 2 ||
            ny < -CELL_SIZE * 2 ||
            ny > h + CELL_SIZE * 2
          ) {
            Object.assign(gp, createGlowPath(w, h));
            continue;
          }
        }
        const last = gp.points[gp.points.length - 1];
        const headX = last[0] + DX[gp.direction] * gp.progress;
        const headY = last[1] + DY[gp.direction] * gp.progress;
        const pts: [number, number][] = [...gp.points, [headX, headY]];
        let totalLen = 0;
        for (let i = 1; i < pts.length; i++) {
          totalLen +=
            Math.abs(pts[i][0] - pts[i - 1][0]) +
            Math.abs(pts[i][1] - pts[i - 1][1]);
        }
        if (totalLen === 0) continue;
        const layers: [number, number][] = [
          [6, 0.3],
          [1.5, 1],
        ];
        for (const [lw, om] of layers) {
          let acc = 0;
          for (let i = 1; i < pts.length; i++) {
            const [x1, y1] = pts[i - 1];
            const [x2, y2] = pts[i];
            const segLen = Math.abs(x2 - x1) + Math.abs(y2 - y1);
            if (segLen === 0) continue;
            const t1 = acc / totalLen;
            const t2 = (acc + segLen) / totalLen;
            const grad = ctx!.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(
              0,
              `hsla(210, 80%, 55%, ${t1 * gp.opacity * om})`
            );
            grad.addColorStop(
              1,
              `hsla(210, 80%, 55%, ${t2 * gp.opacity * om})`
            );
            ctx!.beginPath();
            ctx!.moveTo(x1, y1);
            ctx!.lineTo(x2, y2);
            ctx!.strokeStyle = grad;
            ctx!.lineWidth = lw;
            ctx!.lineCap = "round";
            ctx!.stroke();
            acc += segLen;
          }
        }
        ctx!.beginPath();
        ctx!.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(210, 80%, 65%, ${gp.opacity * 0.8})`;
        ctx!.fill();
      }

      const now = performance.now();
      if (!activeBolt && now >= nextStrikeTime) {
        activeBolt = createLightningBolt(w, h, now);
      }
      if (activeBolt) {
        const elapsed = now - activeBolt.startTime;
        if (elapsed >= activeBolt.totalDuration) {
          activeBolt = null;
          nextStrikeTime =
            now +
            randomBetween(LIGHTNING_MIN_INTERVAL, LIGHTNING_MAX_INTERVAL);
        } else {
          drawLightning(ctx!, activeBolt, now, w, h);
        }
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(210, 60%, 60%, ${p.opacity})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (!prefersReducedMotion.current) {
        draw();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
