import { IMAGES } from '../../data/specimens';

export function Scroll13() {
  return (
    <section
      id="scroll-13"
      aria-labelledby="scroll-13-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-wide text-[#575752]">
            Scroll13 · Spatial & Media · Fixed backdrop + scrolling curtain panels
          </p>
          <h2 id="scroll-13-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
            13. Windowed Architectural Curtain
          </h2>
        </div>

        <div className="relative rounded-xl border border-[#E2E2DE] bg-[#111110]">
          <div className="sticky top-16 h-[420px] overflow-hidden rounded-xl">
            <img
              src={IMAGES.pavilionShadow}
              alt="Stationary courtyard colonnade behind scrolling panels"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <p className="font-mono text-xs text-[#93C5FD]">Stationary Backdrop Layer</p>
              <p className="mt-1 font-display text-xl font-semibold">
                Colonnade Courtyard Aperture
              </p>
            </div>
          </div>

          <div className="relative z-10 -mt-32 space-y-44 px-6 pb-12 pt-8 md:px-12">
            <div className="ml-auto max-w-md rounded-xl border border-[#E2E2DE] bg-white p-6 shadow-sm">
              <p className="font-mono text-xs text-[#575752]">Curtain Panel A</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#111110]">
                Moving Solid Frame
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#575752]">
                Because the backdrop uses sticky positioning rather than background-attachment: fixed, it behaves reliably inside nested layout frames and touch viewports.
              </p>
            </div>

            <div className="mr-auto max-w-md rounded-xl border border-[#E2E2DE] bg-white p-6 shadow-sm">
              <p className="font-mono text-xs text-[#575752]">Curtain Panel B</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#111110]">
                Windowed Reveal Rhythm
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#575752]">
                Generous spacing between panels opens clear architectural windows onto the stationary photograph beneath.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll13;
