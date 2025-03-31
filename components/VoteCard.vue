<!-- components/VoteCard.vue -->
<script setup lang="ts">
import type { TitleOption } from '~/types';

const props = defineProps<{
  option: TitleOption;
  isSelected: boolean;
  isRejected: boolean;
  isDisabled: boolean;
  stampPosition?: { top: string; left: string; rotate: string };
  stampMessage?: string;
  displayStamp: boolean;
  isPositive: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

const handleSelect = () => {
  if (!props.isDisabled) {
    emit('select');
  }
};
</script>

<template>
  <UCard
    class="transition-all cursor-pointer overflow-hidden relative h-full animate-card-in"
    :class="[
      isSelected ? 'z-10 scale-105 shadow-lg ring-2 ring-cold-300' : 
      isRejected ? 'scale-95 opacity-80' :
      isDisabled ? 'opacity-70' : 'hover:shadow-lg hover:ring-1 hover:ring-cold-300/50'
    ]"
    @click="handleSelect"
  >
    <div class="p-6 text-center">
      <h2 class="text-xl font-bold">{{ option.content }}</h2>
    </div>
    
    <!-- Feedback icon -->
    <div 
      v-if="isSelected"
      class="absolute right-3 top-3 opacity-0 animate-thumb-in"
    >
      <UIcon name="i-ph-fire" class="text-warm-300 text-2xl" />
    </div>
    
    <div 
      v-if="isRejected"
      class="absolute right-3 top-3 opacity-0 animate-thumb-in"
    >
      <UIcon name="i-ph-snowflake" class="text-cold-300 text-2xl" />
    </div>
    
    <!-- Message stamp -->
    <div 
      v-if="displayStamp && stampMessage && stampPosition"
      class="absolute opacity-0 animate-stamp-in z-20"
      :style="{
        top: stampPosition.top, 
        left: stampPosition.left,
        transform: `rotate(${stampPosition.rotate})`
      }"
    >
      <div 
        class="rounded-lg px-3 py-1 text-md font-bold border-2 shadow-xl"
        :class="isPositive ? 'bg-cold-100 text-cold-500 border-cold-300' : 'bg-warm-100 text-warm-500 border-warm-300'"
      >
        {{ stampMessage }}
      </div>
    </div>
  </UCard>
</template>

<style scoped>
/* Card entry animation */
@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation for the feedback icons */
@keyframes thumbIn {
  0% {
    opacity: 0;
    transform: scale(0.5) translate(10px, -10px);
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

/* Animation for the stamped messages - Faster version */
@keyframes stampIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(v-bind('stampPosition?.rotate || "0deg"'));
  }
  40% {
    opacity: 1;
    transform: scale(1.2) rotate(v-bind('stampPosition?.rotate || "0deg"'));
  }
  70% {
    transform: scale(0.9) rotate(v-bind('stampPosition?.rotate || "0deg"'));
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(v-bind('stampPosition?.rotate || "0deg"'));
  }
}

.animate-card-in {
  animation: cardIn 0.3s ease-out forwards;
}

.animate-thumb-in {
  animation: thumbIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-stamp-in {
  animation: stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards;
  animation-fill-mode: forwards;
}
</style>
