/**
 * Modal Utilities for handling modal display
 */

// Function to teleport modal content to the modal container
export function setupModalContainer() {
  // Check if browser environment
  if (typeof window === 'undefined') return;
  
  // Make sure the modal container exists
  let modalContainer = document.getElementById('modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    
    // Apply essential styles directly to ensure modal container works correctly
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.right = '0';
    modalContainer.style.bottom = '0';
    modalContainer.style.pointerEvents = 'none';
    modalContainer.style.zIndex = '2000';
    
    // Insert after the navbar if it exists, otherwise append to body
    const navbar = document.querySelector('.navbar') || document.querySelector('header');
    if (navbar && navbar.parentNode) {
      navbar.parentNode.insertBefore(modalContainer, navbar.nextSibling);
    } else {
      document.body.appendChild(modalContainer);
    }
  }
  
  return modalContainer;
}

// Initialize modal container when the file is imported
setupModalContainer();

export default {
  setupModalContainer
};
