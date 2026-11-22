import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface Card3Props {
  name?: string;
  role?: string;
  discipline?: string;
  city?: string;
  bio?: string;
  email?: string;
  avatarSrc?: string;
}

export function Card3({
  name = 'Nadia Alverez',
  role = 'Design Director',
  discipline = 'Brand & Type Systems',
  city = 'Zurich',
  bio = 'Leads multi-script typographic architecture and editorial monograph commissions for cultural institutions.',
  email = 'nadia@atelier-nord.ch',
  avatarSrc = '/src/assets/images/portrait_creative_director_1795319252339.jpg',
}: Card3Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
            <CardMedia
              src={avatarSrc}
              alt={`Portrait of ${name}, ${role}`}
              aspectClass="aspect-square"
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 truncate">{name}</h3>
            <p className="text-xs font-medium text-zinc-700 truncate">{role}</p>
            <p className="mt-1 text-xs text-zinc-500 truncate">
              {discipline} · {city}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600">{bio}</p>
      </div>

      <footer className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-500 truncate">{email}</span>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy Email</span>
            </>
          )}
        </button>
      </footer>
    </article>
  );
}
