const LINK_GOOGLE_MAPS =
  'https://www.google.com/maps/search/?api=1&query=The+Seventies+Artesanal+Burger+R.+Wenceslau+Braz+167+S%C3%A3o+Louren%C3%A7o+MG';

function Estrela({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.5l2.59 5.25 5.8.84-4.2 4.09.99 5.77L10 14.7l-5.18 2.75.99-5.77-4.2-4.09 5.8-.84L10 1.5z" />
    </svg>
  );
}

export default function GoogleRatingBadge({ className = '' }) {
  return (
    <a
      href={LINK_GOOGLE_MAPS}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      <span className="font-black text-sv-dark text-sm">4,9</span>
      <span className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Estrela key={i} className="w-3.5 h-3.5" />
        ))}
      </span>
      <span className="text-gray-400 text-xs font-bold">no Google</span>
    </a>
  );
}
