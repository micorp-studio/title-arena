<script setup lang="ts">
import * as z from 'zod'
import { updateBattleSchema } from '~/types/zod_schemas'
import { useBattleDetails, useBattleMutations } from '~/composables/useBattleApi';
import type { Battle, UpdateBattleRequest } from '~/types';

const targets = ref([]);
const titleRef = ref(null);



const route = useRoute();
const battleId = computed(() => route.params.id as string);

type Schema = z.output<typeof updateBattleSchema>

const battleState = reactive<Schema>({
  title: '',
  options: [
    {
      id: '',
      content: ''
    }
  ]
})
const { state, asyncStatus } = useBattleDetails();

watch(() => state.value?.data, (battleData) => {
  if (battleData) {
    // Cast to Battle type to get proper TypeScript support
    const battle = battleData as Battle;
    battleState.title = battle.title;
    battleState.options = battle.titleOptions.map(option => ({
      id: option.id,
      content: option.content
    }));
  }
  console.log('Data loaded into form:', JSON.stringify(battleState));
}, { immediate: true });


const focusNextOption = (currentIndex: number) => {
  if (currentIndex === battleState.options.length - 1) {
      battleState.options.push({id: '', content:''});
  }
  nextTick(() => {
      targets.value[currentIndex + 1]?.inputRef?.focus();
  });
};


const removeOption = (index: number) => {
  battleState.options.splice(index, 1);
  if (battleState.options.length === 0) {
    battleState.options.push({id: '', content:''});
  }
};


const { updateBattle: { mutateAsync: updateBattle, asyncStatus: updateStatus }} = useBattleMutations();

const toast = useToast()
async function onSubmit() {
  console.log('Data sent:', JSON.stringify(battleState));
  const createdBattle = await updateBattle({id: battleId.value, ...battleState});
  toast.add({ title: 'Saved', description: `The battle has been edited`, color: 'secondary' });
  navigateTo(`/battles/${createdBattle.id}/results`);
}
</script>

<template>
    <div class="container mx-auto px-4 py-8 md:py-12">

    <div class="max-w-xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: battleState?.title || 'Battle', icon: 'i-ph-trophy', to: `/battles/${battleId}/results` },
        { label: 'Edit', icon: 'i-ph-pencil-simple' }
      ]" />
    </div>
  
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold">Edit Battle</h1>
      <p class="mt-2 opacity-80">Update your battle options</p>
    </div>

    <UCard class="max-w-xl mx-auto ring-(--ui-yt-400)/20 bg-(--ui-yt-600)/30" :ui="{ body: 'border-0' }">
      <UForm :schema="updateBattleSchema" :state="battleState" @submit="onSubmit">
        <UFormField label="Battle Name" name="title" required>
          <UInput 
            v-model="battleState.title"
            ref="titleRef"
            placeholder="The topic of your video" 
            autofocus
            class="w-full"
            @keydown.enter.prevent="focusNextOption(-1)"
          />
        </UFormField>
        
        <UFormField 
          label="Title Options" 
          name="options" 
          required 
          class="mt-12 mb-2"
          :hint="`${battleState.options.filter(o => o['content'].trim()).length } option${ battleState.options.filter(o => o['content'].trim()).length !== 1 ? 's' : ''}`"/>
          <div
              v-for="(option, index) in battleState.options"
              :key="index"
              class="flex w-full"
          >
            <UFormField :name="`options.${index}`" :ui="{root:'w-full mb-2'}">
              <div class="flex gap-2 w-full">
                <UInput
                  v-model="battleState.options[index]['content']"
                  :placeholder="`Option ${index + 1}`"
                  ref="targets"
                  class="w-full"
                  @keydown.enter.prevent="focusNextOption(index)"
                />
                <UButton
                  @click="removeOption(index)"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-trash"
                  class="flex-shrink-0"
                  :disabled="battleState.options.length <= 2"
                />
              </div>
            </UFormField> 
          </div>
          <UButton
            color="primary"
            variant="subtle"
            icon="i-ph-plus"
            class="w-full rounded-md flex items-center justify-center gap-2"
            @click="focusNextOption(battleState.options.length -1)"
          >
            Add Option
            <UKbd size="md" variant="subtle" class="ml-1 p-1 opacity-70 rounded-md bg-warm-100">⏎</UKbd>
          </UButton>

          <div class="flex justify-end gap-4 pt-2">
            <UButton
              to="/"
              color="neutral"
              variant="outline"
              class="bg-transparent text-warm-500/90"
              :disabled="updateStatus === 'loading'"
            >
              Cancel
            </UButton>
            
            <UButton
              type="submit"
              color="primary"
              icon="i-ph-check-circle"
              :loading="updateStatus === 'loading'"
              :disabled="updateStatus === 'loading'"
            >
              Save Battle
            </UButton>
          </div>
      </UForm>
    </UCard>
  </div>
</template>
