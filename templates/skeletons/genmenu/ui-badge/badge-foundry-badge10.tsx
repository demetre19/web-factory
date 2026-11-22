interface Badge10Props {
  discount?: string;
}

export function Badge10({ discount = '$25 OFF' }: Badge10Props) {
  return (
    <div className="relative w-full max-w-[238px] rounded-xl border border-slate-200 bg-white p-4 pt-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Discount ticket stub with SVG punched side notches, perforation & eyelet */}
      <div
        aria-label={`Discount ticket: ${discount}`}
        className="pointer-events-none absolute -top-3.5 right-3 inline-flex h-8 items-center drop-shadow-sm"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 112 34"
          className="h-8 w-[112px]"
        >
          {/* Ticket body with punched circular top/bottom notches and left eyelet */}
          <path
            d="M4 1 H31 A4 4 0 0 0 39 1 H108 A3 3 0 0 1 111 4 V30 A3 3 0 0 1 108 33 H39 A4 4 0 0 0 31 33 H4 A3 3 0 0 1 1 30 V4 A3 3 0 0 1 4 1 Z"
            className="fill-emerald-600 stroke-emerald-700 dark:fill-emerald-500 dark:stroke-emerald-300"
            strokeWidth="1.2"
          />
          {/* Punched left hang hole */}
          <circle
            cx="12"
            cy="17"
            r="3.2"
            className="fill-white stroke-emerald-800 dark:fill-slate-900 dark:stroke-emerald-950"
            strokeWidth="1.2"
          />
          {/* Vertical tear perforation */}
          <line
            x1="35"
            y1="6"
            x2="35"
            y2="28"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.3"
            strokeDasharray="2.5 2.5"
          />
        </svg>
        <span className="absolute right-2.5 font-mono text-[11px] font-extrabold tracking-tight text-white tabular-nums dark:text-slate-950">
          {discount}
        </span>
      </div>

      {/* Small promo card host */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Checkout Offer</p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Annual Studio Pass
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Apply voucher code at billing summary.
      </p>
    </div>
  );
}
