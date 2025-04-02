<!-- pages/battles/[id]/created.vue -->
<script setup lang="ts">
import { useBattleDetails } from '~/composables/useBattleApi';
import type { Battle } from '~/types';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const router = useRouter();
const battleId = computed(() => route.params.id as string);

// Get battle details
const { state, asyncStatus } = useBattleDetails();

// Get properly typed battle data
const battle = computed(() => state.value?.data as Battle | undefined);

// Build the shareable URL
const origin = computed(() => {
  if (process.client) {
    return window.location.origin;
  }
  return '';
});

const shareUrl = computed(() => {
  return `${origin.value}/battles/${battleId.value}/vote`;
});

// Copy state
const copied = ref(false);

// Copy link function
const copyLink = () => {
  navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

// Go to voting page
const beginVoting = () => {
  router.push(`/battles/${battleId.value}/vote`);
};

// Go to home page
const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
    <div class="max-w-xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: battle?.title || 'Battle', icon: 'i-ph-trophy' },
        { label: 'Created', icon: 'i-ph-check-circle' }
      ]" />
    </div>
    
    <!-- Loading state -->
    <div v-if="asyncStatus === 'loading' && !battle" class="max-w-xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <div class="animate-pulse mb-4">
            <div class="h-8 w-64 bg-white/10 rounded-md mx-auto"></div>
            <div class="h-4 w-40 bg-white/5 rounded-md mx-auto mt-2"></div>
          </div>
          <p class="opacity-80">Loading battle details...</p>
        </div>
      </UCard>
    </div>
    
    <!-- Error state -->
    <div v-else-if="state.status === 'error'" class="max-w-xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="font-mono text-xl mb-2">Error Loading Battle</h3>
          <p class="opacity-80">{{ state.error?.message || 'Failed to load battle details' }}</p>
          <UButton color="primary" to="/" class="mt-4">
            Return Home
          </UButton>
        </div>
      </UCard>
    </div>
    
    <!-- Success state -->
    <div v-else-if="battle" class="max-w-xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <!-- Success icon -->
          <div class="flex justify-center mb-4">
            <UIcon name="i-ph-check-circle" class="text-cold-500 text-5xl" />
          </div>
          
          <h2 class="text-2xl font-bold font-mono mb-2">Battle Created!</h2>
          <p class="text-lg mb-8">{{ battle.title }}</p>
          
          <!-- Share URL section -->
          <div class="mb-8 px-4">
            <p class="text-sm opacity-80 mb-2">Share this link to collect votes:</p>
            <UInput
              :model-value="shareUrl"
              readonly
              class="font-mono text-sm w-full px-2 py-1"
              :ui="{ trailing: 'pr-1' }"
              variant="subtle"
            >
              <template #trailing>
                <UTooltip :text="copied ? 'Copied!' : 'Copy to clipboard'">
                  <UButton
                    :color="copied ? 'secondary' : 'neutral'"
                    variant="link"
                    size="md"
                    :icon="copied ? 'i-ph-check-bold' : 'i-ph-copy'"
                    aria-label="Copy to clipboard"
                    class="px-2 mx-1 bg-warm-300/20"
                    @click="copyLink"
                  />
                </UTooltip>
              </template>
            </UInput>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ph-arrow-left"
              @click="goHome"
            >
              Return Home
            </UButton>
            
            <UButton
              color="primary"
              icon="i-ph-scales"
              @click="beginVoting"
            >
              Begin Voting
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
