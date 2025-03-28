<!-- layouts/default.vue -->
<template>
    <div>
      <!-- Enhanced mesh gradient background -->
      <div class="mesh-bg">
        <img src="/mesh-gradient.svg" alt="" class="absolute inset-0 w-full h-full object-cover object-center" />
        <div class="absolute inset-0 bg-[url('/noise.svg')] opacity-100 mix-blend-overlay"></div>
      </div>
      
      <!-- Content -->
      <slot />
    </div>
  </template>
  