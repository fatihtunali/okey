'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('E-posta veya şifre hatalı');
      } else {
        onSuccess?.();
      }
    } catch {
      setError('Giriş sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          required
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/10 border border-white/20',
            'text-white placeholder-white/40',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'transition-all'
          )}
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Şifre
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/10 border border-white/20',
            'text-white placeholder-white/40',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'transition-all'
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full py-3 rounded-xl font-bold text-lg',
          'bg-gradient-to-r from-amber-500 to-amber-600',
          'hover:from-amber-400 hover:to-amber-500',
          'text-stone-900',
          'transition-all hover:scale-[1.02] active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Giriş yapılıyor...
          </span>
        ) : (
          'Giriş Yap'
        )}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-stone-800 text-white/60">veya</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className={cn(
          'w-full py-3 rounded-xl font-medium',
          'bg-white text-gray-800',
          'hover:bg-gray-100',
          'transition-all hover:scale-[1.02] active:scale-[0.98]',
          'flex items-center justify-center gap-3'
        )}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google ile giriş yap
      </button>
    </form>
  );
}
