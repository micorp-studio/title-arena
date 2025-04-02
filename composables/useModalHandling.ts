// composables/useModalHandling.ts
import { ref } from 'vue';

interface ModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  preventScroll?: boolean;
}

export function useModalHandling(options: ModalOptions = {}) {
  const {
    onOpen,
    onClose,
    preventScroll = true
  } = options;

  const isOpen = ref(false);
  const modalData = ref<any>(null);

  // Open modal with optional data
  const openModal = (data?: any) => {
    modalData.value = data;
    isOpen.value = true;
    
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
    
    if (onOpen) {
      onOpen();
    }
  };

  // Close modal
  const closeModal = () => {
    isOpen.value = false;
    
    if (preventScroll) {
      document.body.style.overflow = '';
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Toggle modal state
  const toggleModal = (data?: any) => {
    if (isOpen.value) {
      closeModal();
    } else {
      openModal(data);
    }
  };

  // Clean up on component unmount
  onUnmounted(() => {
    if (preventScroll && isOpen.value) {
      document.body.style.overflow = '';
    }
  });

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal
  };
}
