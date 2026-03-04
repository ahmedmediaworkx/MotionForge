import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Sidebar
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  
  // Modals
  isUpgradeModalOpen: false,
  upgradeModalFeature: null,
  
  // Theme
  theme: 'dark',
  
  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  
  openUpgradeModal: (feature) => set({ 
    isUpgradeModalOpen: true, 
    upgradeModalFeature: feature 
  }),
  closeUpgradeModal: () => set({ 
    isUpgradeModalOpen: false, 
    upgradeModalFeature: null 
  }),
  
  setTheme: (theme) => set({ theme }),
}));