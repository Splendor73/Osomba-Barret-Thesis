import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, confirmRegistration } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(email, password, name);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
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
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{step === 'confirm' ? 'Verify Email' : 'Create an Account'}</h1>
        </div>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
        
        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <Input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#46BB39] hover:bg-[#3ca330]">
              {loading ? 'Creating...' : 'Register'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">We've sent a verification code to {email}.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code</label>
              <Input 
                type="text" 
                required 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#46BB39] hover:bg-[#3ca330]">
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        )}
        
        {step === 'register' && (
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-[#F67C01] hover:underline">
              Sign in here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
