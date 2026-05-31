'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  FeedingStatus,
  ReproductiveStatus,
  type CowQuery,
  type CreateCowDto,
  type UpdateCowDto,
} from '@pecus/types';
import {
  listCows,
  getCow,
  createCow,
  updateCow,
  deleteCow,
  updateFeeding,
  updateReproduction,
  getDashboard,
  getInsights,
} from './api';

export const queryKeys = {
  cows: (query: CowQuery) => ['cows', query] as const,
  cow: (id: string) => ['cow', id] as const,
  dashboard: ['dashboard'] as const,
  insights: ['insights'] as const,
};

export function useCows(query: CowQuery) {
  return useQuery({
    queryKey: queryKeys.cows(query),
    queryFn: () => listCows(query),
    placeholderData: (prev) => prev,
  });
}

export function useCow(id: string) {
  return useQuery({
    queryKey: queryKeys.cow(id),
    queryFn: () => getCow(id),
    enabled: !!id,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
    refetchInterval: 15_000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: getInsights,
    refetchInterval: 20_000,
  });
}

function useInvalidateHerd() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['cows'] });
    qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    qc.invalidateQueries({ queryKey: queryKeys.insights });
  };
}

export function useCreateCow() {
  const invalidate = useInvalidateHerd();
  return useMutation({
    mutationFn: (dto: CreateCowDto) => createCow(dto),
    onSuccess: invalidate,
  });
}

export function useUpdateCow(id: string) {
  const invalidate = useInvalidateHerd();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCowDto) => updateCow(id, dto),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.cow(id) });
    },
  });
}

export function useDeleteCow() {
  const invalidate = useInvalidateHerd();
  return useMutation({
    mutationFn: (id: string) => deleteCow(id),
    onSuccess: invalidate,
  });
}

export function useFeedCow() {
  const invalidate = useInvalidateHerd();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cowId,
      estado,
    }: {
      cowId: string;
      estado?: FeedingStatus;
    }) => updateFeeding(cowId, estado),
    onSuccess: (_d, vars) => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.cow(vars.cowId) });
    },
  });
}

export function useUpdateReproduction() {
  const invalidate = useInvalidateHerd();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cowId,
      estado,
    }: {
      cowId: string;
      estado: ReproductiveStatus;
    }) => updateReproduction(cowId, estado),
    onSuccess: (_d, vars) => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.cow(vars.cowId) });
    },
  });
}
