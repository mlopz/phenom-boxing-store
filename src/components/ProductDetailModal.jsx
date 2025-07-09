import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Star, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Usar images array o fallback a image único
  const images = product?.images || (product?.image ? [product.image] : []);
  const hasSizes = product?.sizes && product.sizes.length > 0;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedSize('');
      setShowSizeModal(false);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const nextImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (hasSizes) {
      setShowSizeModal(true);
    } else {
      addToCart(product);
      onClose();
    }
  };

  const handleAddToCartWithSize = () => {
    if (selectedSize || !hasSizes) {
      const productWithSize = hasSizes ? { ...product, selectedSize } : product;
      addToCart(productWithSize);
      setShowSizeModal(false);
      setSelectedSize('');
      onClose();
    }
  };

  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setSelectedSize('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-phenom-dark rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="aggressive-text text-2xl text-white">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-phenom-black rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex] || '/placeholder-image.jpg'}
                alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />
              
              {/* Navigation arrows for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-phenom-red hover:bg-red-700 text-white p-3 rounded-full transition-all z-30 cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-phenom-red hover:bg-red-700 text-white p-3 rounded-full transition-all z-30 cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Stock indicator */}
              {product.inStock && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>EN STOCK</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-phenom-red' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-gray-400 text-sm">(4.8)</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-phenom-red">
                  ${product.price}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Descripción</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Características</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-phenom-red flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Tallas Disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="bg-phenom-black border border-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all flex items-center justify-center space-x-3 text-lg ${
                  product.inStock
                    ? 'bg-gradient-red hover:shadow-lg hover-scale pulse-glow'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                <span>
                  {product.inStock ? 'AGREGAR AL CARRITO' : 'AGOTADO'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Size Selection Modal - Diseño limpio y coherente */}
        {showSizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="bg-phenom-dark rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              {/* Header simple */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Seleccionar Talle</h3>
                <button
                  onClick={handleCloseSizeModal}
                  className="text-gray-400 hover:text-white p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Información del producto */}
              <div className="mb-6">
                <h4 className="text-white font-semibold text-lg mb-1">{product.name}</h4>
                <p className="text-gray-400">${product.price}</p>
                {product.sizeStock && (
                  <p className="text-gray-500 text-sm mt-1">
                    Disponibilidad por talle
                  </p>
                )}
              </div>
              
              {/* Grid de talles */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map((size) => {
                    const isOutOfStock = product.sizeStock && product.sizeStock[size] === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`py-3 px-4 rounded-lg border transition-all font-medium relative ${
                          isOutOfStock
                            ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                            : selectedSize === size
                            ? 'border-phenom-red bg-phenom-red text-white'
                            : 'border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
                        }`}
                      >
                        {size}
                        {isOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-normal">Agotado</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseSizeModal}
                  className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCartWithSize}
                  disabled={!selectedSize}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedSize
                      ? 'bg-phenom-red text-white hover:bg-red-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
