import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  minimal?: boolean;
}

export function Header({ onSearch, showSearch = true, minimal = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <a href="/" className="text-[#2563EB]" style={{ fontWeight: 700, fontSize: '20px' }}>
              Somba Forum
            </a>
          </div>

          {/* Center Search - Desktop */}
          {showSearch && !minimal && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-gray-700 hover:text-[#2563EB] transition-colors">
              Sign In
            </button>
            <button className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors">
              Ask Question
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && !minimal && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <a href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              Home
            </a>
            <a href="/ai-help" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              AI Help
            </a>
            <a href="/post" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              Post Question
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
