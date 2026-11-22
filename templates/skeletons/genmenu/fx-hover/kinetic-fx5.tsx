export function Fx5() {
  const items = [
    {primary: 'View Case Study', secondary: 'Explore Full Breakdown'},
    {primary: 'Schedule Review', secondary: 'Book 20-Min Session'},
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((item) => (
        <button
          key={item.primary}
          type="button"
          className="group relative flex items-center justify-between w-full px-4 py-3.5 bg-zinc-50 hover:bg-zinc-900 border border-zinc-200 hover:border-zinc-900 rounded-lg text-left transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <span className="relative block h-6 overflow-hidden">
            <span className="block text-sm font-semibold text-zinc-900 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
              {item.primary}
            </span>
            <span
              aria-hidden="true"
              className="block text-sm font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
            >
              {item.secondary}
            </span>
          </span>
          <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
            Hover
          </span>
        </button>
      ))}
    </div>
  );
}
