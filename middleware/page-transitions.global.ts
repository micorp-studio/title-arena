// middleware/page-transitions.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
    // Skip on initial page load
    if (!from.path) return;
    
    // Helper function to determine page depth/level
    const getPageLevel = (path: string): number => {
      if (path === '/') return 0;
      
      // Battles list is level 1
      if (path === '/battles') return 1;
      
      // New battle form is level 2
      if (path.includes('/battles/new')) return 2;
      
      // Battle specific views (in ascending hierarchy)
      if (path.includes('/battles/') && path.includes('/created')) return 3;
      if (path.includes('/battles/') && path.includes('/edit')) return 4;
      if (path.includes('/battles/') && path.includes('/vote')) return 5;
      if (path.includes('/battles/') && path.includes('/results')) return 6;
      
      // Default for other battle pages
      if (path.includes('/battles/')) return 2;
      
      // Fallback for any other page
      return 1;
    };
    
    // Get levels for current routes
    const fromLevel = getPageLevel(from.path);
    const toLevel = getPageLevel(to.path);
    
    // Apply transition based on navigation direction
    if (toLevel > fromLevel) {
      // Going deeper in the navigation hierarchy
      to.meta.pageTransition = { name: 'slide-left', mode: 'out-in' };
    } else if (toLevel < fromLevel) {
      // Going back in the navigation hierarchy
      to.meta.pageTransition = { name: 'slide-right', mode: 'out-in' };
    } else {
      // Same level - subtle fade as default
      to.meta.pageTransition = { name: 'slide-right', mode: 'out-in' };
    }
  });
  