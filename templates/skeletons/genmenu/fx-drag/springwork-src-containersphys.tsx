import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCw,
  X,
} from 'lucide-react';
import {
  computeInertiaTargetIndex,
  rubberBandOffset,
} from '../../utils/physicsMath';

/**
 * Phys3: Bounce-In Modals
 * Triggered dialog enters with scale-from-0.82 cubic-bezier overshoot and backdrop fade.
 */
export function Phys3() {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <button
        type="button"
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={() => setOpen(true)}
        style={{
          transform: pressed ? 'scale(0.93)' : 'scale(1)',
          transition: 'transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="min-h-11 px-5 py-2.5 rounded-lg bg-[#141413] text-white text-sm font-medium hover:bg-[#272725] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
      >
        Open Bounce Modal
      </button>

      <p className="text-xs text-[#6B6B66]">
        Launches overlay with overshoot scale
      </p>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="phys3-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="animate-phys-modal w-full max-w-md rounded-2xl bg-white border border-[#E4E4E0] p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#6B6B66]">
                  Phys3 · Bounce-In Modal
                </p>
                <h3
                  id="phys3-modal-title"
                  className="text-lg font-semibold text-[#141413] mt-1"
                >
                  Overshoot Dialog Entrance
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#575753] hover:bg-[#F6F6F4] hover:text-[#141413] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#575753] leading-relaxed mt-3">
              This modal scales in from{' '}
              <code className="font-mono text-xs text-[#141413]">0.82</code> to{' '}
              <code className="font-mono text-xs text-[#141413]">1.03</code>{' '}
              using{' '}
              <code className="font-mono text-xs text-[#1D4ED8]">
                cubic-bezier(0.34, 1.56, 0.64, 1)
              </code>{' '}
              before settling cleanly at{' '}
              <code className="font-mono text-xs text-[#141413]">1.0</code>.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-10 px-4 py-2 rounded-lg border border-[#E4E4E0] text-sm font-medium text-[#141413] hover:bg-[#F6F6F4] cursor-pointer whitespace-nowrap shrink-0"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-10 px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-sm font-medium hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap shrink-0"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Phys10: Bounce Notifications
 * Self-contained toast stack with overshoot entrance and crisp dismiss.
 */
interface ToastItem {
  id: number;
  kind: 'success' | 'warning' | 'info';
  text: string;
}

export function Phys10() {
  const [toasts, setToasts] = useState<ToastItem[]>([
    { id: 1, kind: 'info', text: 'Spring curve calibrated' },
  ]);
  const nextIdRef = useRef(2);

  const pushToast = (kind: ToastItem['kind']) => {
    const id = nextIdRef.current++;
    const labelMap: Record<ToastItem['kind'], string> = {
      success: 'Checkpoint saved cleanly',
      warning: 'High damping threshold',
      info: 'New frame impulse queued',
    };
    setToasts((prev) =>
      [{ id, kind, text: labelMap[kind] }, ...prev].slice(0, 2)
    );
  };

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col justify-between gap-3 w-full">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => pushToast('success')}
          className="min-h-10 px-3 py-1.5 rounded-lg bg-[#141413] text-white text-xs font-medium hover:bg-[#272725] cursor-pointer whitespace-nowrap shrink-0"
        >
          Push Success
        </button>
        <button
          type="button"
          onClick={() => pushToast('warning')}
          className="min-h-10 px-3 py-1.5 rounded-lg border border-[#D4D4CE] bg-white text-[#141413] text-xs font-medium hover:bg-[#F6F6F4] cursor-pointer whitespace-nowrap shrink-0"
        >
          Push Alert
        </button>
      </div>

      <div className="min-h-[88px] flex flex-col gap-2 justify-start">
        {toasts.length === 0 ? (
          <p className="text-xs text-[#6B6B66] text-center py-6">
            Queue empty — trigger a bounce toast above
          </p>
        ) : (
          toasts.map((toast) => (
            <div
              key={toast.id}
              className="animate-phys-toast flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#F6F6F4] border border-[#E4E4E0] text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {toast.kind === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                )}
                {toast.kind === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                )}
                {toast.kind === 'info' && (
                  <Info className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                )}
                <span className="text-[#141413] font-medium truncate">
                  {toast.text}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${toast.text}`}
                onClick={() => dismiss(toast.id)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#6B6B66] hover:text-[#141413] hover:bg-[#E4E4E0]/60 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Phys12: Rubber-Band Scroll Edges
 * Bounded viewport where dragging past top or bottom edge applies asymptotic tension
 * and snaps back with an elastic curve on release.
 */
export function Phys12() {
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startYRef.current === null) return;
    const rawDelta = e.clientY - startYRef.current;
    setPullY(rubberBandOffset(rawDelta, 140, 0.55));
  };

  const handleRelease = () => {
    setIsDragging(false);
    startYRef.current = null;
    setPullY(0);
  };

  const triggerBoundaryPulse = (direction: 'top' | 'bottom') => {
    setIsDragging(true);
    setPullY(direction === 'top' ? 34 : -34);
    window.setTimeout(() => {
      setIsDragging(false);
      setPullY(0);
    }, 110);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        className="relative h-32 rounded-xl bg-[#F6F6F4] border border-[#E4E4E0] overflow-hidden touch-none select-none cursor-ns-resize"
      >
        <div
          style={{
            transform: `translateY(${pullY}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 480ms cubic-bezier(0.22, 1.4, 0.36, 1)',
          }}
          className="p-3 space-y-2"
        >
          {[
            '01. Top Boundary Anchor',
            '02. Viscous Scroll Channel',
            '03. Bottom Edge Bumper',
          ].map((row) => (
            <div
              key={row}
              className="px-3 py-2 rounded-lg bg-white border border-[#E4E4E0] text-xs text-[#141413] flex items-center justify-between"
            >
              <span>{row}</span>
              <span className="font-mono text-[#6B6B66] tabular-nums">
                {pullY === 0
                  ? '0px'
                  : `${pullY > 0 ? '+' : ''}${pullY.toFixed(0)}px`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => triggerBoundaryPulse('top')}
          className="min-h-9 px-3 py-1 rounded-lg border border-[#E4E4E0] bg-white text-xs font-medium text-[#141413] hover:bg-[#F6F6F4] cursor-pointer whitespace-nowrap shrink-0"
        >
          Snap Top
        </button>
        <span className="text-[11px] text-[#6B6B66]">
          Drag surface vertically
        </span>
        <button
          type="button"
          onClick={() => triggerBoundaryPulse('bottom')}
          className="min-h-9 px-3 py-1 rounded-lg border border-[#E4E4E0] bg-white text-xs font-medium text-[#141413] hover:bg-[#F6F6F4] cursor-pointer whitespace-nowrap shrink-0"
        >
          Snap Bottom
        </button>
      </div>
    </div>
  );
}

/**
 * Phys13: Spring-Back Drawers
 * Contained bottom sheet that resists over-pull and snaps open/closed across a threshold.
 */
export function Phys13() {
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);

  const closedY = 92;
  const openY = 0;
  const baseTranslate = isOpen ? openY : closedY;
  const currentTranslate = Math.max(
    -14,
    Math.min(closedY + 12, baseTranslate + dragOffset)
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;
    setDragOffset(delta);
  };

  const handleRelease = () => {
    if (!isDragging) return;
    if (!isOpen && dragOffset < -34) {
      setIsOpen(true);
    } else if (isOpen && dragOffset > 34) {
      setIsOpen(false);
    }
    setIsDragging(false);
    setDragOffset(0);
    startYRef.current = null;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="relative h-36 rounded-xl bg-[#EFEFEB] border border-[#E4E4E0] overflow-hidden">
        <div className="p-3 flex items-center justify-between">
          <span className="text-xs text-[#575753]">
            Drawer:{' '}
            <strong className="text-[#141413]">
              {isOpen ? 'Open' : 'Docked'}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="min-h-8 px-3 py-1 rounded-lg bg-[#141413] text-white text-xs font-medium hover:bg-[#272725] cursor-pointer whitespace-nowrap shrink-0"
          >
            {isOpen ? 'Close Sheet' : 'Open Sheet'}
          </button>
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handleRelease}
          onPointerCancel={handleRelease}
          style={{
            transform: `translateY(${currentTranslate}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 460ms cubic-bezier(0.34, 1.48, 0.64, 1)',
          }}
          className="absolute inset-x-0 bottom-0 h-32 rounded-t-xl bg-white border-t border-[#D4D4CE] p-3 shadow-sm touch-none select-none cursor-grab active:cursor-grabbing"
        >
          <div className="w-9 h-1 rounded-full bg-[#D4D4CE] mx-auto mb-2.5" />
          <p className="text-xs font-medium text-[#141413]">
            Spring-Loaded Inspection Sheet
          </p>
          <p className="text-xs text-[#6B6B66] mt-1">
            Pull past 34px to lock open; release early to snap back.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Phys14: Inertia-Feel Carousel
 * Momentum-projected slide transitions supporting both pointer flick and step buttons.
 */
export function Phys14() {
  const slides = [
    { title: 'Impulse Stage', metric: '01 / 04', note: 'Initial kinetic burst' },
    { title: 'Coast Phase', metric: '02 / 04', note: 'Projected velocity carry' },
    { title: 'Detent Capture', metric: '03 / 04', note: 'Magnetic slot capture' },
    {
      title: 'Rest Equilibrium',
      metric: '04 / 04',
      note: 'Zero residual overshoot',
    },
  ];

  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const lastSampleRef = useRef({ x: 0, t: 0, velocity: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastSampleRef.current = { x: e.clientX, t: performance.now(), velocity: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastSampleRef.current.t);
    const vx = (e.clientX - lastSampleRef.current.x) / dt;
    lastSampleRef.current = { x: e.clientX, t: now, velocity: vx };
    setDragX(e.clientX - startXRef.current);
  };

  const handleRelease = () => {
    if (!isDragging) return;
    const width = trackRef.current?.clientWidth || 240;
    const next = computeInertiaTargetIndex(
      index,
      dragX,
      lastSampleRef.current.velocity,
      width,
      slides.length
    );
    setIndex(next);
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        className="overflow-hidden rounded-xl border border-[#E4E4E0] bg-[#F6F6F4] touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <div
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: isDragging
              ? 'none'
              : 'transform 520ms cubic-bezier(0.22, 1.24, 0.36, 1)',
          }}
          className="flex"
        >
          {slides.map((slide) => (
            <div
              key={slide.title}
              className="w-full shrink-0 p-4 flex flex-col justify-between min-h-[104px] bg-white"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66]">
                <span>{slide.metric}</span>
                <span className="text-[#1D4ED8]">Inertia Slide</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#141413]">
                  {slide.title}
                </p>
                <p className="text-xs text-[#6B6B66] mt-0.5">{slide.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="w-10 h-10 rounded-lg border border-[#E4E4E0] bg-white flex items-center justify-center text-[#141413] disabled:opacity-40 hover:bg-[#F6F6F4] cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono tabular-nums text-[#575753]">
          Slide {index + 1} of {slides.length}
        </span>

        <button
          type="button"
          aria-label="Next slide"
          disabled={index === slides.length - 1}
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
          className="w-10 h-10 rounded-lg border border-[#E4E4E0] bg-white flex items-center justify-center text-[#141413] disabled:opacity-40 hover:bg-[#F6F6F4] cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Phys17: Tactile Accordion Detents
 * Mechanical overshoot chevron rotation and spring-loaded disclosure panel.
 */
export function Phys17() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  const sections = [
    {
      title: 'Stiffness Ratio',
      body: 'High tension curves snap rapidly into their final resting detent.',
    },
    {
      title: 'Damping Threshold',
      body: 'Underdamped springs cross the target once before settling cleanly.',
    },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      {sections.map((sec, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={sec.title}
            className="rounded-xl border border-[#E4E4E0] bg-[#F6F6F4] overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onPointerDown={() => setPressedIdx(idx)}
              onPointerUp={() => setPressedIdx(null)}
              onPointerLeave={() => setPressedIdx(null)}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              style={{
                transform: pressedIdx === idx ? 'scale(0.985)' : 'scale(1)',
                transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="w-full min-h-11 px-3.5 py-2.5 flex items-center justify-between text-left bg-white text-sm font-medium text-[#141413] cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1D4ED8]"
            >
              <span>{sec.title}</span>
              <ChevronDown
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="w-4 h-4 text-[#575753] shrink-0"
              />
            </button>

            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition:
                  'grid-template-rows 380ms cubic-bezier(0.34, 1.35, 0.64, 1)',
              }}
            >
              <div className="overflow-hidden">
                <p
                  style={{
                    transform: isOpen ? 'translateY(0px)' : 'translateY(-6px)',
                    opacity: isOpen ? 1 : 0,
                    transition:
                      'transform 380ms cubic-bezier(0.34, 1.45, 0.64, 1), opacity 220ms ease',
                  }}
                  className="px-3.5 py-2.5 text-xs text-[#575753] leading-relaxed"
                >
                  {sec.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Phys20: Spring-Loaded Flip Cards
 * Pre-launch press compression followed by 180-degree 3D overshoot rotation.
 */
export function Phys20() {
  const [flipped, setFlipped] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <div style={{ perspective: '900px' }} className="w-full max-w-[260px]">
        <button
          type="button"
          aria-pressed={flipped}
          aria-label="Flip spring-loaded specimen card"
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={() => setFlipped((f) => !f)}
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${pressed ? 0.94 : 1}) rotateY(${flipped ? 180 : 0}deg)`,
            transition: 'transform 620ms cubic-bezier(0.34, 1.45, 0.64, 1)',
          }}
          className="relative w-full h-28 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-xl"
        >
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-xl bg-[#141413] text-white p-4 flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between text-xs text-[#A3A39E]">
              <span className="font-mono">FRONT FACE</span>
              <RotateCw className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Click to Flip 180°</p>
              <p className="text-xs text-[#A3A39E]">Overshoot Y-axis rotation</p>
            </div>
          </div>

          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-xl bg-[#1D4ED8] text-white p-4 flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between text-xs text-[#DBEAFE]">
              <span className="font-mono">REVERSE FACE</span>
              <RotateCw className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Spring Flip Complete</p>
              <p className="text-xs text-[#DBEAFE]">Tap again to return</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
