import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Crear un ID único que incluya el talle si existe
      const productId = action.payload.id;
      const selectedSize = action.payload.selectedSize;
      const uniqueId = selectedSize ? `${productId}-${selectedSize}` : productId;
      
      const existingItem = state.items.find(item => {
        const itemUniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
        return itemUniqueId === uniqueId;
      });
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item => {
            const itemUniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
            return itemUniqueId === uniqueId
              ? { ...item, quantity: item.quantity + 1 }
              : item;
          })
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, uniqueId }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => {
          const itemUniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
          return itemUniqueId !== action.payload;
        })
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item => {
          const itemUniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
          return itemUniqueId === action.payload.uniqueId
            ? { ...item, quantity: action.payload.quantity }
            : item;
        }).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('phenom-cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('phenom-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (uniqueId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: uniqueId });
  };

  const updateQuantity = (uniqueId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { uniqueId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
