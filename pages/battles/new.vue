<!-- pages/battles/new.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBattleMutations } from '~/composables/useBattleApi';
import { useFormHandling } from '~/composables/useFormHandling';
import type { CreateBattleRequest } from '~/types';

const router = useRouter();
const toast = useToast();

// Form state
const title = ref('');
const options = ref<string[]>(['']);

// Get form handling utilities
const {
  titleInputRef,
  optionInputsRef,
  formIsDirty,
  formIsSubmitting,
  registerOptionInput,
  focusOptionInput,
  focusTitleInput,
  handleTitleKeyDown,
  handleOptionKeyDown,
  validateTitle,
  validateOptions,
  markFormAsClean,
  markFormAsDirty
} = useFormHandling();

// Watch for form changes to track dirty state
watch([title, options], () => {
  markFormAsDirty();
}, { deep: true });

// Validation
const isTitleValid = computed(() => validateTitle(title.value));
const areOptionsValid = computed(() => validateOptions(options.value));
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
const { createBattle: { mutateAsync: createBattleMutate, asyncStatus: createStatus } } = useBattleMutations();

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

// Navigation guard for unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (formIsDirty.value && !formIsSubmitting.value) {
    if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Update submitting state
  formIsSubmitting.value = true;

  // Filter out empty options
  const nonEmptyOptions = options.value.filter(option => option.trim().length > 0);

  const battleData: CreateBattleRequest = {
    title: title.value.trim(),
    options: nonEmptyOptions
  };

  try {
    const createdBattle = await createBattleMutate(battleData);
    
    // Mark form as clean after successful submission
    markFormAsClean();
    
    toast.add({
      title: 'Battle created',
      description: 'Your battle has been created successfully.',
      color: 'primary'
    });
    
    // Navigate to confirmation page instead of home
    router.push(`/battles/${createdBattle.id}/created`);
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create battle',
      color: 'secondary'
    });
  } finally {
    formIsSubmitting.value = false;
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
      <h1 class="text-3xl font-bold">Create Battle</h1>
      <p class="mt-2 opacity-80">Set up the options that will compete</p>
    </div>
    
    <!-- Form -->
    <UCard class="max-w-xl mx-auto ring-(--ui-yt-400)/80">
      <form @submit.prevent="handleSubmit" class="space-y-10">
        <!-- Battle Title -->
        <div class="flex flex-col gap-1">
          <UFormField label="Battle Name" required>
            <UInput 
              v-model="title" 
              placeholder="The topic of your video" 
              autofocus
              color="primary"
              class="w-full"
              :ui="{ base: 'rounded-md' }"
              @keydown="handleTitleKeyDown($event, options)"
              ref="titleInputRef"
            />
          </UFormField>
        </div>
        
        <!-- Options -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <UFormField label="Title Options" required>
              <p class="text-sm opacity-80">
                {{ options.filter(o => o.trim()).length }} option{{ options.filter(o => o.trim()).length !== 1 ? 's' : '' }}
              </p>
            </UFormField>
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
                @keydown="(e: KeyboardEvent) => handleOptionKeyDown(e, index, options, addOption)"
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
            :disabled="formIsSubmitting"
          >
            Cancel
          </UButton>
          
          <UTooltip :text="formTooltip" :disabled="isFormValid">
            <UButton
              type="submit"
              color="primary"
              icon="i-ph-check-circle"
              :loading="formIsSubmitting || createStatus === 'loading'"
              :disabled="formIsSubmitting || createStatus === 'loading' || !isFormValid"
            >
              Create Battle
            </UButton>
          </UTooltip>
        </div>
      </form>
    </UCard>
  </div>
</template>
