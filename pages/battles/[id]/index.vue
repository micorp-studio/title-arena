<!-- pages/battles/[id]/index.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBattlesStore } from '~/stores/battles';
import type { TitleOption } from '~/stores/battles';

// Routes et navigation
const route = useRoute();
const toast = useToast();
const battleId = route.params.id as string;

// Store et données
const battlesStore = useBattlesStore();
const battleQuery = battlesStore.getBattle(battleId);
const isLoading = computed(() => battleQuery.asyncStatus.value === 'loading');
const battle = computed(() => battleQuery.data.value);

// État local pour les modifications
const isUpdating = ref(false);
const newTitle = ref('');
const newTitleOptions = ref<TitleOption[]>([]);
const newTitleInput = ref('');

// Initialiser les données d'édition
function initEditData() {
  if (battle.value) {
    newTitle.value = battle.value.title;
    newTitleOptions.value = [...battle.value.options];
  }
}

// Ajouter une nouvelle option de titre
function addTitleOption() {
  if (!newTitleInput.value.trim()) return;
  
  // Créer une nouvelle option avec un ID temporaire
  const newOption: TitleOption = {
    id: `temp-${Date.now()}`,
    battleId: battleId,
    content: newTitleInput.value.trim(),
    score: 1000 // Score par défaut
  };
  
  newTitleOptions.value.push(newOption);
  newTitleInput.value = '';
}

// Supprimer une option de titre
function removeTitleOption(index: number) {
  newTitleOptions.value.splice(index, 1);
}

// Mise à jour de la battle
async function updateBattle() {
  if (!battle.value) return;
  
  isUpdating.value = true;
  
  try {
    // Utiliser une mutation pour mettre à jour la battle
    await battlesStore.updateBattle.mutateAsync({
      battleId,
      title: newTitle.value,
      options: newTitleOptions.value
    });
    
    toast.add({
      title: 'Battle mise à jour',
      description: 'Les modifications ont été enregistrées avec succès',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });
    
    // Rafraîchir les données
    await battleQuery.refetch();
  } catch (error) {
    console.error('Error updating battle:', error);
    toast.add({
      title: 'Erreur',
      description: 'Impossible de mettre à jour la battle',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    });
  } finally {
    isUpdating.value = false;
  }
}

// Gestionnaire de raccourci clavier pour ajouter une option
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    addTitleOption();
  }
}

// Initialiser les données quand la bataille est chargée
watch(() => battle.value, (newBattle) => {
  if (newBattle) {
    initEditData();
  }
}, { immediate: true });
</script>

<template>
  <UContainer class="py-8">
    <!-- Loading state -->
    <UCard v-if="isLoading" class="text-center py-8">
      <div class="flex flex-col items-center">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mb-4" />
        <p>Chargement de la battle...</p>
      </div>
    </UCard>
    
    <!-- Edit battle content -->
    <template v-else-if="battle">
      <div class="mb-6">
        <UBreadcrumb :items="[
          { label: 'Battles', to: '/' },
          { label: battle.title }
        ]" />
      </div>
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Éditer la battle</h1>
        
        <div class="flex gap-2">
          <UButton
            :to="`/battles/${battleId}/vote`"
            color="primary"
            variant="outline"
            icon="i-heroicons-hand-thumb-up"
          >
            Voter
          </UButton>
          <UButton
            :to="`/battles/${battleId}/results`"
            color="primary"
            variant="outline"
            icon="i-heroicons-chart-bar"
          >
            Résultats
          </UButton>
        </div>
      </div>
      
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Informations de la battle</h2>
            <p class="text-sm text-gray-500">Créée le {{ new Date(battle.createdAt * 1000).toLocaleDateString() }}</p>
          </div>
        </template>
        
        <!-- Titre de la battle -->
        <div class="mb-6">
          <UFormField label="Titre de la battle" required>
            <UInput
              v-model="newTitle"
              placeholder="Entrez le titre de la battle"
              :error="newTitle.trim() === '' ? 'Le titre est requis' : undefined"
            />
          </UFormField>
        </div>
        
        <!-- Liste des options de titres -->
        <div class="mb-6">
          <UFormField label="Options de titres" required>
            <div class="border rounded-lg divide-y">
              <TransitionGroup name="list">
                <div 
                  v-for="(option, index) in newTitleOptions" 
                  :key="option.id"
                  class="flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ option.content }}</p>
                    <p class="text-xs text-gray-500">Score: {{ option.score }}</p>
                  </div>
                  <UButton
                    icon="i-heroicons-trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeTitleOption(index)"
                  />
                </div>
              </TransitionGroup>
              
              <!-- Message si aucune option -->
              <div v-if="newTitleOptions.length === 0" class="p-4 text-center text-gray-500 italic">
                Aucune option de titre. Ajoutez-en au moins deux pour les votes.
              </div>
            </div>
          </UFormField>
        </div>
        
        <!-- Ajouter une nouvelle option -->
        <div class="mb-4">
          <UFormField label="Ajouter une option">
            <div class="flex gap-2">
              <UInput
                v-model="newTitleInput"
                placeholder="Entrez un nouveau titre"
                class="flex-1"
                @keydown="handleKeydown"
              />
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                @click="addTitleOption"
                :disabled="!newTitleInput.trim()"
              >
                Ajouter
              </UButton>
            </div>
          </UFormField>
        </div>
        
        <template #footer>
          <div class="flex justify-between items-center">
            <div>
              <p v-if="newTitleOptions.length < 2" class="text-sm text-error">
                Vous devez avoir au moins 2 options pour permettre le vote.
              </p>
            </div>
            
            <div class="flex gap-2">
              <UButton
                to="/"
                variant="ghost"
                color="neutral"
              >
                Annuler
              </UButton>
              <UButton
                color="primary"
                :loading="isUpdating"
                :disabled="isUpdating || newTitle.trim() === '' || newTitleOptions.length < 2"
                @click="updateBattle"
                icon="i-heroicons-check"
              >
                Enregistrer
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
      
      <!-- Actions supplémentaires -->
      <UCard class="mt-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium">Partagez cette battle</h3>
            <p class="text-sm text-gray-500">Invitez d'autres personnes à voter</p>
          </div>
        </div>
      </UCard>
    </template>
    
    <!-- Battle not found -->
    <UCard v-else class="text-center py-8">
      <div class="flex flex-col items-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl mb-4 text-yellow-500" />
        <p class="mb-4">Battle introuvable</p>
        <UButton to="/" icon="i-heroicons-arrow-left">Retour au tableau de bord</UButton>
      </div>
    </UCard>
  </UContainer>
</template>

<style>
/* Animation pour les ajouts/suppressions d'éléments dans la liste */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
