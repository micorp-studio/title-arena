<!-- components/VoteCard.vue -->
<script setup lang="ts">
import type { TitleOption } from '~/types';

const props = defineProps<{
  option: TitleOption;
  seed: number;
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

// Use the seed directly without modification for thumbnails and metadata
// so both cards in the pair share the same visual elements
const pairSeed = computed(() => props.seed);

const thumbnailUrl = computed(() => {
  return `https://picsum.photos/seed/${pairSeed.value}/640/360.webp`;
});

// Generate a random video duration between 3 and 25 minutes
const videoDuration = computed(() => {
  const seed = parseInt(pairSeed.value.toString(), 10);
  const minutes = 3 + (seed % 22); // Between 3 and 25 minutes
  const seconds = (seed * 13) % 60; // Random seconds
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

// Generate random view count between 10K and 1M
const viewCount = computed(() => {
  const seed = parseInt(pairSeed.value.toString(), 10);
  const views = seed % 99999999;
  return views > 1000000 
    ? `${(views / 1000000).toFixed(1).replace('.0', '')} M vues` 
    : views > 1000 
      ? `${(views / 1000).toFixed(0)} k vues` 
      : `${views} vues`;
});

// Random time period (hours, days, weeks, months)
const timeAgo = computed(() => {
  const seed = parseInt(pairSeed.value.toString(), 10);
  const options = ['heures', 'jours', 'semaines', 'mois'];
  const timeType = options[seed % options.length];
  const timeAmount = 1 + (seed % 11);
  return timeAmount === 1 
    ? `il y a ${timeAmount} ${timeType.slice(0, -1)}` 
    : `il y a ${timeAmount} ${timeType}`;
});

const isVerified = computed(() => parseInt(pairSeed.value.toString(), 10) % 3 === 0);

// Single function to fetch both username and avatar based on seed
const user = ref({
  username: '',
  avatarUrl: ''
});

// Fetch user data
const fetchUserData = async () => {
  // Use seed parameter to get consistent results for the same seed
  const response = await fetch(`https://randomuser.me/api/?seed=${pairSeed.value}`);
  const data = await response.json();
  const user = data.results[0];
  
  // Make YouTube-like username
  const firstName = user.name.first;
  const lastName = user.name.last;
  
  // Choose a YouTube-like username format
  const usernameFormats = [
    `${firstName} ${lastName}`,
    `${firstName}${lastName}`,
    `${firstName}_${lastName}`,
    `${firstName}.${lastName}`,
    `${firstName}${lastName}Official`,
    `${firstName}TV`,
    `${firstName}Tube`,
    `${lastName}Productions`,
  ];
  
  const formatIndex = parseInt(pairSeed.value.toString(), 10) % usernameFormats.length;
  return {
    username: usernameFormats[formatIndex],
    avatarUrl: user.picture.medium
  };
};

// initialize user data
fetchUserData().then(data => {
  user.value = data;
});

// fetch user data each time the seed change
watch(pairSeed, () => {
  fetchUserData().then(data => {
    user.value = data;
  });
});
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
  >
    <!-- Thumbnail container with overlay -->
    <div class="relative rounded-xl overflow-hidden mb-3">
      <img 
        :src="thumbnailUrl" 
        class="w-full aspect-video object-cover" 
        :alt="option.content"
      />
      
      <!-- Duration badge -->
      <div class="absolute bottom-2 right-2 bg-black/80 px-1 py-0.5 text-xs font-medium text-white rounded-[4px]">
        {{ videoDuration }}
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
      <div class="flex-shrink-0">
        <UAvatar
          :src="user.avatarUrl"
          size="sm"
          :alt="`${user.username} avatar`"
        />
      </div>
      
      <!-- Title and metadata -->
      <div class="flex-grow">
        <!-- Video title - multiline, bold - THIS IS THE ONLY PART THAT DIFFERS -->
        <h3 class="text-sm font-medium leading-tight line-clamp-2 mb-1">
          {{ option.content }}
        </h3>
        
        <!-- Channel name with verified badge if applicable -->
        <div class="flex items-center text-xs text-gray-400">
          <span>{{ user.username }}</span>
          <UIcon 
            v-if="isVerified" 
            name="i-lucide-circle-check-filled" 
            class="ml-1 text-gray-400 h-3 w-3"
          />
        </div>
        
        <!-- View count and time ago -->
        <div class="text-xs text-gray-400 flex items-center">
          <span>{{ viewCount }}</span>
          <span class="mx-1">•</span>
          <span>{{ timeAgo }}</span>
        </div>
      </div>
      
      <!-- Video menu button - positioned to the right -->
      <div class="cursor-pointer self-start mt-[2px]">
        <UIcon name="i-lucide-more-vertical" class="h-5 w-5 text-gray-400" />
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
