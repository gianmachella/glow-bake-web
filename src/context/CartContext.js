"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // ✅ cargar desde localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // ✅ guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const clearCart = () => {
    setCartItems([]);
  };

  const addToCart = (product) => {
    console.log("Adding to cart:", product); // 👈 debug
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prevItems, product];
    });
  };

  const increment = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrement = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Sets an item's quantity directly (stepper cap, typed input, stock clamp).
  // Quantities <= 0 remove the item, same as decrementing to zero.
  const setQuantity = (id, quantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Reconciles the cart against a live { [cookieId]: remainingStock } map —
  // called by the cart page on load/focus/before checkout so a quantity added
  // earlier (or a batch that sold out/shrank since) never survives past the
  // real stock. Items missing from the map are no longer on the active weekly
  // menu at all and are dropped; items over their live remaining are clamped.
  // Returns the list of adjustments made, so the caller can surface them.
  const reconcileStock = (stockById) => {
    const changes = [];
    const next = cartItems
      .map((item) => {
        const remaining = stockById[item.id];
        if (remaining === undefined || remaining <= 0) {
          changes.push({ id: item.id, name: item.name, remaining: 0, removed: true });
          return null;
        }
        if (item.quantity > remaining) {
          changes.push({ id: item.id, name: item.name, remaining, removed: false });
          return { ...item, quantity: remaining };
        }
        return item;
      })
      .filter(Boolean);

    if (changes.length > 0) {
      setCartItems(next);
    }
    return changes;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increment,
        decrement,
        setQuantity,
        reconcileStock,
        deleteFromCart,
        cartCount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
