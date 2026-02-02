import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface CartItem {
  productId: string;
  shadeId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  shade: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, shadeId: string) => void;
  updateQuantity: (productId: string, quantity: number, shadeId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Ajouter un produit au panier
      addItem: (item: CartItem) => {
        set((state) => {
          // Vérifier si le produit avec cette shade existe déjà
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.shadeId === item.shadeId
          );

          if (existingItem) {
            // Si existe, augmenter la quantité
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.shadeId === item.shadeId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          } else {
            // Sinon, ajouter le nouveau produit
            return {
              items: [...state.items, item],
            };
          }
        });
      },

      // Retirer un produit du panier
      removeItem: (productId: string, shadeId: string) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.shadeId === shadeId)
          ),
        }));
      },

      // Mettre à jour la quantité d'un produit
      updateQuantity: (productId: string, quantity: number, shadeId: string) => {
        set((state) => {
          if (quantity <= 0) {
            // Si quantité = 0, retirer le produit
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.shadeId === shadeId)
              ),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId && i.shadeId === shadeId
                ? { ...i, quantity }
                : i
            ),
          };
        });
      },

      // Vider le panier
      clearCart: () => {
        set({ items: [] });
      },

      // Obtenir le nombre total d'articles (somme des quantités)
      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      },

      // Obtenir le nombre de lignes dans le panier
      getTotalItems: () => {
        return get().items.length;
      },

      // Obtenir le prix total du panier
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);