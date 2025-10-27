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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Captura de gestos táctiles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
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

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
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
      canvas.width = COLS * TILE_SIZE;
      canvas.height = ROWS * TILE_SIZE;

      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-2 md:p-8"
    >
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-2xl border border-neutral-800 max-w-full h-auto"
        style={{ maxWidth: COLS * TILE_SIZE, height: ROWS * TILE_SIZE }}
      />
    </div>
  );
}
