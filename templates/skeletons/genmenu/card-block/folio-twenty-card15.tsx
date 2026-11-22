import { useState } from 'react';
import { UserPlus, UserCheck, MapPin } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface Card15Props {
  name?: string;
  handle?: string;
  location?: string;
  bio?: string;
  worksCount?: number;
  initialFollowers?: number;
  avatarSrc?: string;
}

export function Card15({
  name = 'Helena Brandt',
  handle = '@helenabrandt',
  location = 'Basel, Switzerland',
  bio = 'Editorial book designer and type researcher documenting Swiss grid systems from 1954 to 1982.',
  worksCount = 38,
  initialFollowers = 1240,
  avatarSrc = '/src/assets/images/portrait_creative_director_1795319252339.jpg',
}: Card15Props) {
  const [following, setFollowing] = useState(false);

  const followerCount = following ? initialFollowers + 1 : initialFollowers;

  return (
    <article className="bg-[#FAF8F4] border border-stone-300/80 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-stone-300 shrink-0">
            <CardMedia
              src={avatarSrc}
              alt={`Profile portrait of ${name}`}
              aspectClass="aspect-square"
              fallbackTone="warm"
            />
          </div>

          <button
            type="button"
            onClick={() => setFollowing((prev) => !prev)}
            aria-pressed={following}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
              following
                ? 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
            }`}
          >
            {following ? (
              <>
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4">
          <h3
            className="text-lg font-semibold text-stone-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {name}
          </h3>
          <p className="text-xs font-mono text-stone-500">{handle}</p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-stone-700">{bio}</p>
      </div>

      <footer className="pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
        <dl className="flex items-center gap-5 text-xs">
          <div>
            <dt className="text-stone-500">Works</dt>
            <dd className="font-semibold font-mono tabular-nums text-stone-900">
              {worksCount}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Followers</dt>
            <dd className="font-semibold font-mono tabular-nums text-stone-900">
              {followerCount.toLocaleString()}
            </dd>
          </div>
        </dl>

        <span className="inline-flex items-center gap-1 text-xs text-stone-600 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </span>
      </footer>
    </article>
  );
}
