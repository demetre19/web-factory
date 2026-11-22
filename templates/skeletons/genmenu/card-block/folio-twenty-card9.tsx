import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface ProductFinish {
  label: string;
  price: number;
  swatchClass: string;
}

export interface Card9Props {
  collection?: string;
  name?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  finishes?: ProductFinish[];
}

const DEFAULT_FINISHES: ProductFinish[] = [
  { label: 'Brushed Aluminum', price: 340, swatchClass: 'bg-zinc-300' },
  { label: 'Obsidian Matte', price: 365, swatchClass: 'bg-zinc-900' },
  { label: 'Warm Brass', price: 390, swatchClass: 'bg-amber-600' },
];

export function Card9({
  collection = 'Edition 04 · Lighting',
  name = 'Monolith Articulated Lamp',
  subtitle = 'Machined 6061 aluminum · 2700K CRI 97 · Weighted limestone base',
  imageSrc = '/src/assets/images/product_monolith_lamp_1795319252333.jpg',
  imageAlt = 'Minimalist brushed anodized aluminum architectural desk lamp on limestone surface',
  finishes = DEFAULT_FINISHES,
}: Card9Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const activeFinish = finishes[selectedIndex] ?? finishes[0];

  return (
    <article className="group bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between">
      <div>
        <figure className="border-b border-zinc-100">
          <CardMedia src={imageSrc} alt={imageAlt} aspectClass="aspect-[4/3]" />
        </figure>

        <div className="p-6">
          <p className="text-xs font-medium text-zinc-500">{collection}</p>

          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight text-zinc-900">
              {name}
            </h3>
            <span className="text-base font-semibold font-mono tabular-nums text-zinc-900 shrink-0">
              ${activeFinish.price}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-zinc-600">{subtitle}</p>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 mb-2">
              Finish: <span className="font-medium text-zinc-900">{activeFinish.label}</span>
            </p>
            <div className="flex items-center gap-2" role="group" aria-label={`Select finish for ${name}`}>
              {finishes.map((finish, idx) => (
                <button
                  key={finish.label}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setAdded(false);
                  }}
                  aria-label={finish.label}
                  aria-pressed={idx === selectedIndex}
                  className={`w-7 h-7 rounded-full border p-0.5 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                    idx === selectedIndex
                      ? 'border-zinc-900 scale-105'
                      : 'border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <span className={`block w-full h-full rounded-full ${finish.swatchClass}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="px-6 pb-6">
        <button
          type="button"
          onClick={() => setAdded((prev) => !prev)}
          aria-pressed={added}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
            added
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Added to Bag · {activeFinish.label}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add to Bag — ${activeFinish.price}</span>
            </>
          )}
        </button>
      </footer>
    </article>
  );
}
