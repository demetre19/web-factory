import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

/* ============================================================================
   Pricing37 — Enterprise Split-Card · Minimal / Professional (Aegis Compliance)
   ============================================================================ */
export function Pricing37() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section aria-labelledby="p37-heading" className="bg-slate-50 py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Aegis Security Compliance
          </p>
          <h2 id="p37-heading" className="mt-2 text-3xl font-semibold tracking-tight [text-wrap:balance]">
            Self-serve compliance automation or custom enterprise governance
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold">Team Self-Serve</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Automated SOC 2 Type II & ISO 27001 readiness for growing startups.
              </p>
              <div className="mt-6 text-4xl font-bold tabular-nums">
                $490 <span className="text-sm font-normal text-slate-500">/ month</span>
              </div>
              <ul className="mt-7 space-y-3 text-sm text-slate-700">
                {[
                  'Up to 75 monitored cloud & SaaS integrations',
                  'Continuous AWS, GCP & GitHub policy checks',
                  'Public trust portal with NDA click-through',
                  'Auditor read-only workspace included',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-900" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setSelected('Team Self-Serve ($490/mo)')}
              className="mt-8 w-full py-2.5 px-4 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Start Team Onboarding
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold">Enterprise Dedicated</h3>
                <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 bg-slate-800 text-slate-200 rounded-sm">
                  Custom Contract
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Multi-framework governance (HIPAA, FedRAMP, PCI-DSS) deployed inside your private VPC or single-tenant EU/US enclave.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
                {[
                  'Unlimited entities & subsidiary rollups',
                  'Custom Rego/OPA policy rule authoring',
                  'SAML 2.0 SSO, SCIM & hardware MFA',
                  'Dedicated compliance solutions engineer',
                  'Custom MSA, DPA & vendor risk packet',
                  '99.99% uptime SLA with 15-min response',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400">Annual invoicing · Procurement & PO ready</div>
              <button
                type="button"
                onClick={() => setSelected('Enterprise Dedicated (Custom Architecture Quote)')}
                className="px-6 py-3 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Schedule Architecture Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
            Selected Aegis track: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing38 — Enterprise Split-Card · Dark (CoreBank Ledger API)
   ============================================================================ */
export function Pricing38() {
  const [region, setRegion] = useState<'US-Fed' | 'EU-SEPA' | 'UK-FPS'>('US-Fed');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section aria-labelledby="p38-heading" className="bg-[#090B10] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            CoreBank Double-Entry Ledger
          </p>
          <h2 id="p38-heading" className="mt-2 text-3xl font-semibold text-white">
            Developer API tiers paired with dedicated settlement clusters
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-xl bg-[#121620] border border-slate-800 p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-white">Sandbox</h3>
                  <span className="text-2xl font-mono font-bold text-white tabular-nums">$0</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Full ledger API & simulated ACH/wire clearing for 50,000 test entries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected('CoreBank Sandbox ($0)')}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Create Sandbox Key
              </button>
            </div>

            <div className="rounded-xl bg-[#121620] border border-slate-800 p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-white">Production Growth</h3>
                  <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                    $650<span className="text-xs font-normal text-slate-400">/mo</span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Up to 500,000 posted transactions/mo with automated bank reconciliation webhooks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected('CoreBank Production Growth ($650/mo)')}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition-colors whitespace-nowrap"
              >
                Start Production
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-[#111926] border border-emerald-500/40 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Dedicated Clearing Cluster</h3>
              <p className="mt-2 text-sm text-slate-300">
                Single-tenant isolated database shards with direct FedNow, SEPA Instant, or Faster Payments rails.
              </p>

              <div className="mt-6">
                <span className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Target Clearing Rail
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['US-Fed', 'EU-SEPA', 'UK-FPS'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                        region === r
                          ? 'bg-emerald-400 text-slate-950 font-semibold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
                {[
                  '10,000+ TPS deterministic locking',
                  'Custom HSM key management (BYOK)',
                  'SOC 1 & PCI Level 1 attestation',
                  '24/7 dedicated Slack & pager channel',
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-400">Active rail config: {region}</span>
              <button
                type="button"
                onClick={() => setSelected(`Dedicated Clearing Cluster (${region})`)}
                className="px-6 py-3 rounded-lg bg-white text-slate-950 text-sm font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Request Enterprise Specs
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-mono text-emerald-200 bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-2.5">
            Provisioning requested: {selected}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing39 — Enterprise Split-Card · Light-Warm (Meridian Legal)
   ============================================================================ */
export function Pricing39() {
  const [seats, setSeats] = useState<'50+' | '200+' | '1000+'>('200+');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section aria-labelledby="p39-heading" className="bg-[#F6F3EC] py-16 px-6 sm:px-10 text-[#252019]">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#726452]">
            Meridian Counsel Workbench
          </p>
          <h2
            id="p39-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Boutique practice plans & global law firm deployments
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 rounded-2xl bg-[#FCFBF8] border border-[#DDD5C7] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">
                Boutique Firm
              </h3>
              <p className="mt-1.5 text-sm text-[#63594C]">
                For practices up to 20 attorneys managing M&A and commercial contracts.
              </p>
              <div className="mt-6 text-4xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                $95 <span className="text-sm font-sans font-normal text-[#63594C]">/ attorney / mo</span>
              </div>
              <ul className="mt-7 space-y-3 text-sm text-[#3E362C]">
                {[
                  'Zero data retention on client matter uploads',
                  'Precedent clause library & redline diffing',
                  'iManage & NetDocuments sync',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#726452]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setSelected('Boutique Firm ($95/attorney/mo)')}
              className="mt-8 w-full py-2.5 px-4 rounded-lg border border-[#252019] text-[#252019] text-sm font-medium hover:bg-[#252019] hover:text-white transition-colors whitespace-nowrap"
            >
              Begin Firm Trial
            </button>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-[#252019] text-[#FAF8F4] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-semibold [font-family:var(--font-serif)]">
                AmLaw & Global Enterprise
              </h3>
              <p className="mt-2 text-sm text-[#CFC7BA]">
                Air-gapped Azure or AWS private cloud deployment with ethical-wall matter isolation.
              </p>

              <div className="mt-6">
                <span className="block text-xs uppercase tracking-wider text-[#B6AC9D] mb-2">
                  Attorney Seat Tier
                </span>
                <div className="inline-flex rounded-lg bg-[#352E25] p-1">
                  {(['50+', '200+', '1000+'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeats(s)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors tabular-nums ${
                        seats === s ? 'bg-[#FAF8F4] text-[#252019]' : 'text-[#CFC7BA] hover:text-white'
                      }`}
                    >
                      {s} attorneys
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#EAE4DA]">
                {[
                  'Strict Chinese-wall matter permissions',
                  'Custom firm playbook & precedent indexing',
                  'ISO 27001 & SOC 2 Type II audit report',
                  'Dedicated legal knowledge engineer',
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#D4B88C]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#3B342B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-[#CFC7BA] tabular-nums">Configured for {seats} seat volume</span>
              <button
                type="button"
                onClick={() => setSelected(`Global Enterprise (${seats} attorneys)`)}
                className="px-6 py-3 rounded-lg bg-[#D4B88C] text-[#252019] text-sm font-semibold hover:bg-[#DFC7A1] transition-colors whitespace-nowrap"
              >
                Request Private Cloud Proposal
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-[#252019] bg-[#EAE3D5] rounded-lg px-4 py-2.5">
            Meridian brief prepared: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing40 — Enterprise Split-Card · Bold / Colourful (GridScale Edge CDN)
   ============================================================================ */
export function Pricing40() {
  const [popTier, setPopTier] = useState<'Global 300+' | 'China + APAC' | 'EU Sovereign'>('Global 300+');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section aria-labelledby="p40-heading" className="bg-teal-950 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-lime-300">
            GridScale Edge Delivery
          </p>
          <h2 id="p40-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Self-serve edge or sovereign global PoP networks
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 rounded-2xl bg-white text-slate-950 border-2 border-slate-950 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-extrabold">Pro Edge</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Instant global caching, WAF, and image resizing for SaaS & storefronts.
              </p>
              <div className="mt-6 text-4xl font-extrabold text-teal-900 tabular-nums">
                $75 <span className="text-sm font-semibold text-slate-600">/ month</span>
              </div>
              <ul className="mt-7 space-y-3 text-sm font-medium text-slate-800">
                {[
                  '10 TB global edge bandwidth included',
                  'Managed OWASP Core WAF ruleset',
                  'Instant cache purge (< 150ms global)',
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-teal-800" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setSelected('Pro Edge ($75/mo)')}
              className="mt-8 w-full py-3 px-4 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Activate Pro Edge
            </button>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-lime-200 text-slate-950 border-2 border-slate-950 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-extrabold">Enterprise Network</h3>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-slate-950 text-lime-200 rounded-sm">
                  100% Uptime SLA
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">
                Dedicated Anycast IP ranges, custom BGP peering, and 24/7 DDoS mitigation engineers.
              </p>

              <div className="mt-6">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  Select PoP Footprint
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['Global 300+', 'China + APAC', 'EU Sovereign'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPopTier(p)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border-2 border-slate-950 transition-colors ${
                        popTier === p
                          ? 'bg-slate-950 text-lime-200'
                          : 'bg-white text-slate-950 hover:bg-lime-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold">
                {[
                  '500 TB+ committed bandwidth rates',
                  'Real-time raw log push to S3 / Datadog',
                  'Custom mTLS origin certificates',
                  '15-minute P1 incident engineering SLA',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-teal-900" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-800">Footprint: {popTier}</span>
              <button
                type="button"
                onClick={() => setSelected(`Enterprise Network (${popTier})`)}
                className="px-6 py-3 rounded-lg bg-teal-950 text-white text-sm font-bold hover:bg-teal-900 transition-colors whitespace-nowrap"
              >
                Request Custom PoP Quote
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-bold text-slate-950 bg-lime-300 rounded-lg px-4 py-2.5">
            GridScale configuration queued: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
