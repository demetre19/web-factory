export function Fx6() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <a
        href="#fx6-demo"
        onClick={(e) => e.preventDefault()}
        className="group block px-4 py-4 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-[#2563EB]/40 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <span className="block font-serif text-xl font-medium text-zinc-900 tracking-[-0.02em] group-hover:tracking-[0.14em] group-focus-visible:tracking-[0.14em] transition-[letter-spacing,color] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#2563EB]">
          Architectural Clarity
        </span>
        <span className="mt-1 block text-xs text-zinc-500 tracking-normal group-hover:tracking-[0.06em] transition-[letter-spacing] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
          Hover to expand editorial kerning
        </span>
      </a>
    </div>
  );
}
