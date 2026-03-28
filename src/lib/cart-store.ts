import { create } from "zustand";
import type { CartItem, TicketType } from "./types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (ticketId: string) => void;
  updateQuantity: (ticketId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.ticketType.id === item.ticketType.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.ticketType.id === item.ticketType.id
              ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.ticketType.max_per_order) }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (ticketId) =>
    set((state) => ({ items: state.items.filter((i) => i.ticketType.id !== ticketId) })),
  updateQuantity: (ticketId, quantity) =>
    set((state) => ({
      items: quantity === 0
        ? state.items.filter((i) => i.ticketType.id !== ticketId)
        : state.items.map((i) => (i.ticketType.id === ticketId ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.ticketType.price * i.quantity, 0),
}));
