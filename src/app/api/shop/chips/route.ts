import { NextResponse } from 'next/server';

// Chip packages - in production, store in database
const CHIP_PACKAGES = [
  { id: 'chips_1000', chips: 1000, price: 9.99, currency: 'TRY' },
  { id: 'chips_5000', chips: 5000, price: 39.99, currency: 'TRY' },
  { id: 'chips_10000', chips: 10000, price: 69.99, currency: 'TRY' },
  { id: 'chips_50000', chips: 50000, price: 299.99, currency: 'TRY' },
  { id: 'chips_100000', chips: 100000, price: 499.99, currency: 'TRY' },
];

// GET /api/shop/chips - List chip packages
export async function GET() {
  return NextResponse.json(CHIP_PACKAGES);
}
