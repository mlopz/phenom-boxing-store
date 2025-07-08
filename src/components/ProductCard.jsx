import React, { useState } from 'react';
import { ShoppingCart, Star, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // Usar images array o fallback a image único
  const images = product.images || (product.image ? [product.image] : []);
  const hasSizes = product.sizes && product.sizes.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (hasSizes) {
      setShowSizeModal(true);
    } else {
      addToCart(product);
    }
  };

  const handleAddToCartWithSize = () => {
    if (selectedSize || !hasSizes) {
      const productWithSize = hasSizes ? { ...product, selectedSize } : product;
      addToCart(productWithSize);
      setShowSizeModal(false);
      setSelectedSize('');
    }
  };

  return (
    <div className="bg-phenom-dark rounded-lg overflow-hidden shadow-lg hover-scale transition-all duration-300 border border-gray-700 hover:border-phenom-red group">
      {/* Product Image Gallery */}
      <div className="relative overflow-hidden">
        <img
          src={images[currentImageIndex] || '/placeholder-image.jpg'}
          alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Image indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-phenom-red' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {product.inStock && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <Check className="h-3 w-3" />
            <span>EN STOCK</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-phenom-black via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="aggressive-text text-xl text-white mb-2 group-hover:text-phenom-red transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="bg-phenom-red bg-opacity-20 text-phenom-red text-xs px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
            <span className="text-gray-400 text-sm ml-2">(4.8)</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-phenom-red">
              ${product.price}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-gradient-red hover:shadow-lg hover-scale pulse-glow'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{product.inStock ? (hasSizes ? 'SELECCIONAR TALLE' : 'AGREGAR AL CARRITO') : 'AGOTADO'}</span>
        </button>
      </div>

      {/* Size Selection Modal - Mejorado para mayor visibilidad */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-phenom-dark border-2 border-phenom-red rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-scale-in">
            {/* Header con icono llamativo */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-phenom-red p-2 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">¡Selecciona tu Talle!</h3>
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Información del producto */}
            <div className="mb-6 p-4 bg-phenom-black rounded-lg border border-gray-700">
              <h4 className="text-phenom-red font-bold text-lg mb-2">{product.name}</h4>
              <p className="text-white font-semibold text-xl">${product.price}</p>
              <p className="text-gray-300 text-sm mt-2">👆 Elige el talle perfecto para ti:</p>
            </div>
            
            {/* Grid de talles mejorado */}
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-4 px-4 rounded-xl border-2 transition-all font-bold text-lg hover:scale-105 ${
                      selectedSize === size
                        ? 'border-phenom-red bg-phenom-red bg-opacity-30 text-phenom-red shadow-lg pulse-glow'
                        : 'border-gray-600 text-gray-300 hover:border-phenom-red hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              {/* Indicador de selección */}
              {selectedSize && (
                <div className="mt-4 p-3 bg-phenom-red bg-opacity-20 border border-phenom-red rounded-lg">
                  <p className="text-phenom-red font-semibold text-center">
                    ✅ Talle seleccionado: <span className="font-bold">{selectedSize}</span>
                  </p>
                </div>
              )}
              
              {!selectedSize && (
                <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-400 font-semibold text-center">
                    ⚠️ Por favor selecciona un talle para continuar
                  </p>
                </div>
              )}
            </div>
            
            {/* Botones de acción mejorados */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSizeModal(false)}
                className="flex-1 py-3 px-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddToCartWithSize}
                disabled={!selectedSize}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  selectedSize
                    ? 'bg-gradient-red text-white hover:shadow-xl hover:scale-105 pulse-glow'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Agregar al Carrito</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
