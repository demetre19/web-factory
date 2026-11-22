import {useState, type CSSProperties} from 'react';
import {PartyPopper} from 'lucide-react';

interface ParticleSpec {
  id: number;
  tx: string;
  ty: string;
  rot: string;
  color: string;
  size: number;
  delay: string;
}

const COLORS = ['#2563EB', '#0EA5E9', '#18181B', '#F59E0B', '#10B981'];

function createBurstParticles(seed: number): ParticleSpec[] {
  return Array.from({length: 18}, (_, index) => {
    const angle = (index / 18) * Math.PI * 2 + (seed % 3) * 0.15;
    const distance = 42 + ((index * 19 + seed * 7) % 44);
    const tx = `${Math.round(Math.cos(angle) * distance)}px`;
    const ty = `${Math.round(Math.sin(angle) * distance - 16)}px`;
    const rot = `${(index % 2 === 0 ? 1 : -1) * (140 + index * 22)}deg`;
    return {
      id: seed * 100 + index,
      tx,
      ty,
      rot,
      color: COLORS[index % COLORS.length],
      size: index % 3 === 0 ? 7 : 5,
      delay: `${(index % 4) * 20}ms`,
    };
  });
}

export function Fx15() {
  const [burstCount, setBurstCount] = useState(0);
  const [particles, setParticles] = useState<ParticleSpec[]>([]);

  const handleCelebrate = () => {
    const nextCount = burstCount + 1;
    setBurstCount(nextCount);
    setParticles(createBurstParticles(nextCount));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full py-3">
      <div className="relative inline-flex items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="fx-confetti-particle absolute rounded-[2px]"
              style={
                {
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  animationDelay: particle.delay,
                  '--tx': particle.tx,
                  '--ty': particle.ty,
                  '--rot': particle.rot,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleCelebrate}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <PartyPopper className="w-4 h-4" />
          Trigger Burst
        </button>
      </div>

      <span
        data-testid="fx15-count"
        className="text-xs font-mono tabular-nums text-zinc-500"
      >
        CSS bursts fired: {burstCount}
      </span>
    </div>
  );
}
