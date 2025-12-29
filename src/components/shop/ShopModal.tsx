'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChipPackages } from './ChipPackages';
import { VipPackages } from './VipPackages';
import { CosmeticsStore } from './CosmeticsStore';

type Tab = 'chips' | 'vip' | 'cosmetics';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
}

export function ShopModal({ isOpen, onClose, defaultTab = 'chips' }: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const tabs: { value: Tab; label: string; icon: string }[] = [
    { value: 'chips', label: 'Chip Paketleri', icon: '💰' },
    { value: 'vip', label: 'VIP Üyelik', icon: '👑' },
    { value: 'cosmetics', label: 'Kozmetikler', icon: '🎨' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Mağaza</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2',
                activeTab === tab.value
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chips' && <ChipPackages />}
          {activeTab === 'vip' && <VipPackages />}
          {activeTab === 'cosmetics' && <CosmeticsStore />}
        </div>
      </div>
    </div>
  );
}
