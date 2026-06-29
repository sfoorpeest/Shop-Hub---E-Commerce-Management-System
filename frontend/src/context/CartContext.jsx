import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const GUEST_CART_KEY = "shophub_guest_cart";

const CartContext = createContext(null);

const mapServerItem = (item) => ({
  id: item.id,
  product: item.product,
  variant: item.variant,
  quantity: item.quantity,
});

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServerCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/cart/");
      setCart(data.items.map(mapServerItem));
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeGuestCart = useCallback(
    async (guestItems) => {
      for (const item of guestItems) {
        try {
          await axios.post("/api/v1/cart/items", {
            variant_id: item.variant.id,
            quantity: item.quantity,
          });
        } catch (err) {
          console.error("Failed to merge cart item:", err);
        }
      }
      localStorage.removeItem(GUEST_CART_KEY);
      await fetchServerCart();
    },
    [fetchServerCart]
  );

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      const guestRaw = localStorage.getItem(GUEST_CART_KEY);
      if (guestRaw) {
        try {
          const guestItems = JSON.parse(guestRaw);
          if (guestItems.length > 0) {
            mergeGuestCart(guestItems);
            return;
          }
        } catch {
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
      fetchServerCart();
    } else {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  }, [isAuthenticated, authLoading, fetchServerCart, mergeGuestCart]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, authLoading]);

  const addToCart = async (product, variant, quantity = 1) => {
    if (isAuthenticated) {
      try {
        await axios.post("/api/v1/cart/items", {
          variant_id: variant.id,
          quantity,
        });
        await fetchServerCart();
      } catch (err) {
        const detail =
          err.response?.data?.detail || "Không thể thêm vào giỏ hàng.";
        alert(typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.variant.id === variant.id
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + quantity;
        if (newQty > variant.stock_quantity) {
          alert(
            `Chỉ còn ${variant.stock_quantity} sản phẩm trong kho.`
          );
          return prevCart;
        }
        newCart[existingIndex].quantity = newQty;
        return newCart;
      }

      if (quantity > variant.stock_quantity) {
        alert(`Chỉ còn ${variant.stock_quantity} sản phẩm trong kho.`);
        return prevCart;
      }
      return [...prevCart, { product, variant, quantity }];
    });
  };

  const removeFromCart = async (variantId) => {
    const item = cart.find((i) => i.variant.id === variantId);

    if (isAuthenticated && item?.id) {
      try {
        await axios.delete(`/api/v1/cart/items/${item.id}`);
        await fetchServerCart();
      } catch (err) {
        console.error("Failed to remove cart item:", err);
      }
      return;
    }

    setCart((prev) => prev.filter((i) => i.variant.id !== variantId));
  };

  const updateQuantity = async (variantId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(variantId);
      return;
    }

    const item = cart.find((i) => i.variant.id === variantId);

    if (isAuthenticated && item?.id) {
      if (quantity > item.variant.stock_quantity) {
        alert(`Chỉ còn ${item.variant.stock_quantity} sản phẩm trong kho.`);
        return;
      }
      try {
        await axios.put(`/api/v1/cart/items/${item.id}`, { quantity });
        await fetchServerCart();
      } catch (err) {
        const detail = err.response?.data?.detail || "Cập nhật giỏ hàng thất bại.";
        alert(typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      return;
    }

    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        if (cartItem.variant.id === variantId) {
          if (quantity > cartItem.variant.stock_quantity) {
            alert(
              `Chỉ còn ${cartItem.variant.stock_quantity} sản phẩm trong kho.`
            );
            return cartItem;
          }
          return { ...cartItem, quantity };
        }
        return cartItem;
      })
    );
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await axios.delete("/api/v1/cart/");
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
    setCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      (item.product.base_price + (item.variant.additional_price || 0)) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        loading,
        refreshCart: fetchServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
