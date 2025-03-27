<!-- pages/index.vue -->
<script setup lang="ts">
import { h } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useBattlesStore } from '~/stores/battles';
import type { Battle, TitleOption } from '~/stores/battles';

// Hooks et stores
const router = useRouter();
const toast = useToast();
const { formatDate, formatTitles, copyBattleLink } = useBattleHelpers();
const battlesStore = useBattlesStore();

// État pour la modale de suppression
const isDeleteModalOpen = ref(false);
const battleToDelete = ref<string | null>(null);
const isDeletingBattle = ref(false);

// État des données du tableau
const battles = computed(() => battlesStore.getAllBattles.data || []);
const isLoading = computed(() => battlesStore.getAllBattles.asyncStatus === 'loading');

// Navigation vers différentes sections d'une battle
function navigateTo(battleId: string, section: 'results' | 'vote' | 'edit' = 'results') {
  router.push(`/battles/${battleId}/${section}`);
}

// Demande de confirmation pour supprimer une battle
function confirmDelete(battleId: string, event: Event) {
  event.stopPropagation();
  battleToDelete.value = battleId;
  isDeleteModalOpen.value = true;
}

// Suppression d'une battle
async function deleteBattle() {
  if (!battleToDelete.value) return;
  
  isDeletingBattle.value = true;
  try {
    await battlesStore.deleteBattle.mutateAsync(battleToDelete.value);
    toast.add({
      title: 'Battle supprimée',
      description: 'La battle a été supprimée avec succès',
      color: 'success'
    });
    isDeleteModalOpen.value = false;
  } catch (error) {
    console.error('Error deleting battle:', error);
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer la battle',
      color: 'error'
    });
  } finally {
    isDeletingBattle.value = false;
    battleToDelete.value = null;
  }
}

// Définition des colonnes du tableau avec un type plus précis
type BattleWithOptions = Battle & { options: TitleOption[] };

const columns: TableColumn<BattleWithOptions>[] = [
  {
    accessorKey: 'title',
    header: 'Nom',
    cell: ({ row }) => h('div', { 
      class: 'font-medium' 
    }, row.getValue('title'))
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => h('div', {
      class: 'font-mono text-xs opacity-70'
    }, formatDate(row.getValue('createdAt')))
  },
  {
    accessorKey: 'options',
    header: 'Titres',
    cell: ({ row }) => {
      const options = row.original.options || [];
      return h('div', { 
        class: 'max-w-md truncate opacity-70 italic' 
      }, formatTitles(options));
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return h('div', { 'data-battle-id': row.original.id });
    }
  }
];

// Définition des étapes du guide
const guideSteps = [
  {
    icon: 'i-heroicons-plus-circle',
    title: 'Créez une Battle',
    description: 'Ajoutez différentes options de titres à comparer'
  },
  {
    icon: 'i-heroicons-hand-thumb-up',
    title: 'Votez & Partagez',
    description: "Invitez d'autres personnes à voter pour les meilleurs titres"
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Consultez les Résultats',
    description: 'Découvrez le classement selon le système ELO'
  }
];
</script>

<template>
  <div class="min-h-screen">
    <UContainer class="py-8 space-y-8">
      <!-- En-tête avec logo et bouton de création -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-primary font-mono mb-1">Title Arena</h1>
          <p class="text-sm opacity-70">Trouvez le meilleur titre pour vos projets par vote comparatif</p>
        </div>
        <UButton
          to="/new"
          icon="i-heroicons-plus"
          color="primary"
          size="md"
          class="glow-primary"
        >
          Nouvelle Battle
        </UButton>
      </div>
      
      <!-- Tableau des battles -->
      <UCard 
        class="bg-black/30 backdrop-blur-sm border border-white/5"
        :ui="{ body: 'p-0' }"
      >
        <UTable
          :data="battles"
          :columns="columns"
          :loading="isLoading"
          hover
          @select="(row) => navigateTo(row.original.id)"
          class="w-full"
          :ui="{
            th: 'font-mono text-xs uppercase tracking-wider opacity-50 px-4 py-3.5',
            tr: 'border-white/5 transition-colors hover:bg-white/5 hover:scale-101 hover:-translate-x-1 cursor-pointer ease-out duration-200 transition-all',
            td: 'px-4 py-3.5'
          }"
        >
          <!-- Actions personnalisées -->
          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-heroicons-link"
                color="secondary"
                variant="ghost"
                size="xs"
                @click.stop="copyBattleLink(row.original.id, 'vote', toast)"
                class="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Copier le lien de vote"
              />
              <UButton
                icon="i-heroicons-pencil-square"
                color="secondary"
                variant="ghost"
                size="xs"
                @click.stop="navigateTo(row.original.id, 'edit')"
                class="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Éditer la battle"
              />
              <UButton
                icon="i-heroicons-chart-bar"
                color="primary"
                variant="ghost"
                size="xs"
                @click.stop="navigateTo(row.original.id, 'results')"
                class="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Voir les résultats"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="xs"
                @click.stop="confirmDelete(row.original.id, $event)"
                class="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Supprimer la battle"
              />
            </div>
          </template>
          
          <!-- État vide -->
          <template #empty>
            <div class="text-center py-16 space-y-4">
              <UIcon name="i-heroicons-trophy" class="text-5xl opacity-30 mx-auto" />
              <div class="space-y-2">
                <h3 class="text-lg font-medium">Aucune battle</h3>
                <p class="text-sm opacity-70 max-w-md mx-auto">
                  Créez votre première battle pour commencer à trouver les meilleurs titres par vote comparatif
                </p>
                <UButton 
                  to="/new" 
                  icon="i-heroicons-plus" 
                  color="primary"
                  class="mt-4"
                >
                  Créer ma première battle
                </UButton>
              </div>
            </div>
          </template>
          
          <!-- État de chargement -->
          <template #loading>
            <div class="py-12 text-center space-y-4">
              <div class="dots-loader mx-auto">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <p class="text-sm opacity-70 font-mono">Chargement des battles...</p>
            </div>
          </template>
        </UTable>
      </UCard>
      
      <!-- Guide d'utilisation -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold opacity-80 font-mono">Comment ça marche ?</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard
            v-for="(step, index) in guideSteps"
            :key="index"
            class="bg-black/10 backdrop-blur-sm"
          >
            <div class="text-center p-4 space-y-3">
              <UIcon
                :name="step.icon"
                class="text-3xl text-primary mx-auto"
                :class="index === 0 ? 'glow-primary' : ''"
              />
              <h3 class="font-medium">{{ step.title }}</h3>
              <p class="text-sm opacity-70">
                {{ step.description }}
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
    
    <!-- Modal de confirmation de suppression -->
    <UModal
      v-model:open="isDeleteModalOpen"
      :ui="{
        overlay: 'bg-black/80 backdrop-blur-sm',
        content: 'bg-black border border-error/20 shadow-lg',
        header: 'border-b border-white/5 p-4',
        body: 'p-4 space-y-3',
        footer: 'border-t border-white/5 p-4 flex justify-end gap-2'
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-xl text-error" />
          <h3 class="text-lg font-medium">Confirmer la suppression</h3>
        </div>
      </template>
      
      <template #body>
        <p>Êtes-vous sûr de vouloir supprimer cette battle ?</p>
        <div class="bg-black/50 p-3 rounded-md text-sm opacity-70 border-l-2 border-error">
          Cette action est irréversible et tous les votes associés seront définitivement perdus.
        </div>
      </template>
      
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="isDeleteModalOpen = false"
          :disabled="isDeletingBattle"
        >
          Annuler
        </UButton>
        <UButton
          color="error"
          icon="i-heroicons-trash"
          :loading="isDeletingBattle"
          :disabled="isDeletingBattle"
          @click="deleteBattle"
        >
          Supprimer
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Animation de chargement élégante */
.dots-loader {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dots-loader .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--ui-primary);
  animation: pulse 1.5s ease-in-out infinite;
}

.dots-loader .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dots-loader .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
}

/* Effet de lueur pour les éléments mis en avant */
.glow-primary {
  box-shadow: 0 0 16px rgba(var(--color-primary-500), 0.3);
}
</style>
