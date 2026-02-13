import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Vehicle } from '@/data/mockVehicles';
import { supabase } from '@/integrations/supabase/client';

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

  // Auto-remove vehicles from cart when their order is completed by admin
  const syncWithCompletedOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: completedOrders } = await supabase
      .from('orders')
      .select('vehicle_ids')
      .eq('user_id', session.user.id)
      .eq('status', 'completed');

    if (completedOrders && completedOrders.length > 0) {
      const completedVehicleIds = new Set(
        completedOrders.flatMap((o) => o.vehicle_ids || [])
      );
      setItems((prev) => {
        const filtered = prev.filter((i) => !completedVehicleIds.has(i.vehicle.id));
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  }, []);

  // Check on mount and when auth changes
  useEffect(() => {
    syncWithCompletedOrders();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncWithCompletedOrders();
    });

    return () => subscription.unsubscribe();
  }, [syncWithCompletedOrders]);

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
