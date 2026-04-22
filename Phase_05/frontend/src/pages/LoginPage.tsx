import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { OrganicBackground } from '../components/OrganicBackground';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useAuth();
  const { t } = useLanguage();

  const from = location.state?.from || '/';
  const loginMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      await refreshSession();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-gray-50 relative">
      <OrganicBackground variant="minimal" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center -mb-2">
          <img src="/osomba-logo.png" alt="Osomba" className="h-48 w-auto" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#F67C01] to-[#F89C4A]" />
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('login.welcome')}</h1>
              <p className="mt-1 text-sm text-gray-500">{t('login.subtitle')}</p>
            </div>

            {loginMessage && <div className="p-3 text-sm text-[#B45309] bg-orange-50 rounded-lg">{loginMessage}</div>}
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('login.email')}</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder={t('login.email_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('login.password')}</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder={t('login.password_placeholder')}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#F67C01] hover:bg-[#d56b01] text-white">
                {loading ? t('login.signing_in') : t('login.sign_in')}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};
