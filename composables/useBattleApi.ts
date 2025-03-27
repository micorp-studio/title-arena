// composables/useBattlesAPI.ts
import { defineQuery, useMutation, useQueryCache } from '@pinia/colada';
import { useRoute } from 'vue-router'; // Explicit import as recommended
import type { 
  Battle, 
  TitleOption, 
  CreateBattleRequest, 
  UpdateBattleRequest, 
  VoteRequest, 
  VoteResponse 
} from '~/types';

/**
 * Queries for fetching battles data
 */
export const useAllBattles = defineQuery({
  key: ['battles'],
  query: () => fetch('/api/battles').then(r => r.json() as Promise<Battle[]>),
  staleTime: 0, // Always consider data stale to ensure freshness
  refetchOnWindowFocus: true
});

/**
 * Get a single battle by ID
 */
export const useBattleDetails = defineQuery(() => {
  const route = useRoute();
  
  return {
    key: () => ['battle', route.params.id as string],
    query: () => fetch(`/api/battles/${route.params.id}`).then(r => r.json() as Promise<Battle>),
    enabled: () => !!route.params.id,
  };
});

/**
 * Get battle for voting interface (separate cache key to avoid refreshing during voting)
 */
export const useBattleForVoting = defineQuery(() => {
  const route = useRoute();
  
  return {
    key: () => ['battle-voting', route.params.id as string],
    query: () => fetch(`/api/battles/${route.params.id}`).then(r => r.json() as Promise<Battle>),
    enabled: () => !!route.params.id,
    staleTime: 5000, // Cache for 5 seconds to avoid refreshing between votes
  };
});

/**
 * Mutations for battle operations
 */
export function useBattleMutations() {
  const queryCache = useQueryCache();

  /**
   * Create a new battle
   */
  const createBattle = useMutation({
    key: ['createBattle'], // Key for allowing other components to access the mutation state
    mutation: (data: CreateBattleRequest) => 
      fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json() as Promise<Battle>),
    onSuccess: () => {
      // Invalidate the battles list query
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  /**
   * Update an existing battle
   */
  const updateBattle = useMutation({
    key: ['updateBattle'],
    mutation: ({ id, ...data }: UpdateBattleRequest & { id: string }) => 
      fetch(`/api/battles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json() as Promise<Battle>),
    onSuccess: (_, variables) => {
      // Invalidate both the specific battle and the list
      queryCache.invalidateQueries({ key: ['battle', variables.id] });
      queryCache.invalidateQueries({ key: ['battle-voting', variables.id] });
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  /**
   * Delete a battle
   */
  const deleteBattle = useMutation({
    key: ['deleteBattle'],
    mutation: (id: string) => 
      fetch(`/api/battles/${id}`, {
        method: 'DELETE'
      }).then(r => r.json()),
    onSuccess: () => {
      // Invalidate the battles list query
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  /**
   * Submit a vote
   */
  const submitVote = useMutation({
    key: ['submitVote'],
    mutation: ({ battleId, winnerId, loserId }: VoteRequest & { battleId: string }) => 
      fetch(`/api/battles/${battleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId })
      }).then(r => r.json() as Promise<VoteResponse>),
    onSuccess: (_, variables) => {
      // Invalidate specific battle queries
      queryCache.invalidateQueries({ key: ['battle', variables.battleId] });
      queryCache.invalidateQueries({ key: ['battle-voting', variables.battleId] });
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  return {
    createBattle,
    updateBattle,
    deleteBattle,
    submitVote
  };
}
