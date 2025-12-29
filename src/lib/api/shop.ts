import { getApi, postApi } from './client';

export interface ChipPackage {
  id: string;
  chips: number;
  price: number;
  currency: string;
  bonus: number;
  popular: boolean;
}

export interface VipPackage {
  id: string;
  tier: string;
  durationDays: number;
  price: number;
  benefits: string[];
}

export interface Cosmetic {
  id: string;
  type: 'avatar' | 'tile_skin' | 'table_theme' | 'emote';
  code: string;
  name: string;
  previewUrl: string | null;
  priceChips: number;
  rarity: string;
  isVipOnly: boolean;
  owned: boolean;
}

export async function getChipPackages(): Promise<ChipPackage[]> {
  return getApi<ChipPackage[]>('/api/shop/chips');
}

export async function purchaseChips(packageId: string): Promise<{ success: boolean; transactionId: string; chips: number }> {
  return postApi('/api/shop/chips/purchase', { packageId });
}

export async function getVipPackages(): Promise<VipPackage[]> {
  return getApi<VipPackage[]>('/api/shop/vip');
}

export async function purchaseVip(packageId: string): Promise<{ success: boolean; vipExpiry: string }> {
  return postApi('/api/shop/vip/purchase', { packageId });
}

export async function getCosmetics(type?: string): Promise<Cosmetic[]> {
  const url = type ? `/api/shop/cosmetics?type=${type}` : '/api/shop/cosmetics';
  return getApi<Cosmetic[]>(url);
}

export async function purchaseCosmetic(cosmeticId: string): Promise<{ success: boolean; cosmetic: { id: string; type: string; code: string } }> {
  return postApi(`/api/shop/cosmetics/${cosmeticId}/purchase`);
}
