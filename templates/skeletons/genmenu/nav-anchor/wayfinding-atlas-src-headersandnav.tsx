import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  Rocket,
  Clock,
  Eye,
  History,
  ChevronDown,
} from 'lucide-react';
import { clampStep, getPaginationRange, getProgressPercent } from '../../utils/stepLogic';

/* -------------------------------------------------------------------------- */
/* Way14: Enterprise Page Header with Breadcrumbs + Actions (Spacious · Pro)  */
/* -------------------------------------------------------------------------- */
export function Way14() {
  const trail = ['Infrastructure', 'Kubernetes Clusters', 'eu-west-prod-01'];
  const [depth, setDepth] = useState(trail.length);
  const [deployed, setDeployed] = useState(false);
  const [exported, setExported] = useState(false);

  return (
    <header className="bg-white p-6 rounded-xl border border-slate-200">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          {trail.slice(0, depth).map((seg, idx) => {
            const isLast = idx === depth - 1;
            return (
              <li key={seg} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                {isLast ? (
                  <span aria-current="page" className="text-slate-900 font-semibold">
                    {seg}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDepth(idx + 1)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {seg}
                  </button>
                )}
              </li>
            );
          })}
          {depth < trail.length && (
            <li>
              <button
                type="button"
                onClick={() => setDepth(trail.length)}
                className="ml-2 text-blue-600 hover:underline"
              >
                Reset trail
              </button>
            </li>
          )}
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-950 tracking-tight">
            {trail[depth - 1]}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5 tabular-nums">
            <span>Frankfurt eu-west-1</span>
            <span aria-hidden="true">·</span>
            <span>12 active nodes</span>
            <span aria-hidden="true">·</span>
            <span>Synced 4m ago</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setExported((e) => !e)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {exported ? 'YAML Exported' : 'Export YAML'}
          </button>
          <button
            type="button"
            onClick={() => setDeployed((d) => !d)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
            {deployed ? 'Rollout Active' : 'Deploy Update'}
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Way15: Dark Release Header with Breadcrumbs + Actions (Spacious · Dark)    */
/* -------------------------------------------------------------------------- */
export function Way15() {
  const [published, setPublished] = useState(false);
  const [env, setEnv] = useState<'Staging' | 'Production'>('Staging');

  return (
    <header className="bg-slate-950 text-slate-100 p-6 rounded-xl border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li>
              <a
                href="#releases"
                onClick={(e) => e.preventDefault()}
                className="hover:text-white transition-colors"
              >
                Releases
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a
                href="#sdk"
                onClick={(e) => e.preventDefault()}
                className="hover:text-white transition-colors"
              >
                Web SDK
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-100 font-semibold font-mono tabular-nums">
              v3.14.0
            </li>
          </ol>
        </nav>

        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{published ? 'Published to CDN' : 'Ready for release'}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            SDK Release 3.14.0 — {env}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Includes streaming hydration improvements and reduced bundle footprint.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setEnv((e) => (e === 'Staging' ? 'Production' : 'Staging'))}
            className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Target: {env}
          </button>
          <button
            type="button"
            onClick={() => setPublished((p) => !p)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              published
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-white text-slate-950 hover:bg-slate-200'
            }`}
          >
            {published ? 'Rollback Release' : 'Publish Release'}
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Way16: Scrollspy Table-of-Contents Anchor Nav (Spacious · Minimal)         */
/* -------------------------------------------------------------------------- */
export function Way16() {
  const sections = [
    {
      id: 'way16-overview',
      title: '1. Spatial Orientation',
      body: 'Wayfinding communicates where a person is within an information hierarchy, how they arrived, and what adjacent routes remain available without forcing memory recall.',
    },
    {
      id: 'way16-semantics',
      title: '2. Semantic Landmarks',
      body: 'Wrap ordered breadcrumbs and table-of-contents lists in <nav> elements with descriptive aria-label attributes and mark the current destination with aria-current.',
    },
    {
      id: 'way16-density',
      title: '3. Density Calibration',
      body: 'High-frequency utility workflows benefit from compact single-row controls, whereas multi-stage onboarding flows need generous spacing for descriptive helper copy.',
    },
    {
      id: 'way16-keyboard',
      title: '4. Keyboard Focus Order',
      body: 'Every interactive segment and step button uses native <button> or <a> controls with visible focus rings so keyboard users move predictably along the trail.',
    },
  ];

  const [activeId, setActiveId] = useState(sections[0].id);
  const scrollPaneRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollPaneRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    let closestId = sections[0].id;
    let smallestDelta = Infinity;

    for (const sec of sections) {
      const el = container.querySelector<HTMLElement>(`[data-sec-id="${sec.id}"]`);
      if (!el) continue;
      const delta = Math.abs(el.getBoundingClientRect().top - containerTop - 16);
      if (delta < smallestDelta) {
        smallestDelta = delta;
        closestId = sec.id;
      }
    }
    setActiveId(closestId);
  };

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const container = scrollPaneRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-sec-id="${id}"]`);
    if (container && target) {
      container.scrollTo({
        top: target.offsetTop - container.offsetTop - 12,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-[220px_1fr] overflow-hidden">
      <nav
        aria-label="On this page"
        className="p-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/60"
      >
        <p className="text-xs font-semibold text-slate-900 mb-3">On this page</p>
        <ol className="space-y-1">
          {sections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  {sec.title}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        ref={scrollPaneRef}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="Scrollable documentation preview"
        className="h-52 overflow-y-auto p-5 space-y-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
      >
        {sections.map((sec) => (
          <section key={sec.id} data-sec-id={sec.id}>
            <h4 className="text-sm font-bold text-slate-950">{sec.title}</h4>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way17: Horizontal Section Anchor Bar (Compact · Colourful)                 */
/* -------------------------------------------------------------------------- */
export function Way17() {
  const anchors = [
    { id: 'overview', label: 'Overview', content: 'Architectural summary of low-latency edge caching and regional routing.' },
    { id: 'specs', label: 'Specifications', content: 'Supports HTTP/3 QUIC transport, Brotli level-6 compression, and 128 KB inline limits.' },
    { id: 'benchmarks', label: 'Benchmarks', content: 'Median TTFB measured at 18 ms across 40 global test locations under sustained load.' },
    { id: 'changelog', label: 'Changelog', content: 'Added stale-while-revalidate header directives and improved cache invalidation speed.' },
  ];

  const [active, setActive] = useState(anchors[0].id);
  const paneRef = useRef<HTMLDivElement>(null);

  const jumpTo = (id: string) => {
    setActive(id);
    const pane = paneRef.current;
    const node = pane?.querySelector<HTMLElement>(`[data-anchor="${id}"]`);
    if (pane && node) {
      pane.scrollTo({ top: node.offsetTop - pane.offsetTop - 8, behavior: 'smooth' });
    }
  };

  const handlePaneScroll = () => {
    const pane = paneRef.current;
    if (!pane) return;
    const top = pane.getBoundingClientRect().top;
    for (const item of anchors) {
      const el = pane.querySelector<HTMLElement>(`[data-anchor="${item.id}"]`);
      if (el && el.getBoundingClientRect().top - top >= -24) {
        setActive(item.id);
        break;
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-teal-200 overflow-hidden">
      <nav aria-label="Section anchors" className="bg-teal-50/70 px-4 py-2.5 border-b border-teal-200/80">
        <ol className="flex items-center gap-2 overflow-x-auto">
          {anchors.map((a) => {
            const isCurrent = active === a.id;
            return (
              <li key={a.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => jumpTo(a.id)}
                  aria-current={isCurrent ? 'location' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-teal-600 text-white'
                      : 'text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  {a.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div
        ref={paneRef}
        onScroll={handlePaneScroll}
        className="h-32 overflow-y-auto p-4 space-y-5"
      >
        {anchors.map((a) => (
          <div key={a.id} data-anchor={a.id}>
            <h4 className="text-xs font-bold text-slate-900">{a.label}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way18: Minimal Back-Navigation Row (Compact · Minimal)                     */
/* -------------------------------------------------------------------------- */
export function Way18() {
  const invoices = ['INV-2047', 'INV-2048', 'INV-2049', 'INV-2050'];
  const [idx, setIdx] = useState(1);
  const [returned, setReturned] = useState(false);

  return (
    <nav
      aria-label="Back navigation"
      className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
    >
      <button
        type="button"
        onClick={() => setReturned((r) => !r)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{returned ? 'Returned to All Invoices (Click to reopen)' : 'Back to Invoices'}</span>
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {invoices[idx]} · {idx + 1} of {invoices.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIdx((i) => clampStep(i - 1, invoices.length))}
            disabled={idx === 0}
            aria-label="Previous invoice"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => clampStep(i + 1, invoices.length))}
            disabled={idx === invoices.length - 1}
            aria-label="Next invoice"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Way19: Contextual Back & History Row (Spacious · Colourful)                */
/* -------------------------------------------------------------------------- */
export function Way19() {
  const recentPages = [
    'Design Tokens / Color Palette',
    'Layout Grids / 12-Column Spec',
    'Typography / Optical Sizing',
  ];
  const [selectedOrigin, setSelectedOrigin] = useState(recentPages[0]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  return (
    <nav
      aria-label="Contextual return navigation"
      className="bg-gradient-to-r from-rose-50 via-white to-indigo-50 p-5 rounded-xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setHistoryOpen(false)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          aria-label={`Return to ${selectedOrigin}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium text-rose-700">Return to previous section</p>
          <p className="text-sm font-semibold text-slate-950 truncate">{selectedOrigin}</p>
        </div>
      </div>

      <div className="relative flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-haspopup="menu"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          <History className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
          Recent History
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </button>

        {historyOpen && (
          <div
            role="menu"
            aria-label="Recent visited pages"
            className="absolute right-0 top-11 z-30 min-w-60 rounded-lg bg-white border border-slate-200 py-1.5 shadow-md"
          >
            {recentPages.map((page) => (
              <button
                key={page}
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedOrigin(page);
                  setHistoryOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-900"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{page}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPreviewing((p) => !p)}
          aria-pressed={previewing}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            previewing
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {previewing ? 'Preview Active' : 'Live Preview'}
        </button>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Way20: Pagination-Stepper Hybrid Control (Compact · Dark)                  */
/* -------------------------------------------------------------------------- */
export function Way20() {
  const totalPages = 8;
  const [page, setPage] = useState(3);
  const tokens = getPaginationRange(page, totalPages, 1);
  const percent = getProgressPercent(page - 1, totalPages);

  return (
    <div className="bg-slate-950 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-300 tabular-nums">
          Assessment Step {page} of {totalPages}
        </span>
        <span className="text-xs font-mono tabular-nums text-sky-400">
          {percent}% completed
        </span>
      </div>

      <div
        aria-hidden="true"
        className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>

      <nav aria-label="Step pagination" className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </button>

        <ol className="flex items-center gap-1">
          {tokens.map((token) => {
            if (typeof token !== 'number') {
              return (
                <li key={token} className="px-2 text-xs text-slate-500 select-none" aria-hidden="true">
                  ...
                </li>
              );
            }
            const isCurrent = token === page;
            const isCompleted = token < page;
            return (
              <li key={token}>
                <button
                  type="button"
                  onClick={() => setPage(token)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Go to step ${token}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    isCurrent
                      ? 'bg-sky-500 text-slate-950'
                      : isCompleted
                        ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {token}
                </button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 disabled:opacity-40 whitespace-nowrap"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
