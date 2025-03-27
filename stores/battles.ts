// stores/battles.ts
import { defineStore } from 'pinia';
import { useMutation, useQuery, useQueryCache } from '@pinia/colada';

// Types
export type TitleOption = {
  id: string;
  battleId: string;
  content: string;
  score: number;
};

export type Battle = {
  id: string;
  title: string;
  createdAt: number;
  options: TitleOption[];
};

export type VoteResponse = {
  winner: {
    id: string;
    content: string;
    newScore: number;
    oldScore: number;
  };
  loser: {
    id: string;
    content: string;
    newScore: number;
    oldScore: number;
  };
};

// Création d'un store Pinia standard qui utilise Pinia Colada à l'intérieur
export const useBattlesStore = defineStore('battles', () => {
  // Accès au cache des requêtes pour l'invalidation
  const queryCache = useQueryCache();

  // Requête pour récupérer toutes les battles
  const getAllBattles = useQuery({
    key: ['battles'],
    query: async () => {
      try {
        const response = await fetch('/api/battles');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch battles: ${response.status}`);
        }
        
        return await response.json() as Battle[];
      } catch (error) {
        console.error('Error fetching battles:', error);
        return [] as Battle[];
      }
    },
    staleTime: 2 * 1000, // 2 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  // Requête pour récupérer une battle spécifique
  const getBattle = (battleId: string) => {
    return useQuery({
      key: ['battle', battleId],
      query: async () => {
        const response = await fetch(`/api/battles/${battleId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch battle: ${response.status}`);
        }
        
        return await response.json() as Battle;
      }
    });
  };

  // Mutation pour créer une nouvelle battle
  const createBattleMutation = useMutation({
    mutation: async (data: { title: string; options: string[] }) => {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create battle');
      }
      
      return await response.json() as Battle;
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  // Mutation pour voter
  const submitVote = useMutation({
    mutation: async ({ battleId, winnerId, loserId }: { 
      battleId: string;
      winnerId: string;
      loserId: string;
    }) => {
      const response = await fetch(`/api/battles/${battleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      return await response.json() as VoteResponse;
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  // Mutation pour supprimer une battle
  const deleteBattle = useMutation({
    mutation: async (battleId: string) => {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete battle');
      }
      
      return await response.json();
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  // Mutation pour mettre à jour une battle
  const updateBattle = useMutation({
    mutation: async ({ battleId, title, options }: {
      battleId: string;
      title: string;
      options: TitleOption[];
    }) => {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, options })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update battle');
      }
      
      return await response.json() as Battle;
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['battles'] });
    }
  });

  // Retourne toutes les actions et queries du store
  return {
    getAllBattles,
    getBattle,
    createBattleMutation,
    submitVote,
    deleteBattle,
    updateBattle
  };
});
