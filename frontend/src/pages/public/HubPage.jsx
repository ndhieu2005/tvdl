import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const TILES = [
  { label: 'VỀ THƯ VIỆN', to: '/about', dark: false },
  { label: 'LỊCH HOẠT ĐỘNG', to: '/schedule', dark: true },
  { label: 'DỊCH VỤ THƯ VIỆN', to: '/services', dark: true },
  { label: 'TIN TỨC', to: '/news', dark: false },
];

export default function HubPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <h1 className="text-hero font-bold text-blue leading-none">
          Chào mừng bạn<span className="text-yellow">!</span>
        </h1>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2">
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`flex items-center justify-center py-8 px-12 text-nav font-semibold tracking-widest uppercase transition-opacity hover:opacity-90 ${
              tile.dark
                ? 'bg-blue text-white'
                : 'bg-yellow text-blue'
            }`}
          >
            <span className="mr-3">→</span>
            {tile.label}
          </Link>
        ))}
      </div>

      {/* Search bar */}
      <Link
        to="/search"
        className="flex items-center justify-center gap-3 py-5 bg-dark text-white text-nav font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity"
      >
        <Search size={16} />
        TÌM KIẾM
      </Link>
    </div>
  );
}
