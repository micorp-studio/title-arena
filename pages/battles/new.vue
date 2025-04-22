<script setup lang="ts">
import * as z from 'zod'
import { battleSchema } from '~/types/zod_schemas'
import type { TabsItem } from '@nuxt/ui'

const items: TabsItem[] = [
  {
    label: 'Titles',
    icon: 'i-ph-text',
    slot: 'title' as const
  },
  {
    label: 'Thumbnails',
    icon: 'i-ph-image',
    slot: 'thumbnail' as const
  }
] satisfies TabsItem[]

const activeTab = ref('0')
const targets = ref([]);
const titleRef = ref(null);

const focusNextOption = (currentIndex: number) => {
  if (currentIndex === battleState.options.length - 1) {
    battleState.options.push('');
  }
  nextTick(() => {
    targets.value[currentIndex + 1]?.inputRef?.focus();
  });
};

type Schema = z.output<typeof battleSchema>

const battleState = reactive<Schema>({
  title: '',
  options: ['', ''],
  type: 'title'
})

watch(activeTab, () => {
  if (activeTab.value === '1') {
    battleState.options = [];
    battleState.type = 'thumbnail';
  } else {
    battleState.options = ['', ''];
    battleState.type = 'title';
  }
})

const fileInputRef = ref<HTMLInputElement | null>(null);
const upload = useUpload('/api/minias', { method: 'PUT' })
async function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target || !target.files || target.files.length === 0) {
    console.warn('No file selected');
    return;
  }


  const uploadedFiles = await upload(target);
  battleState.options.push(...uploadedFiles.map(f => f.pathname));
  target.value = '';
}

const triggerFileInput = () => {
  fileInputRef.value?.click();
  console.log('triggered')
};

const removeOption = (index: number) => {
  battleState.options.splice(index, 1);
  if (battleState.options.length === 0) {
    battleState.options.push('');
  }
};


const { createBattle: { mutateAsync: createBattleMutate, asyncStatus: createStatus } } = useBattleMutations();

const toast = useToast()
async function onSubmit() {
  const createdBattle = await createBattleMutate(battleState);
  toast.add({ title: 'New battle created', description: `Let the voting begin!`, color: 'secondary' });
  navigateTo(`/battles/${createdBattle.id}/created`);
  // toast.add({ title: 'New battle created', description: JSON.stringify(battleState), color: 'secondary' });
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">

    <div class="max-w-xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: 'New Battle', icon: 'i-ph-plus-circle' }
      ]" />
    </div>

    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold">Create Battle</h1>
      <p class="mt-2 opacity-80">Set up the options that will compete</p>
    </div>

    <UCard class="max-w-xl mx-auto ring-(--ui-yt-400)/20 bg-(--ui-yt-600)/30" :ui="{ body: 'border-0' }">
      <UTabs v-model="activeTab" :items="items" :ui="{ list: 'bg-(--ui-yt-600)', indicator: 'bg-(--ui-yt-200)' }">
        <template #title="{ item }">
          <UForm :schema="battleSchema" :state="battleState" @submit="onSubmit">
            <UFormField label="Battle Name" name="title" required>
              <UInput v-model="battleState.title" ref="titleRef" placeholder="The topic of your video" class="w-full"
                @keydown.enter.prevent="focusNextOption(-1)" />
            </UFormField>

            <UFormField label="Title Options" name="options" required class="mt-12 mb-2"
              :hint="`${battleState.options.filter(o => o.trim()).length} option${battleState.options.filter(o => o.trim()).length !== 1 ? 's' : ''}`" />
            <div v-for="(option, index) in battleState.options" :key="index" class="flex w-full">
              <UFormField :name="`options.${index}`" :ui="{ root: 'w-full mb-2' }">
                <div class="flex gap-2 w-full">
                  <UInput v-model="battleState.options[index]" :placeholder="`Option ${index + 1}`" ref="targets"
                    class="w-full" @keydown.enter.prevent="focusNextOption(index)" />
                  <UButton @click="removeOption(index)" color="neutral" variant="ghost" icon="i-ph-trash"
                    class="flex-shrink-0" :disabled="battleState.options.length <= 2" />
                </div>
              </UFormField>
            </div>
            <UButton color="primary" variant="subtle" icon="i-ph-plus"
              class="w-full rounded-md flex items-center justify-center gap-2"
              @click="focusNextOption(battleState.options.length - 1)">
              Add Option
              <UKbd size="md" variant="subtle" class="ml-1 p-1 opacity-70 rounded-md bg-warm-100">⏎</UKbd>
            </UButton>

            <div class="flex justify-end gap-4 pt-2">
              <UButton to="/" color="neutral" variant="outline" class="bg-transparent text-warm-500/90"
                :disabled="createStatus === 'loading'">
                Cancel
              </UButton>

              <UButton type="submit" color="primary" icon="i-ph-check-circle" :loading="createStatus === 'loading'"
                :disabled="createStatus === 'loading'">
                Create Battle
              </UButton>
            </div>
          </UForm>
        </template>

        <template #thumbnail="{ item }">
          <UForm :schema="battleSchema" :state="battleState" @submit="onSubmit">
            <UFormField label="Video Title" name="title" required>
              <UInput v-model="battleState.title" ref="titleRef" placeholder="The title of your video" class="w-full" />
            </UFormField>

            <UFormField label="Thumbnail Options" name="options" required class="mt-12 mb-2"
              :hint="`${battleState.options.filter(o => o.trim()).length} option${battleState.options.filter(o => o.trim()).length !== 1 ? 's' : ''}`" />
            <div class="grid grid-cols-2 gap-4 w-full mb-2">
              <template v-for="(option, index) in battleState.options" :key="index">
                <div v-if="option"
                  class="relative rounded-md shadow-sm border-1 border-(--ui-yt-600) aspect-video flex flex-col items-center justify-center">
                  <img class="max-w-full max-h-full object-contain rounded"
                    :src="`/api/${battleState.options[index]}`"
                    :alt="`Thumbnail ${index + 1} /api/${battleState.options[index]}`" />
                  <UButton @click="removeOption(index)" color="neutral" variant="soft" icon="i-ph-trash"
                    class="absolute top-2 right-2" size="xs" :ui="{ base: 'bg-(--ui-yt-600)/20' }" />
                </div>
              </template>
            </div>
            <input type="file" multiple ref="fileInputRef" @change="onFileSelect" class="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp" />
            <UButton color="primary" variant="subtle" icon="i-ph-plus"
              class="w-full rounded-md flex items-center justify-center gap-2" type="button" @click="triggerFileInput">
              Add Option
            </UButton>
            <!-- <p>{{ JSON.stringify(battleState.options) }}</p> -->
            <!-- <UInput v-model="battleState.options[battleState.options.length - 1]" type="file" class="w-full rounded-md flex items-center justify-center gap-2" @change="onFileSelect($event)" /> -->
            <div class="flex justify-end gap-4 pt-2">
              <UButton to="/" color="neutral" variant="outline" class="bg-transparent text-warm-500/90"
                :disabled="createStatus === 'loading'">
                Cancel
              </UButton>

              <UButton type="submit" color="primary" icon="i-ph-check-circle" :loading="createStatus === 'loading'"
                :disabled="createStatus === 'loading'">
                Create Battle
              </UButton>
            </div>
          </UForm>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>
