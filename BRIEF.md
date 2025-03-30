# Updated Developer Brief: Title Arena Implementation (Versus)

## Project Overview

**Versus** (formerly Title Arena) is a modern web application designed to help content creators, marketers, and teams determine the most effective titles through head-to-head comparisons. With its tagline "Easy choices. Hard data.", Versus leverages an ELO rating system similar to chess rankings, where titles gain or lose points based on one-on-one matchups. This creates a more accurate representation of relative title strength and engages users through a tournament-style voting interface.

## Core Use Case

Traditional title selection methods suffer from biases toward early entries and groupthink effects. Versus addresses this by:

- Presenting only two options at a time, reducing cognitive load
- Using an ELO rating system that accounts for the strength of competitors
- Providing clear visualizations of results and title rankings
- Creating an engaging, gamified process for title selection

## Technology Stack

### Frontend
- **Framework**: Nuxt 3 with Vue 3 (Composition API)
- **UI Framework**: Nuxt UI 3.0.1 + TailwindCSS
- **State Management**: Pinia Colada for API queries/mutations
- **Styling**: Custom thermal gradient theme with subtle glassmorphism

### Backend
- **Server**: Nuxt API routes (Nitro)
- **Database**: SQLite via Drizzle ORM
- **Hosting**: NuxtHub

### Development Tools
- **Package Manager**: Bun
- **Type Safety**: TypeScript
- **Utilities**: VueUse, Nuxt DevTools, date-fns

## Project Structure

```
versus/
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
├── components/
│   └── HowItWorks.vue               # Component explaining app functionality
├── composables/
│   ├── useBattleHelpers.ts          # UI utility functions
│   └── useBattleApi.ts              # Pinia Colada queries & mutations
└── pages/                           # Route pages
    ├── index.vue                    # Dashboard/home page
    └── battles/
        └── new.vue                  # Create new battle page
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
   - Custom thermal gradient theme with subtle glassmorphism effect
   - Responsive layout with mesh gradient background
   - Consistent typography system using Mono font for headings

4. **Pages & Components**:
   - Dashboard page with battles table and action buttons
   - "How It Works" component for user onboarding
   - New battle creation page with intuitive form
   - Interactive modals for sharing and confirmation actions

## UI Theme Guidelines

### Color Palette

Our thermal theme uses a hot/cold contrast with:

- **Cold Colors**:
  - Primary: `--color-cold-300` (#82AAF7) - Use for primary actions and UI elements
  - Dark accents: `--color-cold-400` (#223466) and `--color-cold-500` (#050A2D)
  - Light accents: `--color-cold-100` (#EDF1F9) and `--color-cold-200` (#BFD5F8)

- **Warm Colors**:
  - Secondary: `--color-warm-300` (#C37554) - Use for secondary/destructive actions
  - Dark accents: `--color-warm-400` (#712303) and `--color-warm-500` (#240800)
  - Light accents: `--color-warm-100` (#F6F1EE) and `--color-warm-200` (#EDD5CE)

### Typography

- **Headings**: Use monospace font (`.font-mono`) for app title, page headings, and section titles
- **Body Text**: Use system font stack for readable content
- **Text Colors**: Use default text color for primary text, `opacity-80` for secondary information

### Design Principles

Our UI follows these core principles:

1. **Minimalism**: Focus on content with clean, uncluttered interfaces
2. **Subtle Depth**: Light glassmorphism effects through `backdrop-blur-sm` on cards
3. **Focused Interactions**: Clear call-to-action elements with proper hierarchy
4. **Intuitive Navigation**: Breadcrumbs, tooltips, and consistent patterns

### Components

- **Cards**: Use `UCard` without borders for a clean, minimal look
- **Buttons**: Use `UButton` with appropriate color variants:
  - Primary actions: `color="primary"` (cold blue)
  - Destructive actions: `color="secondary"` (warm orange)
  - Neutral actions: `color="neutral"` with `variant="ghost"` or `variant="outline"`
- **Inputs**: Use `UInput` with `rounded-md` class for consistent styling
- **Icons**: Use Phosphor icons (`i-ph-*`) for consistent visual language
- **Tables**: Center headers if column content is centered
- **Tooltips**: Use tooltips to provide context without cluttering the UI
- **Modal Dialogs**: Use for confirmations and detailed actions
- **Keyboard Indicators**: Use `UKbd` component for subtle keyboard navigation hints

## Layout Patterns

### Dashboard/Home Page

- Page header with app title ("Versus") and tagline
- Action buttons in the top-right corner
- Main content card with table of battles
- "How It Works" section for new users
- Modals for sharing and confirmation actions

```vue
<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Header -->
    <div class="mb-8 md:flex items-center justify-between">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold font-mono">Versus</h1>
        <p class="mt-2 opacity-80">Easy choices. Hard data.</p>
      </div>

      <div class="flex gap-4 mt-4 md:mt-0">
        <!-- Action buttons -->
      </div>
    </div>
    
    <!-- Main Content -->
    <UCard class="overflow-hidden">
      <!-- Table or content -->
    </UCard>
    
    <!-- Help Section (conditional) -->
    <HowItWorks v-if="condition" />
  </div>
</template>
```

### Form Pages

- Breadcrumb navigation at the top
- Centered page header and description
- Form card with clearly labeled sections
- Form fields with tooltips for validation
- Action buttons at the bottom (right-aligned)

```vue
<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
    <div class="max-w-xl mx-auto mb-6">
      <UBreadcrumb :items="[...]" />
    </div>
    
    <!-- Header -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold font-mono">Page Title</h1>
      <p class="mt-2 opacity-80">Page description</p>
    </div>
    
    <!-- Form -->
    <UCard class="max-w-xl mx-auto">
      <form class="space-y-10">
        <!-- Form content -->
        
        <!-- Submit buttons -->
        <div class="flex justify-end gap-4 pt-4 border-t border-white/5">
          <!-- Action buttons -->
        </div>
      </form>
    </UCard>
  </div>
</template>
```

## Interactive Element Guidelines

### Table Rows

- Add `cursor-pointer` to clickable rows
- Use `hover:bg-white/5 transition-colors` for hover effect
- Add tooltips to action buttons
- Implement truncation for long text with `truncate` class and tooltips

### Form Fields

- Always show keyboard navigation hints with `UKbd` component
- Add proper focus states and keyboard navigation
- Implement inline validation with tooltips
- Use consistent field spacing (`space-y-10` for sections)

### Buttons

- Primary buttons: `color="primary"` with appropriate icon
- Secondary/Cancel buttons: `color="neutral" variant="outline"`
- Destructive buttons: `color="secondary"`
- Ghost buttons: `color="neutral" variant="ghost"` for subtle actions

### Modals

- Use `UModal` with appropriate title and description
- Right-align footer buttons with `:ui="{ footer: 'justify-end' }"`
- Add proper focus management for keyboard accessibility
- Include clear call-to-action in modal content

## Code Style Guidelines

### Vue Components

- Use Composition API with `<script setup>` syntax
- Group related functionality:
  1. Component setup/imports
  2. State and refs
  3. Computed properties
  4. API integration
  5. User actions/event handlers
  6. Lifecycle hooks

### TypeScript Integration

- Add explicit types for all function parameters
- Use type inference where appropriate
- Export shared types from central `types/index.ts` file
- Use appropriate type narrowing techniques

### Pinia Colada Usage

Pinia Colada provides a powerful way to manage API data. Here's how to effectively use it in the project:

#### Using Queries

```vue
<script setup>
import { useAllBattles } from '~/composables/useBattleApi';

// Destructure for better TypeScript support
const { 
  state,
  asyncStatus,
  refresh
} = useAllBattles();
</script>

<template>
  <!-- Loading state -->
  <div v-if="asyncStatus === 'loading' && !state.data">Loading...</div>
  
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

#### Using Mutations

```vue
<script setup>
import { useBattleMutations } from '~/composables/useBattleApi';

// Destructure to get mutation methods and status
const { 
  createBattle: { 
    mutate: createBattleMutate,
    asyncStatus: createStatus
  }
} = useBattleMutations();

const handleSubmit = () => {
  createBattleMutate({
    title: title.value,
    options: options.value
  });
};
</script>

<template>
  <UButton 
    type="submit" 
    color="primary"
    :loading="createStatus === 'loading'"
    :disabled="createStatus === 'loading'"
    @click="handleSubmit"
  >
    Create Battle
  </UButton>
</template>
```

## Next Steps

1. **Battle Voting Interface**:
   - Implement the voting page with head-to-head comparison
   - Create interactive voting buttons with animations
   - Design progress indicator for voting session

2. **Results Visualization**:
   - Design the results page with ranking visualization
   - Implement percentage comparisons and statistics
   - Create share functionality for results

3. **Battle Editing**:
   - Implement the edit battle page
   - Create form for modifying battle title and options
   - Add option for archiving battles

4. **Enhancements & Refinements**:
   - Add animations for transitions between states
   - Implement responsive designs for mobile devices
   - Add clipboard copy confirmations and improved error handling

## Development Approach

For the upcoming implementation, we'll continue our component-first approach:

1. Create reusable components for voting and results visualization
2. Assemble these components into page layouts
3. Integrate with our queries and mutations
4. Test the full flow from battle creation to voting to results

This approach ensures we maintain KISS and DRY principles while building a cohesive, well-structured application.

## Best Practices

1. **Responsive Design**: Ensure all pages work well on mobile and desktop
2. **Accessibility**: Include proper aria attributes and keyboard navigation
3. **Error Handling**: Provide clear error messages and recovery paths
4. **Loading States**: Show appropriate loading indicators during async operations
5. **TypeScript**: Maintain type safety throughout the application
6. **Code Organization**: Keep related functionality together in components and composables
7. **Performance**: Use efficient rendering techniques and avoid unnecessary re-renders

By following these guidelines, we'll create a consistent, maintainable, and user-friendly application.