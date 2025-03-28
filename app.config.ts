// app.config.ts
export default defineAppConfig({
  ui: {
    // Theme colors
    colors: {
      primary: 'warm-300',  // Custom color
      secondary: 'cold-300',  // Custom color
      info: 'frost',
      success: 'emerald',
      warning: 'amber',
      error: 'warm-400'
    },
    
    // Customize card component for minimalist design
    card: {
      slots: {
        root: 'backdrop-blur-md bg-cold-200/5 rounded-[calc(var(--ui-radius)*1.5)] shadow-xl',
        header: 'p-5',
        body: 'p-5',
        footer: 'p-5'
      },
      // Modify existing variants
      variants: {
        variant: {
          subtle: {
            root: 'backdrop-blur-md bg-cold-200/5 shadow-xl'
          },
          outline: {
            root: 'backdrop-blur-md bg-cold-200/5 shadow-xl' 
          },
          soft: {
            root: 'backdrop-blur-md bg-cold-200/10 shadow-xl'
          },
          solid: {
            root: 'backdrop-blur-md bg-cold-200/20 shadow-xl text-warm-500'
          }
        }
      },
      defaultVariants: {
        variant: 'subtle'
      }
    },
    
    // Customize button component
    button: {
      slots: {
        base: 'font-mono font-medium'
      }
    }
  }
})
