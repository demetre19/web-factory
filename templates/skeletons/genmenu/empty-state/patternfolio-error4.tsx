import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';

export function Error4() {
  const [sampleItems, setSampleItems] = useState(0);

  return (
    <main className="min-h-[680px] w-full bg-[#FAF8F5] text-stone-900 flex items-center justify-center p-6">
      <section aria-label="Empty shopping cart" className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex justify-center">
          <svg
            aria-hidden="true"
            width="148"
            height="136"
            viewBox="0 0 148 136"
            fill="none"
            className="text-stone-800"
          >
            <ellipse cx="74" cy="122" rx="44" ry="6" fill="#E7E5E4" />
            <path
              d="M36 44H112L104 114H44L36 44Z"
              fill="#FFFFFF"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M54 44V34C54 22.954 62.954 14 74 14C85.046 14 94 22.954 94 34V44"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M58 76H90" stroke="#A8A29E" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M66 88H82" stroke="#D6D3D1" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>

        {sampleItems > 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-left" role="status">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">
                Ceramic Pour-Over Kettle × {sampleItems}
              </span>
              <span className="text-sm font-mono tabular-nums text-stone-800">
                ${(sampleItems * 68).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Sample item added to verify cart transition. Empty the bag to return to the empty state.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSampleItems((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add another</span>
              </button>
              <button
                type="button"
                onClick={() => setSampleItems(0)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Empty bag</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
                Your shopping bag is empty
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                Explore our seasonal stoneware, linens, and kitchen tools. Items you add remain reserved for 24 hours.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSampleItems(1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Add sample item</span>
              </button>
              <button
                type="button"
                onClick={() => setSampleItems(1)}
                className="w-full sm:w-auto rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
              >
                Browse catalog
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
