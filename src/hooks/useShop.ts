'use client';

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import * as api from '@/lib/api/shop';

export function useChipPackages() {
  return useApi(
    useCallback(() => api.getChipPackages(), []),
    []
  );
}

export function usePurchaseChips() {
  return useMutation(api.purchaseChips);
}

export function useVipPackages() {
  return useApi(
    useCallback(() => api.getVipPackages(), []),
    []
  );
}

export function usePurchaseVip() {
  return useMutation(api.purchaseVip);
}

export function useCosmetics(type?: string) {
  return useApi(
    useCallback(() => api.getCosmetics(type), [type]),
    [type]
  );
}

export function usePurchaseCosmetic() {
  return useMutation(api.purchaseCosmetic);
}
