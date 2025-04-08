<!-- components/VoteCard.vue -->
<script setup lang="ts">
import type { TitleOption } from '~/types';

const props = defineProps<{
  option: TitleOption;
  metadata: {
    thumbnailUrl: string;
    videoDuration: string;
    viewCount: string;
    timeAgo: string;
    isVerified: boolean;
    user: {
      username: string;
      avatarUrl: string;
    };
  } | null;
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
  <div 
    class="youtube-card transition-all cursor-pointer relative animate-card-in"
    :class="[
      isSelected ? 'z-10 scale-105' : 
      isRejected ? '!opacity-50' : 
      isDisabled ? 'opacity-70' : 'hover:bg-(--ui-yt-800)/25'
    ]"
    @click="handleSelect"
    v-if="metadata"
  >
    <!-- Thumbnail container with overlay -->
    <div class="relative rounded-xl overflow-hidden mb-3.5">
      <img 
        :src="metadata.thumbnailUrl" 
        class="w-full aspect-video object-cover sepia blur-sm" 
        :alt="option.content"
      />
      
      <!-- Duration badge -->
      <div class="absolute bottom-2 right-2 bg-black/80 px-1 py-0.5 text-xs font-medium text-white rounded-[4px] blur-[1px]">
        {{ metadata.videoDuration }}
      </div>
      
      <!-- Selection feedback icon -->
      <div 
        v-if="isSelected"
        class="absolute right-3 top-3 opacity-0 animate-thumb-in bg-(--ui-yt-800) rounded-lg p-1 mb-0 pb-0 justify-center items-center"
      >
        <UIcon name="i-ph-thumbs-up" class="text-2xl" />
      </div>
      
      <div 
        v-if="isRejected"
        class="absolute right-3 top-3 opacity-0 animate-thumb-in bg-(--ui-yt-800) rounded-lg p-1 mb-0 pb-0 justify-center items-center"
      >
        <UIcon name="i-ph-thumbs-down" class="text-2xl" />
      </div>
    </div>
    
    <!-- Video info section -->
    <div class="flex gap-3">
      <!-- Channel avatar -->
      <div class="flex-shrink-0 relative rounded-full overflow-hidden" style="width: 40px; height: 40px;">
        <img 
          :src="metadata.user.avatarUrl" 
          :alt="`${metadata.user.username} avatar`"
          class="absolute inset-0 w-full h-full object-cover sepia filter blur-xs"
        />
      </div>

      
      <!-- Title and metadata -->
      <div class="flex-grow">
        <!-- Video title -->
        <h3 
          class="text-(--ui-yt-200) text-[1.1rem] overflow-hidden text-overflow-ellipsis line-clamp-2 leading-snug max-h-[4.4rem] font-medium whitespace-normal"
          style="display: -webkit-box; -webkit-box-orient: vertical;"
          :title="option.content"
        >
          {{ option.content }}
        </h3>

        
        <!-- Channel name with verified badge if applicable -->
        <div class="flex items-center text-[0.9rem] text-(--ui-yt-400) mt-1 blur-[1px]">
          <span>{{ metadata.user.username }}</span>
          <UIcon 
            v-if="metadata.isVerified" 
            name="i-ph-check-circle-fill" 
            class="ml-1 text-(--ui-yt-400) h-3.5 w-3.5"
          />
        </div>
        
        <!-- View count and time ago -->
        <div class="text-[0.9rem] text-(--ui-yt-400) flex items-center blur-[1px]">
          <span>{{ metadata.viewCount }}</span>
          <span class="mx-1">•</span>
          <span>{{ metadata.timeAgo }}</span>
        </div>
      </div>
      
      <!-- Video menu button - positioned to the right -->
      <div class="cursor-pointer self-start mt-[2px] blur-[1px]">
        <UIcon name="i-lucide-more-vertical" class="h-5 w-5 text-(--ui-yt-200)/90"/>
      </div>
    </div>
    
    <!-- Message stamp for voting feedback -->
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
        :class="isPositive ? 'bg-(--ui-yt-600) text-(--ui-yt-200) border-(--ui-yt-400)' : 'bg-(--ui-yt-600) text-(--ui-yt-200) border-(--ui-yt-400)'"
      >
        {{ stampMessage }}
      </div>
    </div>
  </div>
  
  <!-- Loading state when metadata isn't available yet -->
  <div v-else class="youtube-card animate-pulse">
    <div class="rounded-xl bg-gray-700/50 aspect-video mb-3"></div>
    <div class="flex gap-3">
      <div class="rounded-full bg-gray-700/50 h-8 w-8 flex-shrink-0"></div>
      <div class="flex-grow">
        <div class="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-700/50 rounded w-1/3 mb-1"></div>
        <div class="h-3 bg-gray-700/50 rounded w-2/3"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.youtube-card {
  padding: 0;
  margin-bottom: 16px;
  border-radius: 0;
  background-color: transparent;
}

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

/* Animation for the stamped messages */
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
