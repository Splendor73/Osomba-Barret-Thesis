import { Menu, X, BarChart3, User, Shield, Plus, LogOut, LogIn, UserPlus, Globe, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Vector from "../imports/Vector";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface HeaderProps {
  minimal?: boolean;
  showSearch?: boolean;
}

export function Header({ minimal = false, showSearch = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
              <a href="/" className="flex items-center gap-3 group ml-17">
                <img
                  src="/osomba-logo.png"
                  alt="Osomba"
                  className="h-30 w-auto"
                />
              </a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-colors font-medium border border-gray-100"
                title="Toggle Language"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs">{language}</span>
              </button>
              {(role === 'agent' || role === 'admin') && (
                <button 
                  onClick={() => navigate('/agent-dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-colors font-medium"
                  title="Agent Dashboard"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Agent</span>
                </button>
              )}
              {role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center mr-2">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || user?.username || 'User'}
                    </span>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 capitalize border border-gray-200">
                      {role || 'Customer'}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-center w-11 h-11 bg-white border border-gray-200 text-gray-600 rounded-full hover:shadow-md hover:bg-gray-50 transition-all hover:scale-105"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="flex items-center justify-center w-11 h-11 bg-white border border-gray-200 text-gray-600 rounded-full hover:shadow-md hover:bg-gray-50 transition-all hover:scale-105"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F67C01] to-[#46BB39] text-white rounded-lg transition-transform hover:scale-105 font-medium shadow-md">
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full left-0 z-50">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated && (
                <div className="mb-4 pb-4 border-b border-gray-100 px-4">
                  <p className="font-medium text-gray-900">{user?.name || user?.username || 'User'}</p>
                  <p className="text-sm text-gray-500 capitalize">{role || 'Customer'}</p>
                </div>
              )}
              
              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'fr' : 'en');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-all font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>Language: <span className="uppercase">{language}</span></span>
              </button>
              
              {(role === 'agent' || role === 'admin') && (
                <button
                  onClick={() => {
                    navigate('/agent-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#46BB39] hover:bg-green-50 rounded-lg transition-all font-medium"
                >
                  <BarChart3 className="w-4 h-4 text-[#46BB39]" />
                  <span>Agent Dashboard</span>
                </button>
              )}
              {role === 'admin' && (
                <button
                  onClick={() => {
                    navigate('/admin/analytics');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-all font-medium"
                >
                  <Shield className="w-4 h-4 text-[#F67C01]" />
                  <span>Admin Dashboard</span>
                </button>
              )}
              
              <div className="pt-2 mt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In</span>
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-[#F67C01] hover:bg-orange-50 rounded-lg transition-all font-medium mt-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating Action Button */}
      <button
        onClick={() => isAuthenticated ? navigate('/post') : navigate('/login')}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-full shadow-2xl hover:shadow-[#F67C01]/50 transition-all font-semibold hover:scale-110 group"
        aria-label={t('nav.ask_question')}
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        <span className="hidden sm:inline">{t('nav.ask_question')}</span>
      </button>
    </>
  );
}