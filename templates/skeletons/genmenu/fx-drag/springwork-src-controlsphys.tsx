import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Bookmark,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  Star,
} from 'lucide-react';
import { validateAccessCode } from '../../utils/physicsMath';

/**
 * Phys1: Spring Squash Buttons
 * Volume-preserving compression on press (wide & short) followed by elastic overshoot rebound.
 */
export function Phys1() {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [pressCount, setPressCount] = useState(0);

  const springTransition =
    'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 260ms ease';

  const getTransform = (id: string) => {
    if (pressedId === id) {
      return 'scaleX(1.07) scaleY(0.88) translateY(2px)';
    }
    return 'scaleX(1) scaleY(1) translateY(0px)';
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onPointerDown={() => setPressedId('primary')}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') setPressedId('primary');
          }}
          onKeyUp={() => setPressedId(null)}
          onClick={() => setPressCount((c) => c + 1)}
          style={{
            transform: getTransform('primary'),
            transition: springTransition,
          }}
          className="min-h-11 px-5 py-2.5 rounded-lg bg-[#141413] text-white text-sm font-medium shadow-sm hover:bg-[#272725] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer select-none"
        >
          Press &amp; Release
        </button>

        <button
          type="button"
          onPointerDown={() => setPressedId('accent')}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') setPressedId('accent');
          }}
          onKeyUp={() => setPressedId(null)}
          onClick={() => setPressCount((c) => c + 1)}
          style={{
            transform: getTransform('accent'),
            transition: springTransition,
          }}
          className="min-h-11 px-5 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-medium shadow-sm hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer select-none"
        >
          Trigger Impulse
        </button>
      </div>

      <p className="text-xs text-[#575753] font-mono tabular-nums">
        Squash count:{' '}
        <span className="text-[#141413] font-medium">{pressCount}</span>
        {' · '}
        <span>
          {pressedId ? 'Compressed (1.07x, 0.88y)' : 'At equilibrium'}
        </span>
      </p>
    </div>
  );
}

/**
 * Phys2: Elastic Toggles
 * Thumb elongates horizontally mid-travel and overshoots the end stop before snapping back.
 */
export function Phys2() {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);

  const thumbTransform = enabled
    ? pressed
      ? 'translateX(26px) scaleX(1.24) scaleY(0.86)'
      : 'translateX(30px) scaleX(1) scaleY(1)'
    : pressed
      ? 'translateX(2px) scaleX(1.24) scaleY(0.86)'
      : 'translateX(0px) scaleX(1) scaleY(1)';

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle elastic spring switch"
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={() => setEnabled((v) => !v)}
          style={{
            transition: 'background-color 260ms ease',
          }}
          className={`relative inline-flex items-center w-16 h-9 p-1 rounded-full border cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
            enabled
              ? 'bg-[#1D4ED8] border-[#1D4ED8]'
              : 'bg-[#E6E6E2] border-[#D4D4CE]'
          }`}
        >
          <span
            aria-hidden="true"
            style={{
              transform: thumbTransform,
              transition:
                'transform 460ms cubic-bezier(0.22, 1.4, 0.36, 1)',
            }}
            className="block w-7 h-7 rounded-full bg-white shadow-sm origin-center"
          />
        </button>

        <div className="min-w-[84px]">
          <span className="text-sm font-medium text-[#141413] block">
            {enabled ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-[#6B6B66] font-mono tabular-nums">
            {pressed ? 'Tensioned' : enabled ? 'Detent: 1' : 'Detent: 0'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Phys4: Drag-Feel Sliders
 * Immediate primary thumb paired with a velocity-lagged ghost follower and value readout.
 */
export function Phys4() {
  const [value, setValue] = useState(42);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col justify-center gap-4 w-full max-w-[280px] mx-auto">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor="phys4-slider"
          className="text-sm font-medium text-[#141413]"
        >
          Damping Tension
        </label>
        <span className="text-sm font-mono tabular-nums text-[#1D4ED8] font-medium">
          {value}%
        </span>
      </div>

      <div className="relative h-10 flex items-center">
        <div className="w-full h-2 rounded-full bg-[#E6E6E2] overflow-hidden relative">
          <div
            style={{
              width: `${value}%`,
              transition: 'width 440ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="absolute inset-y-0 left-0 bg-[#93C5FD] rounded-full"
          />
          <div
            style={{ width: `${value}%` }}
            className="absolute inset-y-0 left-0 bg-[#1D4ED8] rounded-full"
          />
        </div>

        <div
          aria-hidden="true"
          style={{
            left: `calc(${value}% - 12px)`,
            transform: isDragging ? 'scale(1.35, 0.82)' : 'scale(0.85)',
            transition:
              'left 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="pointer-events-none absolute w-6 h-6 rounded-full bg-[#1D4ED8]/25 border border-[#1D4ED8]/40"
        />

        <div
          aria-hidden="true"
          style={{
            left: `calc(${value}% - 10px)`,
            transform: isDragging ? 'scale(1.18)' : 'scale(1)',
            transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="pointer-events-none absolute w-5 h-5 rounded-full bg-white border-2 border-[#1D4ED8] shadow-sm"
        />

        <input
          id="phys4-slider"
          type="range"
          min={0}
          max={100}
          value={value}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onBlur={() => setIsDragging(false)}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing"
        />
      </div>

      <p className="text-xs text-[#6B6B66]">
        {isDragging
          ? 'Dragging — trailing ghost catching up'
          : 'Drag thumb to observe velocity lag'}
      </p>
    </div>
  );
}

/**
 * Phys5: Jelly Icons
 * Multi-axis squash-and-stretch impulse triggered on every click.
 */
export function Phys5() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    heart: true,
    star: false,
    bookmark: false,
    bell: false,
  });
  const [animKeys, setAnimKeys] = useState<Record<string, number>>({
    heart: 0,
    star: 0,
    bookmark: 0,
    bell: 0,
  });

  const icons = [
    {
      id: 'heart',
      label: 'Favorite',
      Icon: Heart,
      activeClass: 'text-[#DC2626] fill-[#DC2626]',
    },
    {
      id: 'star',
      label: 'Star',
      Icon: Star,
      activeClass: 'text-[#D97706] fill-[#D97706]',
    },
    {
      id: 'bookmark',
      label: 'Bookmark',
      Icon: Bookmark,
      activeClass: 'text-[#1D4ED8] fill-[#1D4ED8]',
    },
    {
      id: 'bell',
      label: 'Notify',
      Icon: Bell,
      activeClass: 'text-[#059669] fill-[#059669]',
    },
  ];

  const handleTrigger = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    setAnimKeys((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex items-center gap-3">
        {icons.map(({ id, label, Icon, activeClass }) => {
          const active = selected[id];
          const replayKey = animKeys[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              aria-label={`Toggle ${label} jelly icon`}
              onClick={() => handleTrigger(id)}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                active
                  ? 'bg-[#F8FAFC] border-[#CBD5E1]'
                  : 'bg-white border-[#E4E4E0] hover:bg-[#F6F6F4]'
              }`}
            >
              <span
                key={replayKey}
                className={
                  replayKey > 0 ? 'inline-flex animate-phys-jelly' : 'inline-flex'
                }
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active ? activeClass : 'text-[#575753]'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#6B6B66]">
        Click any icon for inverse XY jelly deformation
      </p>
    </div>
  );
}

/**
 * Phys15: Shake-Denied Inputs
 * Horizontal damped sinusoid rejection wobble when invalid input is submitted.
 */
export function Phys15() {
  const [code, setCode] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<'idle' | 'error' | 'valid'>('idle');
  const [message, setMessage] = useState('Try empty submit or "SPRING20"');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateAccessCode(code);
    if (!res.valid) {
      setStatus('error');
      setMessage(res.reason);
      setShakeKey((k) => k + 1);
      inputRef.current?.focus();
    } else {
      setStatus('valid');
      setMessage(res.reason);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-3 w-full max-w-[280px] mx-auto"
      noValidate
    >
      <label
        htmlFor="phys15-code"
        className="text-xs font-medium text-[#575753]"
      >
        Access Code
      </label>

      <div
        key={shakeKey}
        className={`flex items-center gap-2 ${
          shakeKey > 0 && status === 'error' ? 'animate-phys-shake' : ''
        }`}
      >
        <input
          ref={inputRef}
          id="phys15-code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== 'idle') {
              setStatus('idle');
              setMessage('Try empty submit or "SPRING20"');
            }
          }}
          placeholder="e.g. SPRING20"
          aria-invalid={status === 'error'}
          className={`flex-1 min-w-0 h-11 px-3 rounded-lg border text-sm bg-white text-[#141413] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 ${
            status === 'error'
              ? 'border-[#DC2626] focus:ring-[#DC2626]/25'
              : status === 'valid'
                ? 'border-[#059669] focus:ring-[#059669]/25'
                : 'border-[#D4D4CE] focus:ring-[#1D4ED8]/25 focus:border-[#1D4ED8]'
          }`}
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-lg bg-[#141413] text-white text-sm font-medium hover:bg-[#272725] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Verify
        </button>
      </div>

      <div
        className={`flex items-center gap-1.5 text-xs min-h-[18px] ${
          status === 'error'
            ? 'text-[#DC2626] font-medium'
            : status === 'valid'
              ? 'text-[#059669] font-medium'
              : 'text-[#6B6B66]'
        }`}
        role="status"
      >
        {status === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
        {status === 'valid' && (
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </form>
  );
}

/**
 * Phys18: Elastic Segmented Tabs
 * Active background indicator glides across slots with overshoot lock-in.
 */
export function Phys18() {
  const tabs = ['Linear', 'Spring', 'Bounce'];
  const [activeIndex, setActiveIndex] = useState(1);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[280px] mx-auto">
      <div
        role="tablist"
        aria-label="Curve mode"
        className="relative grid grid-cols-3 w-full p-1 rounded-xl bg-[#EFEFEB] border border-[#E4E4E0]"
      >
        <div
          aria-hidden="true"
          style={{
            width: 'calc(33.3333% - 3px)',
            transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 3}px)) ${
              pressedIndex !== null ? 'scaleX(1.06) scaleY(0.94)' : 'scale(1)'
            }`,
            transition: 'transform 460ms cubic-bezier(0.34, 1.42, 0.64, 1)',
          }}
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-sm border border-[#E4E4E0]"
        />

        {tabs.map((tab, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onPointerDown={() => setPressedIndex(idx)}
              onPointerUp={() => setPressedIndex(null)}
              onPointerLeave={() => setPressedIndex(null)}
              onClick={() => setActiveIndex(idx)}
              className={`relative z-10 h-10 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D4ED8] ${
                isActive
                  ? 'text-[#141413]'
                  : 'text-[#6B6B66] hover:text-[#141413]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#6B6B66] font-mono">
        Active detent:{' '}
        <span className="text-[#141413]">{tabs[activeIndex]}</span>
      </p>
    </div>
  );
}

/**
 * Phys19: Recoil Counter Steppers
 * Vertical impulse kick on increment/decrement plus boundary bumper stop at 0 and 12.
 */
export function Phys19() {
  const [count, setCount] = useState(4);
  const [motionType, setMotionType] = useState<'up' | 'down' | 'bumper' | null>(
    null
  );
  const [animKey, setAnimKey] = useState(0);
  const [pressedBtn, setPressedBtn] = useState<'minus' | 'plus' | null>(null);

  const min = 0;
  const max = 12;

  const step = (delta: -1 | 1) => {
    const next = count + delta;
    if (next < min || next > max) {
      setMotionType('bumper');
      setAnimKey((k) => k + 1);
      return;
    }
    setCount(next);
    setMotionType(delta > 0 ? 'up' : 'down');
    setAnimKey((k) => k + 1);
  };

  const animClass =
    motionType === 'up'
      ? 'animate-phys-recoil-up'
      : motionType === 'down'
        ? 'animate-phys-recoil-down'
        : motionType === 'bumper'
          ? 'animate-phys-bumper'
          : '';

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-[#F6F6F4] border border-[#E4E4E0]">
        <button
          type="button"
          aria-label="Decrease counter"
          onPointerDown={() => setPressedBtn('minus')}
          onPointerUp={() => setPressedBtn(null)}
          onPointerLeave={() => setPressedBtn(null)}
          onClick={() => step(-1)}
          style={{
            transform: pressedBtn === 'minus' ? 'scale(0.88)' : 'scale(1)',
            transition: 'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="w-11 h-11 rounded-lg bg-white border border-[#E4E4E0] flex items-center justify-center text-[#141413] hover:bg-[#EFEFEB] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-16 h-11 flex items-center justify-center overflow-hidden">
          <span
            key={animKey}
            className={`text-xl font-semibold font-mono tabular-nums text-[#141413] inline-block ${animClass}`}
          >
            {count}
          </span>
        </div>

        <button
          type="button"
          aria-label="Increase counter"
          onPointerDown={() => setPressedBtn('plus')}
          onPointerUp={() => setPressedBtn(null)}
          onPointerLeave={() => setPressedBtn(null)}
          onClick={() => step(1)}
          style={{
            transform: pressedBtn === 'plus' ? 'scale(0.88)' : 'scale(1)',
            transition: 'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="w-11 h-11 rounded-lg bg-[#141413] text-white flex items-center justify-center hover:bg-[#272725] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[#6B6B66] font-mono tabular-nums">
        Bounds: {min}–{max}{' '}
        {count === min || count === max ? '(At bumper limit)' : ''}
      </p>
    </div>
  );
}
