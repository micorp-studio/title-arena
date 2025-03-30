<!-- pages/battles/new.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBattleMutations } from '~/composables/useBattleApi';
import type { CreateBattleRequest } from '~/types';

definePageMeta({
  layout: 'default'
});

const router = useRouter();
const toast = useToast();

// Form state
const title = ref('');
const options = ref<string[]>(['']);

// Refs for inputs
const titleInputRef = ref<HTMLInputElement | null>(null);
const optionInputsRef = ref<HTMLInputElement[]>([]);

// Validation
const isTitleValid = computed(() => title.value.trim().length >= 3);
const areOptionsValid = computed(() => {
  const nonEmptyOptions = options.value.filter(option => option.trim().length > 0);
  return nonEmptyOptions.length >= 2;
});
const isFormValid = computed(() => isTitleValid.value && areOptionsValid.value);

// Validation tooltips
const titleTooltip = computed(() => 
  !isTitleValid.value ? 'Title must be at least 3 characters' : ''
);

const formTooltip = computed(() => {
  if (!isTitleValid.value) return 'Title must be at least 3 characters';
  if (!areOptionsValid.value) return 'At least 2 non-empty options are required';
  return '';
});

// Get mutation
const { createBattle: { mutate: createBattleMutate, asyncStatus: createStatus } } = useBattleMutations();

// Focus an option input by index
const focusOptionInput = (index: number) => {
  nextTick(() => {
    if (optionInputsRef.value[index]) {
      const input = optionInputsRef.value[index];
      input.focus();
      
      // Place cursor at the end
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  });
};

// Add a new option field
const addOption = () => {
  options.value.push('');
  
  // Focus the new input after render
  nextTick(() => {
    focusOptionInput(options.value.length - 1);
  });
};

// Remove an option
const removeOption = (index: number) => {
  options.value.splice(index, 1);
  if (options.value.length === 0) {
    options.value.push('');
  }
  
  // Focus the previous option or the first one
  nextTick(() => {
    const focusIndex = Math.min(index, options.value.length - 1);
    focusOptionInput(focusIndex);
  });
};

// Handle option key down
const handleOptionKeyDown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    
    // If this is the last option, add a new one
    if (index === options.value.length - 1) {
      addOption();
    } else {
      // Otherwise focus the next option
      focusOptionInput(index + 1);
    }
  }
};

// Handle title key down
const handleTitleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    
    // Focus the first option
    focusOptionInput(0);
  }
};

// Define global shortcuts
defineShortcuts({
  // Tab from title to first option
  'enter': {
    usingInput: true,
    handler: () => {
      // If title input is focused, move to first option
      if (document.activeElement === titleInputRef.value) {
        focusOptionInput(0);
      }
    }
  }
});

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Filter out empty options
  const nonEmptyOptions = options.value.filter(option => option.trim().length > 0);

  const battleData: CreateBattleRequest = {
    title: title.value.trim(),
    options: nonEmptyOptions
  };

  try {
    await createBattleMutate(battleData);
    
    toast.add({
      title: 'Battle created',
      description: 'Your battle has been created successfully.',
      color: 'primary'
    });
    
    // Navigate to home page
    router.push('/');
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create battle',
      color: 'secondary'
    });
  }
};

// Register option input refs
const registerOptionInput = (el: any, index: number) => {
  if (el) {
    optionInputsRef.value[index] = el.inputRef;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
    <div class="max-w-xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: 'New Battle', icon: 'i-ph-plus-circle' }
      ]" />
    </div>
    
    <!-- Header -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold font-mono">Create Battle</h1>
      <p class="mt-2 opacity-80">Set up the options that will compete</p>
    </div>
    
    <!-- Form -->
    <UCard class="max-w-xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-10">
        <!-- Battle Title -->
        <div class="flex flex-col gap-1">
          <UFormLabel required>Battle Name</UFormLabel>
            <UInput 
              v-model="title" 
              placeholder="The topic of your video" 
              autofocus
              color="primary"
              class="w-full"
              :ui="{ base: 'rounded-md' }"
              @keydown="handleTitleKeyDown"
              ref="titleInputRef"
            />
        </div>
        
        <!-- Options -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <UFormLabel required>Title Options</UFormLabel>
            <p class="text-sm opacity-80">
              {{ options.filter(o => o.trim()).length }} option{{ options.filter(o => o.trim()).length !== 1 ? 's' : '' }}
            </p>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="(option, index) in options"
              :key="index"
              class="flex items-center gap-2"
            >
              <UInput
                v-model="options[index]"
                :placeholder="`Option ${index + 1}`"
                class="w-full option-input"
                :ui="{ base: 'rounded-md' }"
                @keydown="(e: KeyboardEvent) => handleOptionKeyDown(e, index)"
                :ref="(el) => registerOptionInput(el, index)"
              />
              
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-ph-trash"
                @click="removeOption(index)"
                aria-label="Remove option"
                class="flex-shrink-0"
                :disabled="options.length <= 1"
              />
            </div>
            
            <UButton
              color="primary"
              variant="subtle"
              icon="i-ph-plus"
              class="w-full rounded-md flex items-center justify-center gap-2"
              @click="addOption"
            >
              Add Option
              <UKbd size="md" variant="subtle" class="ml-1 p-1 opacity-70 rounded-md bg-warm-100">⏎</UKbd>
            </UButton>
          </div>
        </div>
        
        <!-- Submit -->
        <div class="flex justify-end gap-4 pt-4 border-t border-white/5">
          <UButton
            to="/"
            color="neutral"
            variant="outline"
            class="bg-transparent text-warm-500/90"
            :disabled="createStatus === 'loading'"
          >
            Cancel
          </UButton>
          
          <UTooltip :text="formTooltip" :disabled="isFormValid">
            <UButton
              type="submit"
              color="primary"
              icon="i-ph-check-circle"
              :loading="createStatus === 'loading'"
              :disabled="createStatus === 'loading' || !isFormValid"
            >
              Create Battle
            </UButton>
          </UTooltip>
        </div>
      </form>
    </UCard>
  </div>
</template>
