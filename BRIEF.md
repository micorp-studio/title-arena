# Updated Developer Brief: Title Arena Implementation

## Project Overview

**Title Arena** is a modern web application designed to help content creators, marketers, and teams determine the most effective titles through head-to-head comparisons. Rather than relying on traditional polls, Title Arena leverages an ELO rating system similar to chess rankings, where titles gain or lose points based on one-on-one matchups. This creates a more accurate representation of relative title strength and engages users through a tournament-style voting interface.

## Core Use Case

Traditional title selection methods suffer from biases toward early entries and groupthink effects. Title Arena addresses this by:

- Presenting only two options at a time, reducing cognitive load
- Using an ELO rating system that accounts for the strength of competitors
- Providing clear visualizations of results and title rankings
- Creating an engaging, gamified process for title selection

## Technology Stack

### Frontend
- **Framework**: Nuxt 3 with Vue 3 (Composition API)
- **UI Framework**: Nuxt UI + TailwindCSS
- **State Management**: Pinia Colada for API queries/mutations
- **Styling**: Custom thermal gradient theme with glassmorphism

### Backend
- **Server**: Nuxt API routes (Nitro)
- **Database**: SQLite via Drizzle ORM
- **Hosting**: NuxtHub

### Development Tools
- **Package Manager**: Bun
- **Type Safety**: TypeScript
- **Utilities**: VueUse, Nuxt DevTools

## Project Structure

```
title-arena/
├── types/                           # Global type definitions
│   └── index.ts                     # Centralized type definitions
├── server/
│   ├── api/battles/                 # API endpoints
│   │   ├── index.get.ts             # GET /api/battles (list all)
│   │   ├── index.post.ts            # POST /api/battles (create)
│   │   ├── [id].get.ts              # GET /api/battles/:id (details)
│   │   ├── [id].put.ts              # PUT /api/battles/:id (update)
│   │   ├── [id].delete.ts           # DELETE /api/battles/:id (delete)
│   │   └── [id]/vote.post.ts        # POST /api/battles/:id/vote
│   ├── database/
│   │   ├── schema.ts                # Database schema
│   │   └── migrations/              # Auto-generated migrations
│   └── utils/
│       ├── drizzle.ts               # Drizzle setup and helpers
│       └── helpers.ts               # Validation and utility functions
├── assets/
│   └── css/
│       └── main.css                 # Global CSS with theme variables
├── layouts/
│   └── default.vue                  # Main layout with gradient background
├── public/
│   └── mesh-gradient.svg            # Background gradient asset
├── composables/
│   ├── useBattleHelpers.ts          # UI utility functions
│   └── useBattleApi.ts              # Pinia Colada queries & mutations
└── pages/                           # Route pages (coming next)
```

## Current Implementation Status

We've successfully implemented:

1. **Database Schema & API Layer**:
   - Complete database schema with relations using Drizzle ORM
   - Comprehensive API endpoints with validation and error handling
   - Type safety throughout backend operations

2. **API Integration Layer**:
   - Pinia Colada queries and mutations for state management
   - Efficient cache invalidation strategies
   - TypeScript integration for type-safe API operations

3. **Theme & UI Foundation**:
   - Custom thermal gradient theme with glassmorphism effect
   - Responsive layout with mesh gradient background
   - Consistent typography system using JetBrains Mono and Space Grotesk

## UI Theme Guidelines

### Color Palette

Our thermal theme uses a hot/cold contrast with:

- **Cold Colors**:
  - Primary: `--color-cold-300` (#82AAF7) - Use for primary actions and UI elements
  - Dark accents: `--color-cold-400` (#223466) and `--color-cold-500` (#050A2D)
  - Light accents: `--color-cold-100` (#EDF1F9) and `--color-cold-200` (#BFD5F8)

- **Warm Colors**:
  - Secondary: `--color-warm-300` (#C37554) - Use for contrasting actions and highlights
  - Dark accents: `--color-warm-400` (#712303) and `--color-warm-500` (#240800)
  - Light accents: `--color-warm-100` (#F6F1EE) and `--color-warm-200` (#EDD5CE)

### Typography

- **Headings**: JetBrains Mono (monospace) - For technical precision and character
- **Body Text**: Space Grotesk - For readable content with subtle personality
- **Text Colors**: Use `--ui-text` for primary text, `--ui-text-muted` for secondary information

### Components

- **Cards**: Use the default `UCard` component without borders for a clean, minimal look
- **Buttons**: Use `UButton` with appropriate color variants:
  - Primary actions: `color="primary"` (cold blue)
  - Secondary actions: `color="secondary"` (warm orange)
  - Neutral actions: `variant="ghost"` or `variant="outline"`
- **Icons**: Use Phosphor icons (`i-ph-*`) for consistent visual language

## Pinia Colada Integration Guide

Pinia Colada provides a powerful way to manage API data. Here's how to effectively use it in the project:

### Using Queries

Queries fetch data from the API and maintain their state. When accessing query results, properly destructure the returned object:

```vue
<script setup>
import { useAllBattles } from '~/composables/useBattleApi';

// Destructure for better TypeScript support
const { 
  // For TypeScript narrowing, use state
  state,
  // For checking loading status
  asyncStatus,
  // For manual refreshing
  refresh,
  // For optional direct access (aliases)
  data: battles
} = useAllBattles();
</script>

<template>
  <!-- Loading state -->
  <div v-if="asyncStatus === 'loading' && !battles">Loading...</div>
  
  <!-- Error state -->
  <div v-else-if="state.status === 'error'">
    Error: {{ state.error?.message }}
  </div>
  
  <!-- Data state -->
  <div v-else-if="state.data">
    <div v-for="battle in state.data" :key="battle.id">
      {{ battle.title }}
    </div>
  </div>
</template>
```

### Using Mutations

Mutations modify data and need to be properly destructured to access their methods and state:

```vue
<script setup>
import { useBattleMutations } from '~/composables/useBattleApi';
import { ref } from 'vue';

// Destructure to get mutation methods and status
const { 
  createBattle: { 
    mutate: createBattleMutate,
    asyncStatus: createStatus,
    state: createState
  }
} = useBattleMutations();

const title = ref('');
const options = ref('');

const handleSubmit = () => {
  createBattleMutate({
    title: title.value,
    options: options.value.split('\n').filter(o => o.trim())
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->
    <UButton 
      type="submit" 
      color="primary"
      :disabled="createStatus === 'loading'"
    >
      {{ createStatus === 'loading' ? 'Creating...' : 'Create Battle' }}
    </UButton>
    
    <!-- Success message -->
    <div v-if="createState.status === 'success'">
      Battle created successfully!
    </div>
  </form>
</template>
```

### Route-Based Queries

For queries that depend on route parameters, use the Vue Router version of `useRoute()` with a function-based key:

```ts
// composables/useBattleApi.ts
import { useRoute } from 'vue-router'; // Import from vue-router, not Nuxt

export const useBattleDetails = defineQuery(() => {
  const route = useRoute();
  
  return {
    key: () => ['battle', route.params.id as string],
    query: () => fetch(`/api/battles/${route.params.id}`).then(r => r.json()),
    enabled: () => !!route.params.id,
  };
});
```

## KISS & DRY Principles Application

### Keep It Simple, Stupid (KISS)

Our implementation embraces simplicity:

1. **Declarative Data Fetching**: Pinia Colada's declarative style lets us focus on what data we need, not how to fetch it
2. **Centralized Types**: Single source of truth for all data types
3. **API Structure Mirrors UI Needs**: Each API endpoint serves a specific UI purpose
4. **Minimal State Management**: Using Pinia Colada's automatic caching instead of complex manual state

### Don't Repeat Yourself (DRY)

We've eliminated redundancy through:

1. **Reusable Queries**: Defining queries once in composables and reusing them across components
2. **Centralized Mutations**: All data modification happens through the same mutation functions
3. **Automatic Cache Invalidation**: Setting up invalidation patterns once for each mutation type
4. **Shared UI Theme**: Consistent theme variables across components

## Next Steps

1. **UI Components Implementation**:
   - Create the core UI components for battles and voting
   - Implement form components for creating and editing battles
   - Design results visualization for ELO rankings

2. **Page Implementation**:
   - Implement the home/dashboard page showing all battles
   - Create the battle details page with options to vote or view results
   - Build the voting interface with its head-to-head comparison
   - Design the results page showing rankings

3. **Enhancements & Refinements**:
   - Add animations for transitions between states
   - Implement responsive designs for mobile devices
   - Add user feedback features like toast notifications

## Development Approach

For the upcoming UI implementation, we'll follow a component-first approach:

1. Create reusable components like `BattleCard`, `VotingInterface`, and `ResultsTable`
2. Assemble these components into page layouts
3. Integrate with our queries and mutations
4. Test the full flow from battle creation to voting to results

This approach ensures we maintain KISS and DRY principles while building a cohesive, well-structured application.