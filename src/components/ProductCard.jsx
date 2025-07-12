import React, { useState } from 'react';
import { ShoppingCart, Star, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductDetailModal from './ProductDetailModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // Usar images array o fallback a image único
  const images = product.images || (product.image ? [product.image] : []);
  const hasSizes = product.sizes && product.sizes.length > 0;

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
      // Si tiene tallas, abrir selector de tallas directo
      setShowSizeModal(true);
    } else {
      // Si no tiene tallas, agregar directamente al carrito
      addToCart(product);
    }
  };

  const handleProductClick = () => {
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const handleAddToCartWithSize = () => {
    if (selectedSize || !hasSizes) {
      const productWithSize = hasSizes ? { ...product, selectedSize } : product;
      addToCart(productWithSize);
      setShowSizeModal(false);
      setSelectedSize('');
    }
  };

  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setSelectedSize('');
  };

  return (
    <>
      <div className="relative group cursor-pointer select-none card-retro shadow-lg hover:shadow-2xl transition-transform duration-150 hover:scale-105" onClick={handleProductClick}>
        {/* Product Image Gallery */}
        <div className="relative overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
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
                className="absolute left-2 top-1/2 transform -translate-y-1/2 btn-retro-outline p-1 rounded-full z-10"
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-retro-outline p-1 rounded-full z-10"
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
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
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-spartan font-extrabold text-primary-red group-hover:text-black transition-colors heading mb-1">{product.name}</h3>
          
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

          {/* Add to Cart Button - Alineado al final */}
          <button
            className="mt-3 w-full btn-retro text-lg flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <ShoppingCart className="inline-block -mt-1" /> Agregar al carrito
          </button>
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
              <span className="text-primary-red font-extrabold text-2xl">${product.price}</span>
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
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={product}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </>
  );
};

export default ProductCard;
