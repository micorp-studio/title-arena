// app.config.ts
export default defineAppConfig({
    ui: {
      // Couleurs principales
      primary: 'primary',
      secondary: 'secondary',
      
      // Styles globaux des composants
      card: {
        background: 'bg-zinc-900/90 dark:bg-zinc-950',
        rounded: 'rounded-lg',
        shadow: 'shadow-lg',
        ring: 'ring-1 ring-zinc-800/10 dark:ring-white/5',
        divide: 'divide-zinc-800/20 dark:divide-zinc-700/30',
        body: {
          padding: 'p-4'
        }
      },
      
      button: {
        rounded: 'rounded-md',
        font: 'font-medium',
        default: {
          size: 'sm',
          color: 'zinc'
        },
        variant: {
          solid: {
            white: 'shadow-sm ring-1 ring-zinc-700/30 dark:ring-zinc-800 text-zinc-900 dark:text-white bg-white hover:bg-zinc-50 disabled:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800/60',
            gray: 'shadow-sm ring-1 ring-zinc-700/30 dark:ring-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 hover:bg-zinc-100 disabled:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/60',
            black: 'shadow-sm text-white bg-zinc-900 hover:bg-zinc-800 focus-visible:ring-zinc-500 disabled:bg-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900'
          }
        }
      },
      
      table: {
        wrapper: 'overflow-hidden',
        base: 'min-w-full table-fixed',
        divide: 'divide-y divide-zinc-800/30 dark:divide-zinc-700/50',
        thead: 'font-mono tracking-wider',
        tbody: 'divide-y divide-zinc-800/20 dark:divide-zinc-700/30 bg-transparent',
        tr: {
          base: '',
          selected: 'bg-primary-50/50 dark:bg-primary-900/20',
          active: 'hover:bg-zinc-800/10 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors duration-200'
        },
        th: {
          base: 'text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400',
          padding: 'px-4 py-3.5',
          color: 'text-zinc-500 dark:text-zinc-400',
          font: 'font-semibold font-mono'
        },
        td: {
          base: 'whitespace-nowrap',
          padding: 'px-4 py-3'
        }
      },
      
      input: {
        rounded: 'rounded-md',
        placeholder: 'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
        color: {
          white: {
            outline: 'bg-transparent ring-1 ring-zinc-700/30 dark:ring-zinc-700 focus-visible:ring-primary-500/50'
          }
        }
      },
      
      modal: {
        overlay: {
          background: 'bg-black/70 backdrop-blur-sm dark:bg-black/80'
        },
        background: 'bg-zinc-900 dark:bg-zinc-950',
        ring: 'ring-1 ring-white/10'
      },
      
      container: {
        constrained: 'max-w-5xl'
      }
    }
  })
  