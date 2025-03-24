// stores/battles.ts
import { defineStore } from 'pinia';
import { useMutation } from '@pinia/colada';
import { z } from 'zod';

// Define the types for our battle data
export type BattleOption = {
  id: string;
  content: string;
  battleId: string;
  score: number;
};

export type Battle = {
  id: string;
  title: string;
  createdAt: number;
  options: BattleOption[];
};

export const useBattlesStore = defineStore('battles', () => {
  // Mutation to create a new battle
  const createBattleMutation = useMutation({
    // Define the mutation function that calls our API
    mutation: async (data: { title: string; options: string[] }): Promise<Battle> => {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create battle');
      }
      
      return response.json();
    }
  });

  return {
    createBattleMutation
  };
});
