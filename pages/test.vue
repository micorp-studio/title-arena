<!-- pages/test.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import type { CreateBattleRequest } from '~/types';

// Get all battles query with proper destructuring
const { 
  data: battles, 
  asyncStatus,
  state,
  refresh 
} = useAllBattles();

// Get mutations with proper destructuring
const { 
  createBattle: { 
    mutate: createBattleMutate,
    state: createBattleState,
    asyncStatus: createBattleAsyncStatus
  },
  deleteBattle: {
    mutate: deleteBattleMutate
  } 
} = useBattleMutations();

// Counter to demonstrate invalidation
const refreshCount = ref(0);

// Simple predefined battle data
const simpleBattle: CreateBattleRequest = {
  title: `Test Battle ${new Date().toLocaleTimeString()}`,
  options: [
    "Option A - Created at " + new Date().toLocaleTimeString(),
    "Option B - Created at " + new Date().toLocaleTimeString()
  ]
};

// Create a test battle with predefined data
const handleCreateSimpleBattle = () => {
  createBattleMutate(simpleBattle);
};

// Handle manual refresh and increment counter
const handleRefresh = async () => {
  await refresh();
  refreshCount.value++;
};

// Handle delete
const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this battle?')) {
    deleteBattleMutate(id);
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Title Arena - API Test</h1>
    
    <!-- Simple create button -->
    <div class="mb-6 p-4 border rounded">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl">Create Test Battle</h2>
        <div class="text-sm text-gray-500">
          Refresh count: {{ refreshCount }}
        </div>
      </div>
      
      <div class="flex space-x-4">
        <button 
          @click="handleCreateSimpleBattle" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          :disabled="createBattleAsyncStatus === 'loading'"
        >
          {{ createBattleAsyncStatus === 'loading' ? 'Creating...' : 'Create Test Battle' }}
        </button>
        
        <button 
          @click="handleRefresh" 
          class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          :disabled="asyncStatus === 'loading'"
        >
          {{ asyncStatus === 'loading' ? 'Refreshing...' : 'Refresh List' }}
        </button>
      </div>
      
      <!-- Show mutation status when active -->
      <div v-if="createBattleState.status === 'success'" class="mt-2 text-green-500">
        Battle created successfully!
      </div>
      <div v-else-if="createBattleState.status === 'error'" class="mt-2 text-red-500">
        Error: {{ createBattleState.error?.message }}
      </div>
    </div>
    
    <!-- Battles List with clear status handling -->
    <div class="border rounded p-4">
      <h2 class="text-xl mb-4">Battles</h2>
      
      <!-- Loading state -->
      <div v-if="state.status === 'pending'" class="text-center py-8">
        Loading battles...
      </div>
      
      <!-- Error state -->
      <div v-else-if="state.status === 'error'" class="text-center py-8 text-red-500">
        Error: {{ state.error?.message }}
      </div>
      
      <!-- Empty state -->
      <div v-else-if="state.data?.length === 0" class="text-center py-8 text-gray-500">
        No battles found. Create one above!
      </div>
      
      <!-- Data display -->
      <div v-else class="grid gap-4">
        <div 
          v-for="battle in state.data" 
          :key="battle.id" 
          class="border rounded p-4"
        >
          <div class="flex justify-between">
            <h3 class="text-lg font-semibold">{{ battle.title }}</h3>
            <button 
              @click="handleDelete(battle.id)" 
              class="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
          
          <div class="mt-2">
            <div v-for="option in battle.titleOptions" :key="option.id" class="text-sm">
              {{ option.content }} ({{ option.score }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
