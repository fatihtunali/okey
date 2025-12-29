'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Hadi Hep Beraber
          </h2>

          {/* Tabs */}
          <div className="flex bg-black/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                'flex-1 py-3 rounded-lg font-bold text-sm transition-all',
                activeTab === 'login'
                  ? 'bg-amber-500 text-stone-900 shadow-lg'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={cn(
                'flex-1 py-3 rounded-lg font-bold text-sm transition-all',
                activeTab === 'register'
                  ? 'bg-amber-500 text-stone-900 shadow-lg'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {activeTab === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={() => setActiveTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
