"use client";

import { useEffect, useRef, useState } from "react";
import { TILE_SIZE, COLS, ROWS, INITIAL_SNAKE, MOVE_INTERVAL } from "../game/constants";

export default function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [snake, setSnake] = useState(INITIAL_SNAKE);

  // Refs para evitar re-renders
  const directionRef = useRef({ x: 1, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // rAF timing refs
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);

  // helper: resize canvas for HiDPI screens
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // CSS size in layout pixels
    const cssWidth = COLS * TILE_SIZE;
    const cssHeight = ROWS * TILE_SIZE;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // Actual pixel size
    canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
    canvas.height = Math.max(1, Math.floor(cssHeight * dpr));

    if (ctx) {
      // Reset transform and scale to DPR so drawing coordinates use CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  // Movimiento: requestAnimationFrame con acumulador para respetar MOVE_INTERVAL
  useEffect(() => {
    let rafId = 0;

    const step = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      accumulatorRef.current += dt;

      while (accumulatorRef.current >= MOVE_INTERVAL) {
        setSnake(prev => {
          if (!prev || prev.length === 0) return prev;
          const head = prev[0];
          const dir = directionRef.current;
          const newHead = {
            x: (head.x + dir.x + COLS) % COLS,
            y: (head.y + dir.y + ROWS) % ROWS,
          };
          return [newHead, ...prev.slice(0, -1)];
        });
        accumulatorRef.current -= MOVE_INTERVAL;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Captura de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = directionRef.current;

      // Arrow keys: prevent default (avoid scrolling)
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        switch (e.key) {
          case "ArrowUp":
            if (dir.y === 0) directionRef.current = { x: 0, y: -1 };
            break;
          case "ArrowDown":
            if (dir.y === 0) directionRef.current = { x: 0, y: 1 };
            break;
          case "ArrowLeft":
            if (dir.x === 0) directionRef.current = { x: -1, y: 0 };
            break;
          case "ArrowRight":
            if (dir.x === 0) directionRef.current = { x: 1, y: 0 };
            break;
        }
        return;
      }

      // Support WASD (and uppercase)
      const key = e.key.toLowerCase();
      switch (key) {
        case "w":
          if (dir.y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case "s":
          if (dir.y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case "a":
          if (dir.x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case "d":
          if (dir.x === 0) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Captura de gestos táctiles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // prevent default to avoid scrolling while playing
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const start = touchStartRef.current;
      if (!start) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const dir = directionRef.current;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir.x === 0) directionRef.current = { x: 1, y: 0 };
        else if (dx < 0 && dir.x === 0) directionRef.current = { x: -1, y: 0 };
      } else {
        if (dy > 0 && dir.y === 0) directionRef.current = { x: 0, y: 1 };
        else if (dy < 0 && dir.y === 0) directionRef.current = { x: 0, y: -1 };
      }
      touchStartRef.current = null;
    };

    // Use passive: false to allow preventDefault
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Dibujar tablero
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      // Ensure canvas is properly sized for current DPR
      resizeCanvas();

      // Drawing uses CSS pixel coordinates thanks to ctx.setTransform in resizeCanvas
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);

      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          ctx.strokeStyle = "#1f1f1f";
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      ctx.fillStyle = "#00ff7f";
      ctx.shadowColor = "#00ff7f";
      ctx.shadowBlur = 10;
      snake.forEach(segment => {
        ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      });
      ctx.shadowBlur = 0;
    }
  }, [snake]);

  // Resize handler: update canvas on window resize
  useEffect(() => {
    resizeCanvas();
    const onResize = () => {
      // reset rAF timing to avoid a large dt spike
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // focus container for keyboard input and prevent touch scrolling via inline style
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="w-full h-full flex items-center justify-center p-2 md:p-8"
      style={{ touchAction: "none", WebkitUserSelect: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-2xl border border-neutral-800 max-w-full h-auto"
        style={{ maxWidth: COLS * TILE_SIZE, height: ROWS * TILE_SIZE }}
      />
    </div>
  );
}
