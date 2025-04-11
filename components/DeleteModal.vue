<script setup lang="ts">
import type { Battle } from '~/types';

const props = defineProps<{
  battle: Battle
}>()

const emit = defineEmits<{ close: [boolean] }>()

</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="`Confirm delete '${battle.title}' ?`"
    :ui="{ footer: 'justify-end', header: 'border-0', body: 'border-0' }"
  >

  <template #body class="text-sm opacity-80">
        <p class="text-sm text-(--ui-yt-400)">There is no coming back.</p>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" label="Cancel" @click="emit('close', false)" />
        <UButton icon="i-ph-trash" label="Delete" @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>