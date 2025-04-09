<!-- layouts/default.vue -->
<template>
  <div class="youtube-layout min-h-screen text-(--ui-yt-200)">
    <!-- YouTube-style header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-(--ui-yt-800)">
      <div class="container mx-auto px-4 h-14 flex items-center justify-between">
        <!-- Logo section -->
        <div class="flex items-center">
          <!-- YouTube-inspired logo -->
          <NuxtLink to="/" class="flex items-center">
            <span class="text-2xl font-bold tracking-tighter flex items-center">
              <UIcon name="i-ph-youtube-logo-fill" class="text-red-500" size="26" />
              <span class="text-(--ui-yt-200) font-extrabold">Celsius</span>
            </span>
          </NuxtLink>
        </div>
        
        <!-- Search bar (simplified) -->
        <div v-if="$route.path.endsWith('/vote')" class="hidden md:flex flex-1 max-w-xl mx-6 blur-[1px]">
          <div class="relative w-full">
            <UInput
              placeholder="Rechercher"
              disabled
              :ui="{
                base: 'bg-(--ui-yt-800) text-(--ui-yt-200) border-(--ui-yt-600) border-1 rounded-full px-4 py-2'
              }"
              class="w-full"
            />
          </div>
        </div>
        
        <!-- Right side actions -->
        <div class="flex items-center space-x-2">
          <!-- Search icon (mobile) -->
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-ph-magnifying-glass"
            class="md:hidden"
          />
          
          <!-- Create new battle -->
          <UButton
            to="/battles/new"
            variant="soft"
            icon="i-ph-plus"
            class="text-(--ui-yt-200) rounded-full bg-(--ui-yt-600) pr-4 py-2"
          >
            Créer
          </UButton>
        </div>
      </div>
    </header>
    
    <!-- Main content with proper spacing for fixed header -->
    <main class="pt-16 min-h-screen">
      <slot />
    </main>
  </div>
</template>
