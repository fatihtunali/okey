'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Şifre en az bir büyük harf içermeli');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Şifre en az bir rakam içermeli');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kayıt sırasında bir hata oluştu');
        return;
      }

      // Success - switch to login
      onSuccess?.();
    } catch {
      setError('Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          İsim
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız"
          required
          minLength={2}
          maxLength={50}
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
        {password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all',
                    level <= passwordStrength
                      ? passwordStrength <= 1
                        ? 'bg-red-500'
                        : passwordStrength <= 2
                        ? 'bg-yellow-500'
                        : passwordStrength <= 3
                        ? 'bg-green-400'
                        : 'bg-green-500'
                      : 'bg-white/20'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-white/50 mt-1">
              En az 8 karakter, 1 büyük harf ve 1 rakam
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Şifre Tekrar
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/10 border border-white/20',
            'text-white placeholder-white/40',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'transition-all',
            confirmPassword && password !== confirmPassword && 'border-red-500/50 focus:ring-red-500'
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
            Kayıt yapılıyor...
          </span>
        ) : (
          'Kayıt Ol'
        )}
      </button>

      <p className="text-center text-white/50 text-xs">
        Kayıt olarak{' '}
        <a href="#" className="text-amber-400 hover:underline">
          Kullanım Koşulları
        </a>
        {' '}ve{' '}
        <a href="#" className="text-amber-400 hover:underline">
          Gizlilik Politikası
        </a>
        &apos;nı kabul etmiş olursunuz.
      </p>
    </form>
  );
}
