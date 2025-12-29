'use client';

import { useChipPackages, usePurchaseChips } from '@/hooks/useShop';
import { cn } from '@/lib/utils';

interface ChipPackagesProps {
  onPurchaseComplete?: () => void;
}

export function ChipPackages({ onPurchaseComplete }: ChipPackagesProps) {
  const { data: packages, isLoading, error } = useChipPackages();
  const purchaseChips = usePurchaseChips();

  const handlePurchase = async (packageId: string) => {
    try {
      await purchaseChips.mutateAsync(packageId);
      onPurchaseComplete?.();
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Paketler yüklenirken hata oluştu
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        Şu an satın alınabilir paket yok
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={cn(
            'relative flex flex-col items-center p-4 rounded-xl border transition hover:scale-[1.02]',
            pkg.popular
              ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500/50'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          )}
        >
          {pkg.popular && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-stone-900 text-xs font-bold rounded-full">
              POPÜLER
            </div>
          )}

          {pkg.bonus > 0 && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
              +{pkg.bonus}%
            </div>
          )}

          <div className="text-4xl mb-2">💰</div>
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {pkg.chips.toLocaleString()}
          </div>
          <div className="text-sm text-white/60 mb-3">Chip</div>

          <button
            onClick={() => handlePurchase(pkg.id)}
            disabled={purchaseChips.isPending}
            className={cn(
              'w-full py-2 rounded-lg font-bold transition',
              pkg.popular
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-900'
                : 'bg-white/10 hover:bg-white/20 text-white'
            )}
          >
            {pkg.price} TL
          </button>
        </div>
      ))}
    </div>
  );
}
