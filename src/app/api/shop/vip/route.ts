import { NextResponse } from 'next/server';

// VIP packages
const VIP_PACKAGES = [
  {
    id: 'vip_7',
    days: 7,
    price: 29.99,
    benefits: [
      'Özel VIP avatarları',
      'Reklamsız oyun',
      'Günlük bonus çipler',
      'VIP masa erişimi',
    ],
  },
  {
    id: 'vip_30',
    days: 30,
    price: 99.99,
    benefits: [
      'Özel VIP avatarları',
      'Reklamsız oyun',
      'Günlük bonus çipler',
      'VIP masa erişimi',
      '%20 ekstra chip bonusu',
    ],
  },
  {
    id: 'vip_90',
    days: 90,
    price: 249.99,
    benefits: [
      'Özel VIP avatarları',
      'Reklamsız oyun',
      'Günlük bonus çipler',
      'VIP masa erişimi',
      '%30 ekstra chip bonusu',
      'Özel masa temaları',
    ],
  },
  {
    id: 'vip_365',
    days: 365,
    price: 799.99,
    benefits: [
      'Özel VIP avatarları',
      'Reklamsız oyun',
      'Günlük bonus çipler',
      'VIP masa erişimi',
      '%50 ekstra chip bonusu',
      'Tüm özel temalar',
      'Öncelikli destek',
    ],
  },
];

// GET /api/shop/vip - List VIP packages
export async function GET() {
  return NextResponse.json(VIP_PACKAGES);
}
