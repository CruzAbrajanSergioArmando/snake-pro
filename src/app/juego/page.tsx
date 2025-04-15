// src/app/juego/page.tsx

import GameBoard from "@/components/GameBoard";

export default function JuegoPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-neutral-950">
      <GameBoard />
    </main>
  );
}