import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'shop_cart';

/* ---------- Helper: read / write localStorage ---------- */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------- Recompute subtotal whenever items change ---------- */
  useEffect(() => {
    const sum = items.reduce(
      (acc, i) => acc + Number(i.price) * i.quantity,
      0
    );
    setSubtotal(sum);
    saveCart(items);
  }, [items]);

  /* ---------- Load persisted cart on mount ---------- */
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      // Local-only: read from localStorage
      const stored = loadCart();
      setItems(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  /* ---------- Clear cart if user logs out (optional) ---------- */
  useEffect(() => {
    if (!user) {
      // keep the cart even when logged out — remove this block
      // if you want to wipe it on logout
    }
  }, [user]);

  /* ---------- Add to cart ---------- */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    // Lazy-import MOCK_PRODUCTS so we don't hit a circular dependency
    const { MOCK_PRODUCTS } = await import('../pages/Shop');
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);

    if (!product) {
      const err = new Error('Product not found');
      err.response = { data: { message: 'Product not found' } };
      throw err;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      if (existing) {
        return prev.map((i) =>
          i.product_id === productId
            ? {
                ...i,
                quantity: Math.min(i.quantity + quantity, product.stock),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          cart_item_id: `${productId}-${Date.now()}`,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image_url: product.image_url,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  }, []);

  /* ---------- Update quantity ---------- */
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cart_item_id === cartItemId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i
      )
    );
  }, []);

  /* ---------- Remove item ---------- */
  const removeItem = useCallback(async (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  }, []);

  /* ---------- Clear cart ---------- */
  const clearCart = useCallback(async () => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}