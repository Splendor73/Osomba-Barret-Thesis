import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, confirmRegistration } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { OrganicBackground } from '../components/OrganicBackground';
import { useLanguage } from '../context/LanguageContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(email, password, name);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || t('register.error_register'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmRegistration(email, code);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || t('register.error_verify'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 relative">
      <OrganicBackground variant="minimal" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/osomba-logo.png" alt="Osomba" className="h-30 w-auto mb-2" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#46BB39] to-[#F67C01]" />
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 'confirm' ? t('register.verify_email') : t('register.create_account')}
              </h1>
              {step === 'register' && (
                <p className="mt-1 text-sm text-gray-500">{t('register.subtitle')}</p>
              )}
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            {step === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('register.full_name')}</label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    placeholder={t('register.name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('register.email')}</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder={t('register.email_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('register.password')}</label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    placeholder={t('register.password_placeholder')}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#46BB39] hover:bg-[#3ca330] text-white">
                  {loading ? t('register.creating') : t('register.register')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <p className="text-sm text-gray-600 text-center">{t('register.verify_sent')} {email}.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('register.verification_code')}</label>
                  <Input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1"
                    placeholder={t('register.code_placeholder')}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#46BB39] hover:bg-[#3ca330] text-white">
                  {loading ? t('register.verifying') : t('register.verify_email')}
                </Button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
