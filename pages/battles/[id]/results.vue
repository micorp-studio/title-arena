<!-- pages/battles/[id]/results.vue -->
<script setup lang="ts">
import { h, onMounted, ref, nextTick } from 'vue';
import type { TableColumn } from '@nuxt/ui';

// Types
type TitleOption = {
  id: string;
  content: string;
  score: number;
  rank?: number;
};

type Battle = {
  id: string;
  title: string;
  createdAt: number;
  options: TitleOption[];
};

// État
const route = useRoute();
const battleId = route.params.id as string;
const isLoading = ref(true);
const battle = ref<Battle | null>(null);
const sortedOptions = ref<TitleOption[]>([]);
const toast = useToast();
const { showWinnerConfetti } = useConfetti();

// Message pour le gagnant
const winnerMessages = [
  "Champion !",
  "Grand vainqueur",
  "Titre imbattable",
  "Le meilleur choix",
  "Excellente option"
];
const winnerMessage = ref('');

// Emoji pour les premières places
const rankEmojis = ["🏆", "🥈", "🥉"];

// Fonction pour copier le titre dans le presse-papiers
function copyTitleToClipboard(title: string) {
  navigator.clipboard.writeText(title).then(() => {
    toast.add({
      title: 'Titre copié !',
      description: 'Le titre a été copié dans le presse-papiers',
      icon: 'i-heroicons-clipboard-document-check',
      color: 'success',
    });
  }).catch(err => {
    console.error('Erreur lors de la copie :', err);
    toast.add({
      title: 'Erreur',
      description: 'Impossible de copier le titre',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    });
  });
}

// Charger les données de la battle
async function fetchBattle() {
  isLoading.value = true;
  try {
    const response = await $fetch<Battle>(`/api/battles/${battleId}`);
    battle.value = response;
    
    // Trier les options par score et ajouter le rang
    const options = [...response.options].sort((a, b) => b.score - a.score);
    sortedOptions.value = options.map((option, index) => ({
      ...option,
      rank: index + 1
    }));
    
    // Choisir un message aléatoire pour le gagnant
    winnerMessage.value = winnerMessages[Math.floor(Math.random() * winnerMessages.length)];
    
    // Attendre que le DOM soit prêt pour lancer les confettis
    nextTick(() => {
      showWinnerConfetti();
    });
    
  } catch (error) {
    console.error('Error fetching battle results:', error);
  } finally {
    isLoading.value = false;
  }
}

// Définir les colonnes du tableau
const columns: TableColumn<TitleOption>[] = [
  {
    id: 'rank',
    header: 'Rang',
    cell: ({ row }) => {
      const rank = row.original.rank;
      if (rank === undefined) return '';
      
      return h('div', { 
        class: 'flex justify-center items-center h-10'
      }, [
        h('div', { 
          class: 'flex items-center justify-center relative'
        }, [
          // Numéro de rang
          h('span', { 
            class: `font-bold ${
              rank === 1 ? 'text-primary text-lg' : 
              rank === 2 ? 'text-secondary text-lg' : 
              rank === 3 ? 'text-warning text-lg' : 
              'text-gray-500'
            }`
          }, `${rank}`),
          
          // Médaille à côté du numéro
          rank <= 3 ? h('span', { 
            class: 'ml-2'
          }, rankEmojis[rank - 1]) : null
        ])
      ]);
    }
  },
  {
    accessorKey: 'content',
    header: () => h('div', { class: 'flex items-center' }, [
      h('span', {}, 'Titre'),
      h('span', { class: 'ml-2 text-xs text-gray-500' }, '(cliquer pour copier)')
    ]),
    cell: ({ row }) => {
      const rank = row.original.rank;
      const content = row.getValue('content') as string;
      
      if (rank === undefined) return content;
      
      return h('button', { 
        class: `font-medium text-left w-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800/50 px-2 py-1 rounded ${
          rank === 1 ? 'text-primary text-lg cursor-pointer' : 
          rank === 2 ? 'text-secondary cursor-pointer' : 
          rank === 3 ? 'text-warning cursor-pointer' : 
          'text-gray-500 dark:text-gray-400 cursor-pointer'
        }`,
        onClick: () => copyTitleToClipboard(content),
        title: 'Cliquer pour copier ce titre'
      }, content);
    }
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const rank = row.original.rank;
      
      return h('div', { 
        class: `text-right font-mono ${
          rank === 1 ? 'text-lg font-bold text-primary' : 
          rank === 2 ? 'font-bold text-secondary' : 
          rank === 3 ? 'font-bold text-warning' : 
          'text-gray-500 dark:text-gray-400'
        }`
      }, row.getValue('score'));
    }
  }
];

// Charger les données au montage du composant
onMounted(fetchBattle);
</script>

<template>
  <UContainer class="py-8">
    <!-- Loading state -->
    <UCard v-if="isLoading" class="text-center py-8">
      <div class="flex flex-col items-center">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mb-4" />
        <p>Chargement des résultats...</p>
      </div>
    </UCard>
    
    <!-- Results content -->
    <template v-else-if="battle">
      <div class="mb-6">
        <UBreadcrumb :items="[
          { label: 'Battles', to: '/' },
          { label: battle.title },
          { label: 'Résultats' }
        ]" />
      </div>
      
      <UCard>
        <template #header>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 class="text-xl font-bold">{{ battle.title }}</h1>
              <p class="text-sm text-gray-500">Classement des titres</p>
            </div>
            <UButton 
              :to="`/battles/${battleId}/vote`"
              color="primary"
              variant="outline"
              icon="i-heroicons-hand-thumb-up"
            >
              Voter encore
            </UButton>
          </div>
        </template>
        
        <!-- Winner spotlight (centered, with visual effects) -->
        <div v-if="sortedOptions.length > 0" id="confetti-container" class="my-8 max-w-2xl mx-auto">
          <div class="text-center p-6 bg-primary-50 dark:bg-primary-950/30 rounded-lg border-(1 primary-200 dark:primary-800) relative shadow-lg">
            <!-- Glow effect -->
            <div class="absolute inset-0 rounded-lg glow-effect"></div>
            
            <!-- Trophée avec étincelles pulsantes -->
            <div class="flex justify-center mb-4">
              <div class="relative inline-block">
                <UIcon name="i-heroicons-trophy" class="text-6xl text-primary" />
                <span class="absolute -top-2 -right-1 text-2xl spark-pulsate">✨</span>
                <span class="absolute top-6 left-2 text-sm rotate-180 spark-pulsate-delay">✨</span>
              </div>
            </div>
            
            <!-- Message de podium avec badge, légèrement pivoté -->
            <div class="transform -rotate-3 -translate-y-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 shadow-sm">
              {{ winnerMessage }}
            </div>
            
            <!-- Contenu du titre gagnant -->
            <h3 class="text-xl sm:text-2xl font-bold text-primary mb-3 cursor-pointer relative z-10 px-4" 
                title="Cliquer pour copier ce titre"
                @click="copyTitleToClipboard(sortedOptions[0]?.content)">
              {{ sortedOptions[0]?.content }}
            </h3>
            <p class="text-primary-700 dark:text-primary-300 font-mono font-bold">
              Score: {{ sortedOptions[0]?.score }}
            </p>
          </div>
        </div>
        
        <!-- Results table -->
        <UTable 
          :data="sortedOptions" 
          :columns="columns"
          class="w-full"
          :ui="{
            tr: 'h-12 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 data-[rank=1]:bg-primary-50 data-[rank=1]:dark:bg-primary-950/20 data-[rank=2]:bg-secondary-50 data-[rank=2]:dark:bg-secondary-950/20 data-[rank=3]:bg-warning-50 data-[rank=3]:dark:bg-warning-950/20',
            th: 'px-4 py-3.5 text-sm text-(--ui-text-highlighted) text-left rtl:text-right font-semibold [&:has([role=checkbox])]:pe-0 whitespace-nowrap',
            td: 'p-2 sm:p-4 text-sm text-(--ui-text-muted) [&:has([role=checkbox])]:pe-0'
          }"
        >
          <!-- Empty state -->
          <template #empty>
            <div class="text-center py-10">
              <UIcon name="i-heroicons-face-frown" class="text-5xl mb-2 text-gray-400" />
              <h3 class="text-base font-medium mb-2">Aucun résultat</h3>
              <p class="text-sm text-gray-500 mb-4">
                Il semble qu'aucun vote n'ait encore été enregistré pour cette battle
              </p>
              <UButton :to="`/battles/${battleId}/vote`" icon="i-heroicons-hand-thumb-up" color="primary">
                Voter maintenant
              </UButton>
            </div>
          </template>
        </UTable>
        
        <template #footer>
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="text-sm text-gray-500">
              Le classement est basé sur le système ELO
            </p>
            <UButton
              to="/"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-arrow-left"
            >
              Retour aux battles
            </UButton>
          </div>
        </template>
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
/* Animation de pulsation pour les étincelles */
@keyframes sparkPulsate {
  0%, 100% {
    opacity: 0.0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2);
  }
}

.spark-pulsate {
  animation: sparkPulsate 2s ease-in-out infinite;
}

.spark-pulsate-delay {
  animation: sparkPulsate 3s ease-in-out 1s infinite;
}

/* Effet de lueur */
.glow-effect {
  box-shadow: 0 0 15px 5px rgba(var(--color-primary-500), 0.3),
              0 0 30px 10px rgba(var(--color-primary-500), 0.1);
  opacity: 0.5;
  z-index: 0;
}

/* Media queries pour le responsive */
@media (max-width: 640px) {
  .glow-effect {
    box-shadow: 0 0 10px 3px rgba(var(--color-primary-500), 0.3);
  }
}
</style>
