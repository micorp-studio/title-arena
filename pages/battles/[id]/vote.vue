<!-- pages/battles/[id]/vote.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Types
type TitleOption = {
  id: string;
  content: string;
  score?: number;
};

type Battle = {
  id: string;
  title: string;
  createdAt: number;
  options: TitleOption[];
};

type Pair = {
  optionA: TitleOption | null;
  optionB: TitleOption | null;
};

// Messages aléatoires pour le feedback
const positiveMessages = [
  "Parfait !",
  "10/10",
  "Tip top",
  "Maxi buzz",
  "Turbo quali",
  "Excellent !",
  "Super choix",
  "Classe !",
  "Trop fort",
  "Génie !"
];

const negativeMessages = [
  "Nul",
  "Ça dégage",
  "Gênant",
  "Bof",
  "À revoir",
  "Sans intérêt",
  "Pas top",
  "Passable",
  "Médiocre",
  "Meh"
];

// États
const route = useRoute();
const battleId = route.params.id as string;
const toast = useToast();

const battle = ref<Battle | null>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const winnerCard = ref<'A' | 'B' | null>(null);
const loserCard = ref<'A' | 'B' | null>(null);
const animationComplete = ref(true);

// Messages de feedback
const winnerMessage = ref('');
const loserMessage = ref('');

// Tampons
const displayStamp = ref<'A' | 'B' | null>(null);

// Positions aléatoires pour les tampons
const winnerPosition = ref({ top: '10%', left: '10%', rotate: '0deg' });
const loserPosition = ref({ top: '10%', left: '10%', rotate: '0deg' });

const currentPair = ref<Pair>({
  optionA: null,
  optionB: null
});
const remainingPairs = ref<Array<[number, number]>>([]);
const totalPairs = ref(0);
const completedPairs = ref(0);
const completed = ref(false);

// Générer une position aléatoire pour un tampon
function generateRandomPosition() {
  const top = `${10 + Math.floor(Math.random() * 60)}%`;
  const left = `${10 + Math.floor(Math.random() * 60)}%`;
  const rotate = `${-20 + Math.floor(Math.random() * 40)}deg`;
  return { top, left, rotate };
}

// Choisir tampon de gauche ou droite
function chooseStamp(): 'A' | 'B' {
  return Math.random() < 0.5 ? 'A' : 'B';
}

// Choisir un message aléatoire
function getRandomMessage(positive: boolean): string {
  const messages = positive ? positiveMessages : negativeMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Fetch battle data
async function fetchBattle(): Promise<void> {
  isLoading.value = true;
  try {
    const response = await $fetch<Battle>(`/api/battles/${battleId}`);
    battle.value = response;
    initVoting();
  } catch (error) {
    console.error('Error fetching battle:', error);
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la battle',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
  }
}

// Initialize voting session
function initVoting(): void {
  if (!battle.value || !battle.value.options || battle.value.options.length < 2) {
    return;
  }
  
  const options = battle.value.options;
  const pairs: Array<[number, number]> = [];
  
  // Create all possible pairs
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      pairs.push([i, j]);
    }
  }
  
  // Update state variables
  totalPairs.value = pairs.length;
  completedPairs.value = 0;
  remainingPairs.value = shuffleArray(pairs);
  completed.value = false;
  
  // Start with first pair
  getNextPair();
}

// Shuffle array randomly
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Get next pair to compare
function getNextPair(): void {
  if (remainingPairs.value.length === 0) {
    completed.value = true;
    return;
  }
  
  const [indexA, indexB] = remainingPairs.value.pop()!;
  const options = battle.value!.options;
  
  currentPair.value = {
    optionA: options[indexA],
    optionB: options[indexB]
  };

  // Reset animation state for new pair
  animationComplete.value = true;
  winnerCard.value = null;
  loserCard.value = null;
}

// Submit a vote with visual feedback
async function submitVote(winnerId: string, loserId: string, winner: 'A' | 'B', loser: 'A' | 'B'): Promise<void> {
  if (isSubmitting.value || !animationComplete.value) return;
  
  isSubmitting.value = true;
  animationComplete.value = false;
  
  // Set up feedback
  winnerCard.value = winner;
  loserCard.value = loser;
  winnerMessage.value = getRandomMessage(true);
  loserMessage.value = getRandomMessage(false);
  winnerPosition.value = generateRandomPosition();
  loserPosition.value = generateRandomPosition();

  // Choose stamp
  displayStamp.value = chooseStamp();
  
  try {
    // Faire l'appel API en parallèle avec l'animation
    const votePromise = $fetch(`/api/battles/${battleId}/vote`, {
      method: 'POST',
      body: {
        winnerId,
        loserId
      }
    });
    
    // Montrer les effets de feedback
    // Attendre moins longtemps pour accélérer
    setTimeout(async () => {
      // S'assurer que l'appel API est terminé
      await votePromise;
      
      // Update progress
      completedPairs.value++;
      
      // Attendre un peu moins pour accélérer
      setTimeout(() => {
        winnerCard.value = null;
        loserCard.value = null;
        
        // Transition plus rapide
        setTimeout(() => {
          getNextPair();
          isSubmitting.value = false;
          animationComplete.value = true;
        }, 200);
      }, 600);
    }, 300);
  } catch (error) {
    handleVoteError(error);
  }
}

function handleVoteError(error: any): void {
  console.error('Error submitting vote:', error);
  toast.add({
    title: 'Erreur',
    description: 'Impossible de soumettre votre vote',
    color: 'error'
  });
  winnerCard.value = null;
  loserCard.value = null;
  isSubmitting.value = false;
  animationComplete.value = true;
}

// Progress percentage
const progressPercentage = computed((): number => {
  if (totalPairs.value === 0) return 0;
  return Math.round((completedPairs.value / totalPairs.value) * 100);
});

// Fetch data on component mount
onMounted(fetchBattle);
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
    
    <!-- Battle content when loaded -->
    <div v-else-if="battle">
      <div class="mb-6">
        <UBreadcrumb :items="[
          { label: 'Battles', to: '/' },
          { label: battle.title, to: `/battles/${battleId}/results` },
          { label: 'Vote' }
        ]" />
      </div>
  
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold">{{ battle.title }}</h1>
            <UButton 
              v-if="!completed"
              to="/" 
              variant="ghost" 
              color="neutral"
            >
              Quitter
            </UButton>
          </div>
        </template>
  
        <!-- Voting interface -->
        <div v-if="!completed && currentPair.optionA && currentPair.optionB" class="py-4">
          <!-- Progress bar -->
          <div class="mb-6">
            <UProgress 
              :model-value="completedPairs" 
              :max="totalPairs"
              color="primary"
              size="lg"
              class="mb-2"
            />
            <div class="flex justify-between text-sm text-gray-500">
              <span>{{ progressPercentage }}% terminé</span>
              <span>{{ totalPairs - completedPairs }} comparaisons restantes</span>
            </div>
          </div>
          
          <p class="text-center mb-6 text-lg font-medium">Quel titre est le meilleur ?</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Option A -->
            <div class="relative">
              <UCard
                class="transition-all cursor-pointer border-(2 transparent) hover:border-primary overflow-hidden h-full"
                :class="[
                  winnerCard === 'A' ? 'z-10 scale-105 shadow-lg border-primary' : 
                  loserCard === 'A' ? 'scale-95 opacity-80' :
                  isSubmitting ? 'opacity-70' : 'hover:shadow-lg hover:scale-102'
                ]"
                @click="animationComplete && !isSubmitting && submitVote(currentPair.optionA!.id, currentPair.optionB!.id, 'A', 'B')"
              >
                <div class="p-6 text-center">
                  <h2 class="text-xl font-bold">{{ currentPair.optionA.content }}</h2>
                </div>
                
                <!-- Thumbs up/down sticker -->
                <div 
                  v-if="winnerCard === 'A'"
                  class="absolute -right-3 -top-3 w-16 h-16 opacity-0 animate-thumb-in"
                >
                  <div class="w-full h-full flex items-center justify-center bg-green-500 rounded-full text-white shadow-xl">
                    <UIcon name="i-heroicons-hand-thumb-up" class="text-2xl" />
                  </div>
                </div>
                
                <div 
                  v-if="loserCard === 'A'"
                  class="absolute -right-3 -top-3 w-16 h-16 opacity-0 animate-thumb-in"
                >
                  <div class="w-full h-full flex items-center justify-center bg-red-500 rounded-full text-white shadow-xl">
                    <UIcon name="i-heroicons-hand-thumb-down" class="text-2xl" />
                  </div>
                </div>
                
                <!-- Message stamp -->
                <div 
                  v-if="winnerCard === 'A' && displayStamp === 'A'"
                  class="absolute opacity-0 animate-stamp-in"
                  :style="{
                    top: winnerPosition.top, 
                    left: winnerPosition.left,
                    transform: `rotate(${winnerPosition.rotate})`
                  }"
                >
                  <div class="rounded-lg bg-green-300 px-3 py-1 text-md font-bold text-black border-2 border-green-600 shadow-xl">
                    {{ winnerMessage }}
                  </div>
                </div>
                
                <div 
                  v-if="loserCard === 'A' && displayStamp === 'A'"
                  class="absolute opacity-0 animate-stamp-in"
                  :style="{
                    top: loserPosition.top, 
                    left: loserPosition.left,
                    transform: `rotate(${loserPosition.rotate})`
                  }"
                >
                  <div class="rounded-lg bg-red-300 px-3 py-1 text-md font-bold text-black border-2 border-red-600 shadow-xl">
                    {{ loserMessage }}
                  </div>
                </div>
              </UCard>
            </div>
            
            <!-- Option B -->
            <div class="relative">
              <UCard
                class="transition-all cursor-pointer border-(2 transparent) hover:border-primary overflow-hidden h-full"
                :class="[
                  winnerCard === 'B' ? 'z-10 scale-105 shadow-lg border-primary' : 
                  loserCard === 'B' ? 'scale-95 opacity-80' :
                  isSubmitting ? 'opacity-70' : 'hover:shadow-lg hover:scale-102'
                ]"
                @click="animationComplete && !isSubmitting && submitVote(currentPair.optionB!.id, currentPair.optionA!.id, 'B', 'A')"
              >
                <div class="p-6 text-center">
                  <h2 class="text-xl font-bold">{{ currentPair.optionB.content }}</h2>
                </div>
                
                <!-- Thumbs up/down sticker -->
                <div 
                  v-if="winnerCard === 'B'"
                  class="absolute -right-3 -top-3 w-16 h-16 opacity-0 animate-thumb-in"
                >
                  <div class="w-full h-full flex items-center justify-center bg-green-500 rounded-full text-white shadow-xl">
                    <UIcon name="i-heroicons-hand-thumb-up" class="text-2xl" />
                  </div>
                </div>
                
                <div 
                  v-if="loserCard === 'B'"
                  class="absolute -right-3 -top-3 w-16 h-16 opacity-0 animate-thumb-in"
                >
                  <div class="w-full h-full flex items-center justify-center bg-red-500 rounded-full text-white shadow-xl">
                    <UIcon name="i-heroicons-hand-thumb-down" class="text-2xl" />
                  </div>
                </div>
                
                <!-- Message stamp -->
                <div 
                  v-if="winnerCard === 'B' && displayStamp === 'B'"
                  class="absolute opacity-0 animate-stamp-in"
                  :style="{
                    top: winnerPosition.top, 
                    left: winnerPosition.left,
                    transform: `rotate(${winnerPosition.rotate})`
                  }"
                >
                  <div class="rounded-lg bg-green-300 px-3 py-1 text-md font-bold text-black border-2 border-green-600 shadow-xl">
                    {{ winnerMessage }}
                  </div>
                </div>
                
                <div 
                  v-if="loserCard === 'B' && displayStamp === 'B'"
                  class="absolute opacity-0 animate-stamp-in"
                  :style="{
                    top: loserPosition.top, 
                    left: loserPosition.left,
                    transform: `rotate(${loserPosition.rotate})`
                  }"
                >
                  <div class="rounded-lg bg-red-300 px-3 py-1 text-md font-bold text-black border-2 border-red-600 shadow-xl">
                    {{ loserMessage }}
                  </div>
                </div>
              </UCard>
            </div>
          </div>
          
          <div class="mt-8 text-center text-sm text-gray-500">
            <p>Cliquez sur le titre que vous préférez</p>
          </div>
        </div>
        
        <!-- Voting completed -->
        <div v-else-if="completed" class="py-8 text-center">
          <UIcon name="i-heroicons-trophy" class="text-5xl mb-4 text-yellow-500" />
          <h2 class="text-xl font-bold mb-2">Votes terminés !</h2>
          <p class="mb-6">Vous avez effectué toutes les comparaisons possibles.</p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton 
              :to="`/battles/${battleId}/results`"
              color="primary"
              icon="i-heroicons-chart-bar"
            >
              Voir les résultats
            </UButton>
            
            <UButton 
              to="/"
              variant="outline"
              icon="i-heroicons-arrow-left"
            >
              Retour aux battles
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
    
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
/* Animation pour les tampons pouce */
@keyframes thumbIn {
  0% {
    opacity: 0;
    transform: scale(0.5) translate(20px, 20px);
  }
  40% {
    opacity: 1;
    transform: scale(1.3) translate(0, 0);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation pour les messages tamponnés */
@keyframes stampIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(var(--rotation, 0deg));
  }
  30% {
    opacity: 1;
    transform: scale(1.2) rotate(var(--rotation, 0deg));
  }
  60% {
    transform: scale(0.9) rotate(var(--rotation, 0deg));
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(var(--rotation, 0deg));
  }
}

.animate-thumb-in {
  animation: thumbIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-stamp-in {
  animation: stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards;
  --rotation: v-bind('winnerPosition.rotate');
}
</style>
