"use client";

import { useEffect, useRef } from "react";

export default function CinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.tx = (e.clientX - rect.left) / rect.width - 0.5;
      mouseRef.current.ty = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener("mousemove", onMouse);

    const cols = 44;
    const rows = 28;
    const spacing = 70;

    const particles = Array.from({ length: 22 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3,
      sp: 0.0003 + Math.random() * 0.0009,
      ph: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.45,
    }));

    const project = (x: number, y: number, z: number) => {
      const camY = 220;
      const camZ = 520;
      const focal = 620;
      const yz = y - camY;
      const zz = z + camZ;
      const sx = (x * focal) / zz;
      const sy = (yz * focal) / zz;
      return [width / 2 + sx, height * 0.52 + sy] as [number, number];
    };

    const drawMesh = (t: number) => {
      const offsetX = mouseRef.current.x * 30;
      const offsetY = mouseRef.current.y * 18;

      const pts: [number, number][][] = [];
      for (let r = 0; r <= rows; r++) {
        const row: [number, number][] = [];
        for (let c = 0; c <= cols; c++) {
          const gx = (c - cols / 2) * spacing + offsetX;
          const gz = r * spacing + 50;
          const k = c / cols;
          const j = r / rows;
          const h =
            Math.sin(k * 6 + t * 0.6) * 16 +
            Math.cos(j * 4 - t * 0.4) * 14 +
            Math.sin((k + j) * 9 + t * 0.9) * 8;
          const damp = 1 - Math.pow(j, 1.4) * 0.2;
          const gy = h * damp + offsetY * (1 - j);
          row.push(project(gx, gy, gz));
        }
        pts.push(row);
      }

      const fadeRow = (rIdx: number) => {
        const k = rIdx / rows;
        const a = Math.sin(Math.min(1, k * 1.8) * Math.PI) * 0.35;
        return Math.max(0.04, a);
      };

      for (let r = 0; r < rows; r++) {
        const aBase = fadeRow(r);
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const [x, y] = pts[r][c];
          if (c === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(14, 26, 43, ${aBase})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const [x, y] = pts[r][c];
          if (r === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(14, 26, 43, 0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      const accentCount = 5;
      for (let i = 0; i < accentCount; i++) {
        const cc = Math.floor((i * 9 + Math.floor(t * 0.4)) % (cols + 1));
        const rr = Math.floor(((i * 5) % (rows + 1)) * 0.7) + 2;
        if (!pts[rr] || !pts[rr][cc]) continue;
        const [x, y] = pts[rr][cc];
        const pulse = 0.5 + Math.sin(t * 1.8 + i) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 26);
        g.addColorStop(0, `rgba(212, 169, 95, ${0.45 * pulse})`);
        g.addColorStop(0.5, `rgba(185, 138, 62, ${0.12 * pulse})`);
        g.addColorStop(1, `rgba(185, 138, 62, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(185, 138, 62, ${0.85 * pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawParticles = (t: number) => {
      for (const p of particles) {
        p.y -= p.sp;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        const wobble = Math.sin(t * 0.6 + p.ph) * 0.01;
        const cx = (p.x + wobble + mouseRef.current.x * 0.04) * width;
        const cy = p.y * height;
        const rad = p.r * 4;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        if (p.gold) {
          g.addColorStop(0, "rgba(212, 169, 95, 0.55)");
          g.addColorStop(0.5, "rgba(185, 138, 62, 0.18)");
          g.addColorStop(1, "rgba(185, 138, 62, 0)");
        } else {
          g.addColorStop(0, "rgba(14, 26, 43, 0.35)");
          g.addColorStop(0.5, "rgba(14, 26, 43, 0.08)");
          g.addColorStop(1, "rgba(14, 26, 43, 0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawVignette = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(245, 240, 230, 1)");
      grad.addColorStop(0.18, "rgba(245, 240, 230, 0.0)");
      grad.addColorStop(0.82, "rgba(245, 240, 230, 0.0)");
      grad.addColorStop(1, "rgba(245, 240, 230, 1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createLinearGradient(0, 0, width, 0);
      grad2.addColorStop(0, "rgba(245, 240, 230, 0.9)");
      grad2.addColorStop(0.15, "rgba(245, 240, 230, 0)");
      grad2.addColorStop(0.85, "rgba(245, 240, 230, 0)");
      grad2.addColorStop(1, "rgba(245, 240, 230, 0.9)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    };

    let last = performance.now();
    const loop = (now: number) => {
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.06;
      ctx.clearRect(0, 0, width, height);
      const t = now / 1000;
      drawMesh(t);
      drawParticles(t);
      drawVignette();
      last = now;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
