import { useMemo } from "react";

interface ConfettiPieceProps {
  color: string;
  delay: number;
  left: string;
}

function ConfettiPiece({ color, delay, left }: ConfettiPieceProps) {
  return (
    <div
      className="absolute top-0 w-2 h-2 animate-confetti"
      style={{
        backgroundColor: color,
        left,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function PaymentConfetti({ isPaid = false }: { isPaid: boolean }) {
  const confettiPieces = useMemo(() => {
    const colors = ["#FF7A45", "#4CAF50", "#E91E63", "#FFC107", "#2196F3"];
    return Array.from({ length: 50 }).map((_, i) => ({
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
      left: `${Math.random() * 100}%`,
    }));
  }, []);

  if (!isPaid) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece, i) => (
        <ConfettiPiece key={i} {...piece} />
      ))}
    </div>
  );
}
