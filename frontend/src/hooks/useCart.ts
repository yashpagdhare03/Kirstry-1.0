import { useState, useCallback } from 'react';
import { type Product } from '../services/products';

export interface CartItem {
  product_id: string;
  name: string;
  unit: string;
  mrp: number;
  unit_price: number; // selling price
  quantity: number;
  available_stock: number;
  barcode?: string;
  image_url?: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'credit'>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const addItem = useCallback((product: Product, quantityToAdd: number = 1) => {
    const pid = product.product_id || (product as any).id;
    const availStock = product.total_stock ?? (product as any).current_stock ?? 999;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product_id === pid);
      if (existingIndex >= 0) {
        const existingItem = prevItems[existingIndex];
        const newQty = Math.min(existingItem.quantity + quantityToAdd, availStock);
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQty,
        };
        return updatedItems;
      } else {
        const initialQty = Math.min(quantityToAdd, availStock);
        const newItem: CartItem = {
          product_id: pid,
          name: product.name,
          unit: product.unit || 'pcs',
          mrp: product.mrp || product.selling_price || 0,
          unit_price: product.selling_price || 0,
          quantity: initialQty,
          available_stock: availStock,
          barcode: product.barcode,
          image_url: product.image_url,
        };
        return [...prevItems, newItem];
      }
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.product_id === productId) {
            const validQty = Math.max(1, Math.min(quantity, item.available_stock));
            return { ...item, quantity: validQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(0);
    setPaymentMode('cash');
    setSelectedCustomerId('');
    setNotes('');
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    discount,
    paymentMode,
    selectedCustomerId,
    notes,
    subtotal,
    grandTotal,
    totalItemCount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    setPaymentMode,
    setSelectedCustomerId,
    setNotes,
    clearCart,
  };
}
