import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,

      addItem: (product, quantity = 1, customization = null) => {
        const items = get().items;
        const existing = items.find(i => i.product_id === product.id);
        if (existing) {
          set({ items: items.map(i =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )});
          toast.success('Cart updated');
        } else {
          set({ items: [...items, {
            id: Date.now(),
            product_id:   product.id,
            name:         product.name,
            slug:         product.slug,
            price:        product.price,
            sale_price:   product.sale_price,
            image:        product.image,
            quantity,
            customization,
          }]});
          toast.success('Added to cart!');
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
        toast.success('Removed from cart');
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) { get().removeItem(id); return; }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], coupon: null, discount: 0 }),

      applyCoupon: (coupon, discount) => set({ coupon, discount }),
      removeCoupon: () => set({ coupon: null, discount: 0 }),

      getSubtotal: () => get().items.reduce(
        (sum, i) => sum + (parseFloat(i.sale_price || i.price) * i.quantity), 0
      ),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount || 0;
        const shipping = subtotal - discount >= 999 ? 0 : 79;
        return subtotal - discount + shipping;
      },

      getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: 'cfm_cart',
      partialize: (s) => ({ items: s.items, coupon: s.coupon, discount: s.discount }),
    }
  )
);

export default useCartStore;
