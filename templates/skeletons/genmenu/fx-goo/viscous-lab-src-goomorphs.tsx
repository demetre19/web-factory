import React, { useState } from 'react';
import { getNextMorphState } from '../../utils/gooCatalog';

/**
 * Goo5: Liquid Page/Section Wave Wipe — wave edge sweeps horizontally to reveal next panel.
 */
export const Goo5: React.FC = () => {
  const [panel, setPanel] = useState<0 | 1>(0);

  return (
    <div className="relative flex h-56 w-full flex-col justify-between overflow-hidden rounded-xl border border-stone-200 bg-white select-none">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-stone-500">PANEL 01</span>
          <button
            type="button"
            onClick={() => setPanel(1)}
            className="rounded-lg bg-[#141413] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
          >
            Wave Wipe
          </button>
        </div>
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-[#141413]">Surface Tension</p>
          <p className="mt-1 text-xs text-stone-500">Light editorial canvas before liquid sweep.</p>
        </div>
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-between bg-[#1D4ED8] p-4 text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: panel === 1 ? 'translateX(0%)' : 'translateX(118%)',
        }}
        aria-hidden={panel !== 1}
      >
        <svg
          viewBox="0 0 36 220"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-0 -left-8 h-full w-9"
          aria-hidden="true"
        >
          <path
            d="M36 0 L18 0 C 2 35, 34 70, 14 110 C -4 148, 32 184, 16 220 L36 220 Z"
            fill="#1D4ED8"
          />
        </svg>

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-blue-100">PANEL 02</span>
          <button
            type="button"
            tabIndex={panel === 1 ? 0 : -1}
            onClick={() => setPanel(0)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#1D4ED8] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap"
          >
            Wipe Back
          </button>
        </div>
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">Submerged State</p>
          <p className="mt-1 text-xs text-blue-100">Revealed seamlessly behind curved liquid crest.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Goo7: Organic Border-Radius Morph — 8-point asymmetric border-radius animation.
 */
type BlobPace = 'calm' | 'pulse' | 'turbulent';

export const Goo7: React.FC = () => {
  const [pace, setPace] = useState<BlobPace>('calm');

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <div className="flex w-full items-center justify-center gap-1 rounded-lg bg-stone-200/80 p-1">
        {(['calm', 'pulse', 'turbulent'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPace(mode)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
              pace === mode ? 'bg-white text-[#141413] shadow-xs' : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="flex h-28 w-full items-center justify-center">
        <div
          className={`flex h-24 w-28 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-medium text-white shadow-sm transition-all ${
            pace === 'calm'
              ? 'animate-[blobMorphCalm_6.5s_ease-in-out_infinite]'
              : pace === 'pulse'
                ? 'scale-110 animate-[blobMorphCalm_2.6s_ease-in-out_infinite]'
                : 'animate-[blobMorphTurbulent_2.4s_ease-in-out_infinite]'
          }`}
        >
          <span className="font-mono text-[11px] opacity-90">{pace}</span>
        </div>
      </div>

      <p className="text-xs text-stone-500">8-axis CSS border-radius organic morphing</p>
    </div>
  );
};

/**
 * Goo10: Clip-Path Icon↔Icon Morph — single polygon element morphing across 4 UI icons.
 */
type IconShape = 'play' | 'pause' | 'stop' | 'check';

const ICON_SEQUENCE: readonly IconShape[] = ['play', 'pause', 'stop', 'check'];

const ICON_POLYGONS: Record<IconShape, string> = {
  play: 'polygon(22% 14%, 54% 32%, 86% 50%, 86% 50%, 54% 68%, 22% 86%, 22% 50%, 22% 14%)',
  pause: 'polygon(18% 16%, 42% 16%, 42% 84%, 58% 84%, 58% 16%, 82% 16%, 82% 84%, 18% 84%)',
  stop: 'polygon(20% 20%, 50% 20%, 80% 20%, 80% 50%, 80% 80%, 50% 80%, 20% 80%, 20% 50%)',
  check: 'polygon(14% 52%, 26% 40%, 42% 58%, 76% 22%, 88% 34%, 42% 82%, 28% 67%, 14% 52%)',
};

export const Goo10: React.FC = () => {
  const [shape, setShape] = useState<IconShape>('play');

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-mono text-stone-500 uppercase">{shape}</span>
        <span className="text-xs text-stone-500">8-vertex polygon</span>
      </div>

      <button
        type="button"
        onClick={() => setShape((s) => getNextMorphState(s, ICON_SEQUENCE))}
        aria-label={`Morph icon, currently ${shape}`}
        className="group flex h-24 w-24 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-xs transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <div
          className="h-12 w-12 bg-[#141413] transition-[clip-path,background-color] duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-hover:bg-blue-600"
          style={{ clipPath: ICON_POLYGONS[shape] }}
        />
      </button>

      <div className="flex items-center gap-1.5">
        {ICON_SEQUENCE.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setShape(item)}
            className={`rounded px-2 py-0.5 text-xs font-medium capitalize transition-colors ${
              shape === item ? 'bg-[#141413] text-white' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Goo20: Liquid Corner Peel Drawer — circular clip-path peel reveal.
 */
export const Goo20: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-56 w-full flex-col justify-between overflow-hidden rounded-xl border border-stone-200 bg-[#F4F4F0] p-4 select-none">
      <div className="z-10 flex w-full items-center justify-between">
        <span className="text-xs font-mono text-stone-500">CLIP-PATH REVEAL</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-lg bg-[#141413] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          {open ? 'Seal Drawer' : 'Peel Open'}
        </button>
      </div>

      <div className="flex flex-col items-start">
        <p className="font-display text-base font-semibold text-[#141413]">Sealed Surface</p>
        <p className="text-xs text-stone-500">Click Peel Open to expand liquid corner mask.</p>
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-emerald-700 p-4 text-white transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          clipPath: open ? 'circle(145% at 14% 88%)' : 'circle(0% at 14% 88%)',
        }}
        aria-hidden={!open}
      >
        <p className="font-display text-lg font-semibold">Liquid Drawer Revealed</p>
        <p className="mt-1 text-xs text-emerald-100">
          Expanded radially from corner anchor with smooth easing.
        </p>
      </div>
    </div>
  );
};
