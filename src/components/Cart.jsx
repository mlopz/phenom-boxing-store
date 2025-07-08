import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = ({ isOpen, onClose, onCheckout }) => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleQuantityChange = (uniqueId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(uniqueId);
    } else {
      updateQuantity(uniqueId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onCheckout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-phenom-dark shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <h2 className="aggressive-text text-2xl text-white">
              CARRITO <span className="text-phenom-red">({items.length})</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">Tu carrito está vacío</p>
                <button
                  onClick={onClose}
                  className="bg-phenom-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => {
                  const uniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
                  const displayImage = item.images && item.images.length > 0 ? item.images[0] : item.image;
                  
                  return (
                    <div key={uniqueId} className="bg-phenom-black rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start space-x-4">
                        <img
                          src={displayImage}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                          {item.selectedSize && (
                            <p className="text-gray-400 text-sm mb-1">Talle: <span className="text-phenom-red font-semibold">{item.selectedSize}</span></p>
                          )}
                          <p className="text-phenom-red font-bold">${item.price}</p>
                        
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3 mt-2">
                            <button
                              onClick={() => handleQuantityChange(uniqueId, item.quantity - 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(uniqueId, item.quantity + 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(uniqueId)}
                          className="text-gray-400 hover:text-phenom-red transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right mt-2">
                        <span className="text-gray-400">Subtotal: </span>
                        <span className="text-white font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-600 p-6 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="aggressive-text text-xl text-white">TOTAL:</span>
                <span className="aggressive-text text-2xl text-phenom-red">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-red text-white py-3 rounded-lg font-bold text-lg hover-scale pulse-glow transition-all"
                >
                  PROCEDER AL PAGO
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full border border-gray-600 text-gray-400 hover:text-white hover:border-white py-2 rounded-lg transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
