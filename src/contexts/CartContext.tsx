import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle } from '@/data/mockVehicles';

interface CartItem {
  vehicle: Vehicle;
  addedAt: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (vehicle: Vehicle) => void;
  removeFromCart: (vehicleId: string) => void;
  clearCart: () => void;
  isInCart: (vehicleId: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'mcd-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (vehicle: Vehicle) => {
    setItems((prev) => {
      if (prev.some((i) => i.vehicle.id === vehicle.id)) return prev;
      return [...prev, { vehicle, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromCart = (vehicleId: string) => {
    setItems((prev) => prev.filter((i) => i.vehicle.id !== vehicleId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (vehicleId: string) => items.some((i) => i.vehicle.id === vehicleId);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, itemCount: items.length }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
