import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface Card2Props {
  issue?: string;
  date?: string;
  isoDate?: string;
  readTime?: string;
  title?: string;
  excerpt?: string;
  author?: string;
  location?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function Card2({
  issue = 'Issue No. 19 · Material Studies',
  date = 'Nov 02, 2026',
  isoDate = '2026-11-02',
  readTime = '9 min essay',
  title = 'Notes on Uncoated Stoneware, Linen Texture, and Slow Firing',
  excerpt = 'In an era of flawless injection molding, small-kiln ceramicists in Kyoto and Oaxaca preserve surface irregularities that mark hand pressure and wood-ash drift.',
  author = 'Clara Lindholm',
  location = 'Copenhagen',
  imageSrc = '/src/assets/images/article_ceramics_editorial_1795319252529.jpg',
  imageAlt = 'Sculptural matte stoneware ceramic vessels arranged on natural linen under window shadows',
}: Card2Props) {
  const [opened, setOpened] = useState(false);

  return (
    <article className="group grid grid-cols-1 md:grid-cols-12 items-stretch bg-[#FAF8F4] border border-stone-300/80 rounded-xl overflow-hidden">
      <figure className="md:col-span-5 overflow-hidden border-b md:border-b-0 md:border-r border-stone-200">
        <CardMedia
          src={imageSrc}
          alt={imageAlt}
          aspectClass="aspect-[4/3] md:aspect-auto md:h-full"
          fallbackTone="warm"
        />
      </figure>

      <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <span className="font-medium text-stone-800">{issue}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={isoDate}>{date}</time>
            <span aria-hidden="true">/</span>
            <span>{readTime}</span>
          </div>

          <h3
            className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-stone-900 text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            {excerpt}
          </p>

          {opened && (
            <p className="mt-4 pt-4 border-t border-stone-200 text-xs leading-relaxed text-stone-600 italic">
              Excerpt from Section II: “Reduction cooling across thirty-six hours allows iron speckles to surface organically without synthetic glaze seals.”
            </p>
          )}
        </div>

        <footer className="pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
          <div className="text-xs text-stone-600">
            <span className="font-semibold text-stone-900">{author}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{location}</span>
          </div>

          <button
            type="button"
            onClick={() => setOpened((prev) => !prev)}
            aria-expanded={opened}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 border border-stone-900 rounded-lg hover:bg-stone-900 hover:text-stone-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            <span>{opened ? 'Hide Excerpt' : 'Read Essay'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </article>
  );
}
