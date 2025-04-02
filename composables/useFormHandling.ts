// composables/useFormHandling.ts
import { ref, computed } from 'vue';

interface FormOptions {
  minTitleLength?: number;
  minOptions?: number;
}

export function useFormHandling(options: FormOptions = {}) {
  const {
    minTitleLength = 3,
    minOptions = 2
  } = options;

  // Input references for focus management
  const titleInputRef = ref<HTMLInputElement | null>(null);
  const optionInputsRef = ref<HTMLInputElement[]>([]);

  // Form state tracking
  const formIsDirty = ref(false);
  const formIsSubmitting = ref(false);

  // Register an input reference
  const registerOptionInput = (el: any, index: number) => {
    if (el) {
      optionInputsRef.value[index] = el.inputRef;
    }
  };

  // Focus an option input by index
  const focusOptionInput = (index: number) => {
    nextTick(() => {
      if (optionInputsRef.value[index]) {
        const input = optionInputsRef.value[index];
        input.focus();
        
        // Place cursor at the end
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    });
  };

  // Focus the title input
  const focusTitleInput = () => {
    nextTick(() => {
      if (titleInputRef.value) {
        titleInputRef.value.focus();
      }
    });
  };

  // Handle keydown in title input
  const handleTitleKeyDown = (event: KeyboardEvent, options: string[] = []) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      // Focus the first option or add a new one if none exist
      if (options.length === 0) {
        // This should be handled by parent component
        return;
      }
      
      // Focus the first option
      focusOptionInput(0);
    }
  };

  // Handle keydown in option input
  const handleOptionKeyDown = (event: KeyboardEvent, index: number, options: string[], addOption: () => void) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      // If this is the last option, add a new one
      if (index === options.length - 1) {
        addOption();
      } else {
        // Otherwise focus the next option
        focusOptionInput(index + 1);
      }
    }
  };

  // Validate title
  const validateTitle = (title: string) => {
    return title.trim().length >= minTitleLength;
  };

  // Validate options
  const validateOptions = (options: string[] | { content: string }[]) => {
    const nonEmptyOptions = options.filter(option => {
      if (typeof option === 'string') {
        return option.trim().length > 0;
      }
      return option.content.trim().length > 0;
    });
    
    return nonEmptyOptions.length >= minOptions;
  };

  // Create confirmation dialog for unsaved changes
  const confirmUnsavedChanges = (callback: () => void) => {
    if (!formIsDirty.value) {
      callback();
      return;
    }
    
    // This would ideally use a UI dialog, but for simplicity:
    if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      callback();
    }
  };

  // Mark form as clean (e.g., after successful submission)
  const markFormAsClean = () => {
    formIsDirty.value = false;
  };

  // Mark form as dirty (on input change)
  const markFormAsDirty = () => {
    formIsDirty.value = true;
  };

  return {
    // References
    titleInputRef,
    optionInputsRef,
    
    // State
    formIsDirty,
    formIsSubmitting,
    
    // Methods
    registerOptionInput,
    focusOptionInput,
    focusTitleInput,
    handleTitleKeyDown,
    handleOptionKeyDown,
    validateTitle,
    validateOptions,
    confirmUnsavedChanges,
    markFormAsClean,
    markFormAsDirty
  };
}
