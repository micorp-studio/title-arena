<!-- components/HowItWorks.vue -->
<template>
    <div class="mt-10 mb-6">
      <h2 class="text-xl font-mono mb-1">How It Works</h2>
      <p class="opacity-70 mb-8">
        Struggling to choose the right title? 
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white/5 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
          <UIcon name="i-ph-plus-circle" class="mx-auto mb-4 size-10 text-cold-500/40" />
          <h3 class="font-mono mb-2">Create</h3>
          <p class="text-sm opacity-70">Add options you want to compare</p>
        </div>
        
        <div class="bg-white/5 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
          <UIcon name="i-ph-scales" class="mx-auto mb-4 size-10 text-cold-500/40"/>
          <h3 class="font-mono mb-2">Vote</h3>
          <p class="text-sm opacity-70">Compare options with easy 1v1 battles</p>
        </div>
        
        <div class="bg-white/5 backdrop-blur-sm p-6 rounded-lg text-center shadow-lg">
          <UIcon name="i-ph-chart-line-up" class="mx-auto mb-4 size-10 text-cold-500/40"/>
          <h3 class="font-mono mb-2">Perform</h3>
          <p class="text-sm opacity-70">Elo rating system reveals bangers</p>
        </div>
      </div>
    </div>
  </template>
  