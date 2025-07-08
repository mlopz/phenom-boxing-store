import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';
import CatalogLoader from './components/CatalogLoader';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCatalogLoader, setShowCatalogLoader] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
  };

  const handleShopClick = () => {
    // Scroll to products section
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryId) => {
    // Set the selected category for filtering
    setSelectedCategory(categoryId);
    // Scroll to products section
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminAccess = () => {
    setShowAdminPanel(true);
  };

  const handleBackToStore = () => {
    setShowAdminPanel(false);
  };

  // Detectar si la URL contiene /admin, /catalog-loader o parámetros de pago
  React.useEffect(() => {
    if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
      setShowAdminPanel(true);
    }
    
    if (window.location.hash.includes('catalog-loader')) {
      setShowCatalogLoader(true);
    }
    
    // Detectar parámetros de retorno de MercadoPago
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    if (payment) {
      setPaymentStatus(payment);
      // Limpiar la URL después de 5 segundos
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setPaymentStatus(null);
      }, 5000);
    }
  }, []);

  // Si se está mostrando el panel de administración, renderizar solo eso
  if (showAdminPanel) {
    return <AdminPanel onBack={handleBackToStore} />;
  }
  
  // Si se está mostrando el cargador de catálogo, renderizar solo eso
  if (showCatalogLoader) {
    return (
      <div>
        <CatalogLoader />
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowCatalogLoader(false)}
            className="bg-phenom-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  // Componente para mostrar el estado del pago
  const PaymentStatusMessage = () => {
    if (!paymentStatus) return null;
    
    const messages = {
      success: {
        title: '¡Pago Exitoso!',
        message: 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación.',
        color: 'bg-green-500',
        icon: '✓'
      },
      failure: {
        title: 'Pago Fallido',
        message: 'Hubo un problema con tu pago. Por favor, inténtalo nuevamente.',
        color: 'bg-red-500',
        icon: '✗'
      },
      pending: {
        title: 'Pago Pendiente',
        message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
        color: 'bg-yellow-500',
        icon: '⏳'
      }
    };
    
    const status = messages[paymentStatus];
    if (!status) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className={`${status.color} text-white p-4 rounded-lg shadow-lg max-w-sm`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{status.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{status.title}</h3>
              <p className="text-sm opacity-90">{status.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-phenom-black">
        <Header onCartClick={handleCartClick} onAdminClick={handleAdminAccess} />
        
        {/* Mensaje de estado del pago */}
        <PaymentStatusMessage />
        
        <main>
          <Hero onShopClick={handleShopClick} />
          <Categories onCategoryClick={handleCategoryClick} />
          <ProductGrid 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <Contact />
        </main>

        <Footer />

        {/* Cart Sidebar */}
        <Cart 
          isOpen={isCartOpen} 
          onClose={handleCartClose}
          onCheckout={handleCheckout}
        />

        {/* Checkout Modal */}
        <Checkout 
          isOpen={isCheckoutOpen}
          onClose={handleCheckoutClose}
        />
        
        {/* WhatsApp Floating Button */}
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
}

export default App;
