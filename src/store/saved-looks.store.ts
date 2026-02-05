// src/store/saved-looks.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedLooksState {
  savedLookIds: string[];
  toggleLook: (lookId: string) => void;
  isLookSaved: (lookId: string) => boolean;
}

export const useSavedLooksStore = create<SavedLooksState>()(
  persist(
    (set, get) => ({
      savedLookIds: [],
      
      toggleLook: (lookId: string) => {
        set((state) => {
          const isCurrentlySaved = state.savedLookIds.includes(lookId);
          
          if (isCurrentlySaved) {
            // Retirer le look des favoris
            return {
              savedLookIds: state.savedLookIds.filter(id => id !== lookId)
            };
          } else {
            // Ajouter le look aux favoris
            return {
              savedLookIds: [...state.savedLookIds, lookId]
            };
          }
        });
      },
      
      isLookSaved: (lookId: string) => {
        return get().savedLookIds.includes(lookId);
      },
    }),
    {
      name: 'saved-looks-storage', // Nom dans le localStorage
    }
  )
);