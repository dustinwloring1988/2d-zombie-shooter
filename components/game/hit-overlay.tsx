"use client"

interface HitOverlayProps {
  direction: { x: number; y: number } | null
}

export function HitOverlay({ direction }: HitOverlayProps) {
  if (!direction) return null

  // Calculate angle from center to hit direction
  const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Red vignette */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,0,0,0.4) 100%)`,
          animation: "hitFlash 0.3s ease-out",
        }}
      />

      {/* Directional indicator */}
      <div
        className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      >
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-24"
          style={{
            background: `linear-gradient(to left, rgba(255,0,0,0.6), transparent)`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes hitFlash {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
