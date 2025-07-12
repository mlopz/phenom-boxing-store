import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Zap, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = ({ onCartClick, onMenuClick, onAdminClick }) => {
  const { getCartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItemsCount = getCartItemsCount();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <header className="bg-cream-white border-b-4 border-primary-red sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-retro-red p-2 rounded-xl border-2 border-black flex items-center justify-center shadow-md">
              <Zap className="h-8 w-8 text-cream" />
            </div>
            <div>
              <h1 className="text-4xl font-spartan font-extrabold text-primary-red tracking-tight leading-none drop-shadow heading">
                PHENOM
              </h1>
              <p className="text-industrial text-xs font-bold tracking-widest uppercase mt-1">
                DEPORTE • BIENESTAR • RECUPERACIÓN
              </p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="btn-retro-outline text-base">
              INICIO
            </a>
            <a href="#productos" className="btn-retro-outline text-base">
              PRODUCTOS
            </a>
            <a href="#categorias" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
              CATEGORÍAS
            </a>
            <a href="#contacto" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
              CONTACTO
            </a>
          </nav>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Admin Button (discreto) */}
            <button
              onClick={onAdminClick}
              className="hidden md:block text-gray-500 hover:text-phenom-red p-2 rounded-lg transition-all"
              title="Panel de Administración"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative bg-phenom-red hover:bg-red-700 text-white p-3 rounded-lg transition-all hover-scale pulse-glow"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-phenom-red text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center cart-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white hover:text-phenom-red transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-phenom-red pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#inicio" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
                INICIO
              </a>
              <a href="#productos" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
                PRODUCTOS
              </a>
              <a href="#categorias" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
                CATEGORÍAS
              </a>
              <a href="#contacto" className="text-white hover:text-phenom-red transition-colors font-semibold tracking-wide">
                CONTACTO
              </a>
              <button
                onClick={onAdminClick}
                className="text-left text-gray-400 hover:text-phenom-red transition-colors font-semibold tracking-wide flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>ADMINISTRACIÓN</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
