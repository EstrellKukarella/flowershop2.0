import { createContext, useContext, useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, size, color) => {
                const items = get().items;
                const existingItemIndex = items.findIndex(
                    item => item.id === product.id && item.size === size && item.color === color
                );

                if (existingItemIndex > -1) {
                    const newItems = [...items];
                    newItems[existingItemIndex].quantity += 1;
                    set({ items: newItems });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                ...product,
                                size,
                                color,
                                quantity: 1,
                                cartId: `${product.id}-${size}-${color}`
                            }
                        ]
                    });
                }
            },
            removeItem: (cartId) => {
                set({ items: get().items.filter(item => item.cartId !== cartId) });
            },
            updateQuantity: (cartId, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map(item =>
                        item.cartId === cartId ? { ...item, quantity } : item
                    )
                });
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce((sum, item) => {
                    const price = item.sale_price || item.price;
                    return sum + price * item.quantity;
                }, 0);
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const store = useCartStore();
    return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export const useCart = () => {
    const store = useContext(CartContext);
    if (!store) throw new Error('useCart must be used within CartProvider');
    return store;
};
