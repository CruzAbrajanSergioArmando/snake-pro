"use client";

import { useEffect, useRef, useState } from "react";

export default function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileSize = 20;
  const cols = 30;
  const rows = 20;

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Movimiento de la serpiente
  useEffect(() => {
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = {
          x: (head.x + direction.x + cols) % cols,
          y: (head.y + direction.y + rows) % rows,
        };
        return [newHead, ...prev.slice(0, -1)];
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction]);

  // Captura de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  // Captura de gestos táctiles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction.x === 0) setDirection({ x: 1, y: 0 });
        else if (dx < 0 && direction.x === 0) setDirection({ x: -1, y: 0 });
      } else {
        if (dy > 0 && direction.y === 0) setDirection({ x: 0, y: 1 });
        else if (dy < 0 && direction.y === 0) setDirection({ x: 0, y: -1 });
      }
      setTouchStart(null);
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStart, direction]);

  // Dibujar tablero
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      canvas.width = cols * tileSize;
      canvas.height = rows * tileSize;

      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.strokeStyle = "#1f1f1f";
          ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }

      ctx.fillStyle = "#00ff7f";
      ctx.shadowColor = "#00ff7f";
      ctx.shadowBlur = 10;
      snake.forEach(segment => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
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
        style={{ maxWidth: cols * tileSize, height: rows * tileSize }}
      />
    </div>
  );
}
