import { Menu, X, BarChart3, User, Shield, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Vector from "../imports/Vector";

interface HeaderProps {
  minimal?: boolean;
}

export function Header({ minimal = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-100">
        {/* Subtle organic accent at top */}
        <div className="absolute top-0 right-0 w-64 h-32 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-8 -right-8 scale-[0.3]">
            <Vector />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-[#F67C01] to-[#46BB39] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-gray-900 font-bold text-xl hidden sm:block">
                  Osomba <span className="text-[#F67C01]">Forum</span>
                </span>
              </a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/agent-dashboard')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-colors font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Agent</span>
              </button>
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
              <button 
                onClick={() => {/* Navigate to profile */}}
                className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[#F67C01] to-[#46BB39] rounded-full hover:shadow-lg transition-all hover:scale-105"
                title="Profile"
              >
                <User className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  navigate('/agent-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-all font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Agent Dashboard</span>
              </button>
              <button
                onClick={() => {
                  navigate('/admin/analytics');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-all font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/post')}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-full shadow-2xl hover:shadow-[#F67C01]/50 transition-all font-semibold hover:scale-110 group"
        aria-label="Ask Question"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        <span className="hidden sm:inline">Ask Question</span>
      </button>
    </>
  );
}