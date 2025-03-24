<!-- pages/new.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useBattlesStore } from '~/stores/battles';

const title = ref('');
const options = ref(['', '']); // Start with two empty options
const battlesStore = useBattlesStore();
const router = useRouter();

// Add a new option field
function addOption() {
  options.value.push('');
}

// Remove an option
function removeOption(index: number) {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
}

// Handle form submission
async function handleSubmit() {
  try {
    // Filter out empty options
    const filteredOptions = options.value.filter(opt => opt.trim() !== '');
    
    if (filteredOptions.length < 2) {
      // Use UI notification system instead of alert
      useToast().add({
        title: 'Erreur lors de la validation',
        description: 'Veuillez ajouter au moins deux titres',
        color: 'error'
      });
      return;
    }
    
    // Use mutateAsync to get the returned data
    const result = await battlesStore.createBattleMutation.mutateAsync({
      title: title.value,
      options: filteredOptions
    });
    
    // Success notification before redirect
    useToast().add({
      title: 'Succès!',
      description: 'Votre battle a été créée',
      color: 'success'
    });
    
    // Now result contains the data returned from the API
    router.push(`/battles/${result.id}`);
  } catch (error) {
    console.error('Erreur lors de la création de la battle:', error);
    
    // Error notification
    useToast().add({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Erreur lors de la création de la battle',
      color: 'error'
    });
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UCard class="max-w-2xl mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-beaker" size="24" />
            <h1 class="text-xl font-bold">
              Nouvelle Battle
            </h1>
          </div>
          <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" to="/" size="sm">
            Retour au Dashboard
          </UButton>
        </div>
      </template>
      
      <form @submit.prevent="handleSubmit">
        <!-- Battle title -->
        <UFormField label="Nom de la Battle" required>
          <UInput 
            v-model="title" 
            placeholder="e.g., Next Video Title Ideas" 
            required
          />
        </UFormField>
        
        <!-- Title options -->
        <UFormField label="Titres qui s'affrontent" required class="mt-4">
          <div class="space-y-2">
            <div 
              v-for="(option, index) in options" 
              :key="index" 
              class="flex items-center space-x-2"
            >
              <UInput
                v-model="options[index]"
                :placeholder="`Option ${index + 1}`"
                required
                class="flex-grow"
                size="md"
              />
              <UButton
                v-if="options.length > 2" 
                @click="removeOption(index)" 
                color="error"
                variant="soft"
                icon="i-heroicons-trash"
                size="sm"
                :aria-label="`Supprimer titre ${index + 1}`"
              />
            </div>
          </div>
          
          <UButton 
            type="button" 
            @click="addOption" 
            color="primary"
            variant="soft"
            icon="i-heroicons-plus"
            size="sm"
            class="mt-2"
          >
            Ajouter un titre
          </UButton>
        </UFormField>
      </form>
      
      <template #footer>
        <div class="flex justify-end">
          <UButton 
            type="submit" 
            @click="handleSubmit" 
            color="success"
            :loading="battlesStore.createBattleMutation.asyncStatus === 'loading'"
            :disabled="battlesStore.createBattleMutation.asyncStatus === 'loading'"
          >
            Créer la Battle
          </UButton>
        </div>
      </template>
    </UCard>
    
    <!-- Error alert if there's an error in state -->
    <UAlert
      v-if="battlesStore.createBattleMutation.state.error"
      class="mt-4 max-w-2xl mx-auto"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Error"
      :description="battlesStore.createBattleMutation.state.error.message"
      closable
    />
  </UContainer>
</template>
