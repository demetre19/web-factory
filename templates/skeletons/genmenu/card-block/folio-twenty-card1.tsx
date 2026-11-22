import { useState } from 'react';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface Card1Props {
  category?: string;
  date?: string;
  isoDate?: string;
  readTime?: string;
  title?: string;
  excerpt?: string;
  authorName?: string;
  authorRole?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function Card1({
  category = 'Spatial Design',
  date = 'Oct 14, 2026',
  isoDate = '2026-10-14',
  readTime = '6 min read',
  title = 'Daylight Geometry in Timber and Cast Concrete Galleries',
  excerpt = 'How north-facing clerestory apertures calibrate luminance across quiet exhibition rooms without mechanical glare.',
  authorName = 'Elena Vance',
  authorRole = 'Architectural Editor',
  imageSrc = '/src/assets/images/article_architecture_vertical_1795319252279.jpg',
  imageAlt = 'Minimalist concrete and warm oak architectural gallery bathed in angled daylight',
}: Card1Props) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="group flex flex-col justify-between bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors duration-200 hover:border-zinc-300">
      <div>
        <figure className="overflow-hidden border-b border-zinc-100">
          <CardMedia src={imageSrc} alt={imageAlt} aspectClass="aspect-[4/3]" />
        </figure>

        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-700">{category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={isoDate}>{date}</time>
            <span aria-hidden="true">·</span>
            <span>{readTime}</span>
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-zinc-900 text-balance">
            {title}
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">
            {excerpt}
          </p>

          {expanded && (
            <p className="mt-3 pt-3 border-t border-zinc-100 text-xs leading-relaxed text-zinc-600">
              Field measurements recorded between 09:00 and 15:00 show a 38% reduction in artificial track lighting load across seasonal equinoxes.
            </p>
          )}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-900 truncate">{authorName}</p>
          <p className="text-xs text-zinc-500 truncate">{authorRole}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSaved((prev) => !prev)}
            aria-pressed={saved}
            aria-label={saved ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
              saved
                ? 'bg-zinc-900 border-zinc-900 text-white'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            <span>{expanded ? 'Close Note' : 'Read Note'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </article>
  );
}
