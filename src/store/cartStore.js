import { create } from 'zustand';

const priceOf = (item) => Number(item.price || item.unit_price || item.selling_price || 0);

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const id = product.id;
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  updateQty: (id, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0),
}));
