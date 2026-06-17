import { useState, useEffect } from "react";
import { CartContext } from "./CartContextCore.js";
import { getProductKey } from "../utils/productCategories.js";


export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const productKey = getProductKey(product);
      const existingItem = prevItems.find(
        item => getProductKey(item) === productKey
      );

      if (existingItem) {
        return prevItems.map(item =>
          getProductKey(item) === productKey
            ? {
                ...item,
                quantity: item.quantity + 1,
                prescriptionImagePath:
                  product.prescriptionImagePath ||
                  item.prescriptionImagePath ||
                  item.prescriptionCardImage
              }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems =>
      prevItems.filter(item => getProductKey(item) !== id)
    );
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        getProductKey(item) === id ? { ...item, quantity } : item
      )
    );
  };

  const updatePrescriptionCard = (id, prescriptionImagePath) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        getProductKey(item) === id
          ? { ...item, prescriptionImagePath, prescriptionCardImage: "" }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updatePrescriptionCard,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
