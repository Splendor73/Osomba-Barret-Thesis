import { MoreVertical, X, BarChart3, Plus, LogOut, LogIn, Globe, Settings } from "lucide-react";
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
  const userName = user?.name || user?.email || user?.username || '';
  const userRoleLabel = t(`users.${role || 'customer'}`);

  const navigateToLoginForSupportWrite = () => {
    navigate('/login', {
      state: {
        from: { pathname: '/post' },
        message: t('login.support_write_required'),
      },
    });
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-32 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-8 -right-8 scale-[0.3]">
            <Vector />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-20">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <a href="https://osomba.com" aria-label="Go to Osomba marketplace home page" className="flex shrink-0 items-center">
                <img src="/osomba-logo.png" alt="Osomba" className="h-28 sm:h-32 w-auto" />
              </a>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
              {isAuthenticated && (
                <div className="min-w-0 flex items-center gap-2 mr-1 sm:mr-2">
                  <span className="max-w-[110px] sm:max-w-[140px] md:max-w-none truncate text-sm font-medium text-gray-700">
                    {userName}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 capitalize border border-gray-200">
                    {userRoleLabel}
                  </span>
                </div>
              )}

              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium border border-gray-100"
                title={t('nav.toggle_language')}
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs">{language}</span>
              </button>
              {(role === 'agent' || role === 'admin') && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  title={t('agent.dashboard')}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('agent.dashboard')}</span>
                </button>
              )}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/settings')}
                    className="hidden sm:flex items-center justify-center w-11 h-11 bg-white border border-gray-200 text-gray-600 rounded-full hover:shadow-md hover:bg-gray-50 transition-all hover:scale-105"
                    title={t('nav.settings')}
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="hidden sm:flex items-center justify-center w-11 h-11 bg-white border border-gray-200 text-gray-600 rounded-full hover:shadow-md hover:bg-gray-50 transition-all hover:scale-105"
                    title={t('nav.sign_out')}
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-lg font-medium shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm">{t('nav.login')}</span>
                  </Link>
                  <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-lg transition-transform hover:scale-105 font-medium shadow-md">
                    <LogIn className="w-4 h-4" />
                    <span>{t('nav.login')}</span>
                  </Link>
                </>
              )}

              <button
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <MoreVertical className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full left-0 z-50">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated && (
                <div className="mb-4 pb-4 border-b border-gray-100 px-4">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500 capitalize">{userRoleLabel}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'fr' : 'en');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-all font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>{t('nav.language')}: <span className="uppercase">{language}</span></span>
              </button>

              {(role === 'agent' || role === 'admin') && (
                <button
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-[#F67C01] hover:bg-orange-50 rounded-lg transition-all font-medium"
                >
                  <BarChart3 className="w-4 h-4 text-[#F67C01]" />
                  <span>{t('agent.dashboard')}</span>
                </button>
              )}

              <div className="pt-2 mt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t('nav.settings')}</span>
                    </button>
                    <button
                      onClick={async () => { await logout(); navigate('/'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.sign_out')}</span>
                    </button>
                  </>
                ) : (
                  <button
                      onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t('nav.log_in')}</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating Action Button */}
      <button
        onClick={() => isAuthenticated ? navigate('/post') : navigateToLoginForSupportWrite()}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white rounded-full shadow-2xl hover:shadow-[#F67C01]/50 transition-all font-semibold hover:scale-110 group"
        aria-label={t('nav.ask_question')}
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        <span className="hidden sm:inline">{t('nav.ask_question')}</span>
      </button>
    </>
  );
}
