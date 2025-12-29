'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const user = session.user as any;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-xl',
          'bg-white/10 hover:bg-white/20',
          'border border-white/20',
          'transition-all'
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
          {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
        </div>

        {/* User info */}
        <div className="text-left hidden sm:block">
          <div className="text-white font-medium text-sm truncate max-w-[120px]">
            {user.name || 'Oyuncu'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-bold">
              🪙 {user.chips?.toLocaleString() || 1000}
            </span>
            {user.isVip && (
              <span className="bg-amber-500 text-stone-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                VIP
              </span>
            )}
          </div>
        </div>

        {/* Dropdown arrow */}
        <svg
          className={cn(
            'w-4 h-4 text-white/60 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-stone-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-white font-medium">{user.name}</div>
            <div className="text-white/50 text-sm truncate">{user.email}</div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 border-b border-white/10 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-amber-400 font-bold">🪙 {user.chips?.toLocaleString() || 1000}</div>
              <div className="text-white/50 text-xs">Chip</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">⭐ {user.rating || 1000}</div>
              <div className="text-white/50 text-xs">Rating</div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ayarlar
            </a>
            <a
              href="/shop"
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mağaza
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 py-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
