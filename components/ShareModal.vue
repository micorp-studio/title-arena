<script setup lang="ts">
import type { Battle } from '~/types';

const props = defineProps<{
  battle: Battle
}>()

const emit = defineEmits<{ close: [boolean] }>()

const toast = useToast();
const copied = ref(false);

const shareLink = `${window.location.origin}/battles/${props.battle.id}/vote`

const copyLink = () => {
  navigator.clipboard.writeText(shareLink);
  copied.value = true;
  
  toast.add({
    title: 'Link copied',
    description: 'Share link has been copied to clipboard',
    color: 'secondary'
  });
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="`Voting link for '${battle.title}''`"
    :ui="{ footer: 'justify-end', header: 'border-0', body: 'border-0' }"
  >

  <template #body class="-m-32">
        <p class="mb-4">Share this link to collect votes:</p>
        
        <!-- Share URL input with copy button -->
        <UInput
          :model-value="shareLink"
          readonly
          class="font-mono text-sm w-full"
          variant="subtle"
          :ui="{ trailing: '-mr-2' }"
        >
          <template #trailing>
            <UTooltip :text="copied ? 'Copied!' : 'Copy to clipboard'">
              <UButton
                :color="copied ? 'secondary' : 'neutral'"
                variant="link"
                size="md"
                :icon="copied ? 'i-ph-check-bold' : 'i-ph-copy'"
                aria-label="Copy to clipboard"
                class="bg-warm-300/20"
                @click="copyLink"
              />
            </UTooltip>
          </template>
        </UInput>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" label="Dismiss" @click="emit('close', false)" />
        <UButton icon="i-ph-arrow-right" label="Begin Voting" @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>