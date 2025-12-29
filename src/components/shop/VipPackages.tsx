'use client';

import { useVipPackages, usePurchaseVip } from '@/hooks/useShop';
import { cn } from '@/lib/utils';

interface VipPackagesProps {
  onPurchaseComplete?: () => void;
}

export function VipPackages({ onPurchaseComplete }: VipPackagesProps) {
  const { data: packages, isLoading, error } = useVipPackages();
  const purchaseVip = usePurchaseVip();

  const handlePurchase = async (packageId: string) => {
    try {
      await purchaseVip.mutateAsync(packageId);
      onPurchaseComplete?.();
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        VIP paketleri yüklenirken hata oluştu
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        Şu an VIP paketi yok
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    bronze: 'from-orange-700 to-orange-900 border-orange-600',
    silver: 'from-gray-400 to-gray-600 border-gray-400',
    gold: 'from-amber-400 to-amber-600 border-amber-400',
    platinum: 'from-cyan-400 to-cyan-600 border-cyan-400',
  };

  const tierEmojis: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={cn(
            'relative flex flex-col items-center p-5 rounded-xl border-2 transition hover:scale-[1.02]',
            `bg-gradient-to-b ${tierColors[pkg.tier] || tierColors.bronze}`
          )}
        >
          <div className="text-5xl mb-3">{tierEmojis[pkg.tier] || '⭐'}</div>
          <div className="text-xl font-bold text-white mb-1 uppercase">
            {pkg.tier} VIP
          </div>
          <div className="text-sm text-white/80 mb-4">
            {pkg.durationDays} Gün
          </div>

          <ul className="text-sm text-white/90 space-y-1 mb-4 text-center">
            {pkg.benefits?.slice(0, 3).map((benefit, i) => (
              <li key={i}>✓ {benefit}</li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase(pkg.id)}
            disabled={purchaseVip.isPending}
            className="w-full py-2 bg-black/30 hover:bg-black/40 text-white font-bold rounded-lg transition"
          >
            {pkg.price} TL
          </button>
        </div>
      ))}
    </div>
  );
}
