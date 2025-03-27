<!-- pages/test.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import type { CreateBattleRequest } from '~/types';

// Get all battles query
const { data: battles, asyncStatus, status, refresh } = useAllBattles();

// Get mutations
const { createBattle, deleteBattle } = useBattleMutations();


// Form state for creating a new battle
const newBattleTitle = ref('');
const newBattleOptions = ref('');

// Create battle function
const handleCreateBattle = () => {
  if (!newBattleTitle.value || !newBattleOptions.value) return;
  
  const options = newBattleOptions.value.split('\n').filter(opt => opt.trim());
  
  if (options.length < 2) {
    alert('At least 2 options are required');
    return;
  }
  
  const battleData: CreateBattleRequest = {
    title: newBattleTitle.value,
    options
  };
  
  createBattle.mutate(battleData);
  
  // Reset form
  newBattleTitle.value = '';
  newBattleOptions.value = '';
};

// Handle delete
const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this battle?')) {
    deleteBattle.mutate(id);
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Title Arena - API Test</h1>
    
    <!-- Create battle form -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-xl mb-2">Create New Battle</h2>
      <div class="mb-2">
        <label class="block mb-1">Title:</label>
        <input 
          v-model="newBattleTitle" 
          type="text" 
          class="w-full p-2 border rounded"
          placeholder="Battle title"
        />
      </div>
      <div class="mb-2">
        <label class="block mb-1">Options (one per line):</label>
        <textarea 
          v-model="newBattleOptions" 
          class="w-full p-2 border rounded"
          rows="4"
          placeholder="Enter options, one per line"
        ></textarea>
      </div>
      <button 
        @click="handleCreateBattle" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        :disabled="createBattle.asyncStatus as unknown as string === 'loading'"
      >
        {{ createBattle.isLoading ? 'Creating...' : 'Create Battle' }}
      </button>
    </div>
    
    <!-- Battles List -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl">Battles</h2>
        <button 
          @click="refresh()" 
          class="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
          :disabled="asyncStatus === 'loading'"
        >
          {{ status === 'pending' ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
      
      <!-- Loading state -->
      <div v-if="status === 'pending' && !battles" class="text-center py-8">
        Loading battles...
      </div>
      
      <!-- Error state -->
      <div v-else-if="!battles && status !== 'pending'" class="text-center py-8 text-red-500">
        Error loading battles
      </div>
      
      <!-- Data -->
      <div v-else-if="battles && battles.length === 0" class="text-center py-8 text-gray-500">
        No battles found. Create one above!
      </div>
      
      <div v-else-if="battles" class="grid gap-4">
        <div 
          v-for="battle in battles" 
          :key="battle.id" 
          class="border rounded p-4"
        >
          <div class="flex justify-between">
            <h3 class="text-lg font-semibold">{{ battle.title }}</h3>
            <div class="flex space-x-2">
              <NuxtLink 
                :to="`/battles/${battle.id}`" 
                class="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
              >
                View
              </NuxtLink>
              <button 
                @click="handleDelete(battle.id)" 
                class="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-500">
            <p>{{ battle.titleOptions.length }} options • {{ battle.voteCount }} votes</p>
          </div>
          <div class="mt-2">
            <div v-for="option in battle.titleOptions.slice(0, 3)" :key="option.id" class="text-sm">
              {{ option.content }} ({{ option.score }})
            </div>
            <div v-if="battle.titleOptions.length > 3" class="text-sm text-gray-500">
              And {{ battle.titleOptions.length - 3 }} more options...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
