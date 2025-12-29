'use client';

import { useState } from 'react';
import { useCosmetics, usePurchaseCosmetic } from '@/hooks/useShop';
import { cn } from '@/lib/utils';

type CosmeticType = 'all' | 'avatar' | 'tile_skin' | 'table_theme' | 'emote';

interface CosmeticsStoreProps {
  onPurchaseComplete?: () => void;
}

export function CosmeticsStore({ onPurchaseComplete }: CosmeticsStoreProps) {
  const [filter, setFilter] = useState<CosmeticType>('all');
  const { data: cosmetics, isLoading, error, refetch } = useCosmetics(filter === 'all' ? undefined : filter);
  const purchaseCosmetic = usePurchaseCosmetic();

  const handlePurchase = async (cosmeticId: string) => {
    try {
      await purchaseCosmetic.mutateAsync(cosmeticId);
      refetch();
      onPurchaseComplete?.();
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  const filters: { value: CosmeticType; label: string }[] = [
    { value: 'all', label: 'Tümü' },
    { value: 'avatar', label: 'Avatarlar' },
    { value: 'tile_skin', label: 'Taş Teması' },
    { value: 'table_theme', label: 'Masa Teması' },
    { value: 'emote', label: 'İfadeler' },
  ];

  const typeEmojis: Record<string, string> = {
    avatar: '👤',
    tile_skin: '🎴',
    table_theme: '🎨',
    emote: '😄',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition',
              filter === f.value
                ? 'bg-amber-500 text-stone-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          Kozmetikler yüklenirken hata oluştu
        </div>
      ) : !cosmetics || cosmetics.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          Bu kategoride kozmetik yok
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cosmetics.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-xl border transition',
                item.owned
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:scale-[1.02]'
              )}
            >
              {item.owned && (
                <div className="absolute top-2 right-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="text-4xl mb-2">
                {typeEmojis[item.type] || '🎁'}
              </div>
              <div className="text-sm font-medium text-white text-center mb-1">
                {item.name}
              </div>
              <div className="text-xs text-white/50 mb-3 capitalize">
                {item.rarity}
              </div>

              {item.owned ? (
                <button
                  disabled
                  className="w-full py-1.5 bg-green-500/20 text-green-400 text-sm font-medium rounded-lg"
                >
                  Sahipsin
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(item.id)}
                  disabled={purchaseCosmetic.isPending}
                  className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition"
                >
                  💰 {item.priceChips.toLocaleString()}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
