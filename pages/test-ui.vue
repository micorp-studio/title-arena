<!-- pages/test-ui.vue -->
<script setup lang="ts">
// Define the layout
definePageMeta({
  layout: 'default'
});
</script>

<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-4xl mx-auto space-y-12">
      <!-- Typography Section -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold text-cold-500">Typography</h2>
        </template>
        
        <div class="space-y-6">
          <div>
            <h1 class="text-4xl mb-2 text-warm-500">JetBrains Mono Heading</h1>
            <h2 class="text-2xl mb-4 text-warm-400">Subheading with softer contrast</h2>
            <p class="opacity-80">This is regular paragraph text in Space Grotesk, our secondary font. It has good readability against the mesh gradient background.</p>
          </div>
          
          <div>
            <p class="font-mono text-lg opacity-90 mb-2">Monospace is now for headings</p>
            <p class="opacity-80">Notice how our headings now use JetBrains Mono for a more technical, precise feel that matches our theme.</p>
          </div>
        </div>
      </UCard>
      
      <!-- Buttons -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold">Buttons</h2>
        </template>
        
        <div class="space-y-8">
          <div class="flex flex-wrap gap-4">
            <UButton color="primary" icon="i-ph-thermometer-hot" class="text-cold-100">Vote Hotter</UButton>
            <UButton color="secondary" icon="i-ph-thermometer-cold" class="text-cold-100">Vote Cooler</UButton>
            <UButton color="neutral" variant="outline">Neutral</UButton>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <UButton color="primary" variant="outline" icon="i-ph-plus">Create Battle</UButton>
            <UButton color="secondary" variant="outline" icon="i-ph-chart-line-up">View Results</UButton>
            <UButton variant="ghost" icon="i-ph-arrow-left">Back</UButton>
          </div>
        </div>
      </UCard>
      
      <!-- Card Variants -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold">Card Styles</h2>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard variant="outline" class="h-40 flex items-center justify-center">
            <p class="opacity-90 text-center">Outline Variant</p>
          </UCard>
          
          <UCard variant="soft" class="h-40 flex items-center justify-center">
            <p class="opacity-90 text-center">Soft Variant</p>
          </UCard>
          
          <UCard variant="solid" class="h-40 flex items-center justify-center">
            <p class="opacity-90 text-center">Solid Variant</p>
          </UCard>
          
          <UCard variant="subtle" class="h-40 flex items-center justify-center">
            <p class="opacity-90 text-center">Subtle Variant (Default)</p>
          </UCard>
        </div>
      </UCard>
      
      <!-- Content Example -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Example Content</h2>
            <UButton color="primary" size="sm" icon="i-ph-plus">Add Option</UButton>
          </div>
        </template>
        
        <div class="space-y-4">
          <p class="opacity-80">This demonstrates how an actual content card might look with our thermal theme. The glassmorphism effect creates depth against the gradient background.</p>
          
          <div class="bg-white/5 p-4 rounded-lg">
            <p class="font-mono opacity-90">Option 1: This is a sample title option</p>
            <div class="w-full bg-black/20 rounded-full h-2 mt-2">
              <div class="bg-warm-400 h-2 rounded-full" style="width: 75%"></div>
            </div>
          </div>
          
          <div class="bg-white/5 p-4 rounded-lg">
            <p class="font-mono opacity-90">Option 2: Another title to consider</p>
            <div class="w-full bg-black/20 rounded-full h-2 mt-2">
              <div class="bg-cold-400 h-2 rounded-full" style="width: 45%"></div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" icon="i-ph-check">Submit Vote</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
