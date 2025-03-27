// composables/useResultsPage.ts
import { ref, computed } from 'vue';
import { useClipboard, useTimeoutFn } from '@vueuse/core';

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

export function useResultsPage(battleId: string) {
  const isLoading = ref(true);
  const battle = ref<Battle | null>(null);
  const sortedOptions = ref<TitleOption[]>([]);
  const toast = useToast();
  const { copy: copyToClipboard, copied } = useClipboard();

  // Message pour le gagnant
  const winnerMessages = [
    "Champion !",
    "Grand vainqueur",
    "Titre imbattable",
    "Le meilleur choix",
    "Excellente option"
  ];
  const winnerMessage = ref('');

  // Vérifier si des données sont disponibles
  const hasResults = computed(() => sortedOptions.value.length > 0);

  // Obtenir le titre gagnant
  const winnerTitle = computed(() => 
    hasResults.value ? sortedOptions.value[0].content : null
  );

  // Obtenir le score du gagnant
  const winnerScore = computed(() => 
    hasResults.value ? sortedOptions.value[0].score : null
  );

  // Fonction pour copier le titre dans le presse-papiers avec VueUse
  function copyTitleToClipboard(title: string) {
    copyToClipboard(title);
    
    const { start } = useTimeoutFn(() => {
      if (copied.value) {
        toast.add({
          title: 'Titre copié !',
          description: 'Le titre a été copié dans le presse-papiers',
          icon: 'i-heroicons-clipboard-document-check',
          color: 'success',
        });
      } else {
        toast.add({
          title: 'Erreur',
          description: 'Impossible de copier le titre',
          icon: 'i-heroicons-exclamation-circle',
          color: 'error',
        });
      }
    }, 100); // Petit délai pour s'assurer que copied.value est mis à jour
    
    start();
  }

  // Fonction pour obtenir un message aléatoire
  function getRandomWinnerMessage() {
    const randomIndex = Math.floor(Math.random() * winnerMessages.length);
    return winnerMessages[randomIndex];
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
      winnerMessage.value = getRandomWinnerMessage();
      
      return response;
    } catch (error) {
      console.error('Error fetching battle results:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Fonction pour partager les résultats
  function shareResults() {
    if (!battle.value || !winnerTitle.value) return;
    
    const text = `Résultats de la battle "${battle.value.title}" : Le titre gagnant est "${winnerTitle.value}" !`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Résultats de la battle',
        text,
        url
      }).catch(err => {
        console.error('Error sharing results:', err);
      });
    } else {
      copyToClipboard(`${text} ${url}`);
      toast.add({
        title: 'Lien copié !',
        description: 'Le lien des résultats a été copié dans le presse-papiers',
        icon: 'i-heroicons-link',
        color: 'info',
      });
    }
  }

  return {
    battle,
    sortedOptions,
    isLoading,
    winnerMessage,
    winnerTitle,
    winnerScore,
    hasResults,
    copyTitleToClipboard,
    fetchBattle,
    shareResults,
  };
}
