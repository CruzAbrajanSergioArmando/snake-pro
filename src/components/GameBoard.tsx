"use client";

import { useEffect, useRef, useState } from "react";

export default function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tileSize = 20;
  const cols = 30;
  const rows = 20;

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      canvas.width = cols * tileSize;
      canvas.height = rows * tileSize;

      // Dibujar fondo
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar cuadrícula
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.strokeStyle = "#1f1f1f";
          ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }

      // Dibujar la serpiente
      ctx.fillStyle = "#00ff7f";
      ctx.shadowColor = "#00ff7f";
      ctx.shadowBlur = 10;
      snake.forEach(segment => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
      });

      // Resetear sombra para evitar que afecte otros dibujos
      ctx.shadowBlur = 0;
    }
  }, [snake]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl shadow-2xl border border-neutral-800"
    />
  );
}
