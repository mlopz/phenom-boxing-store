import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import Checkout from './components/Checkout';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';
import CatalogLoader from './components/CatalogLoader';
import PaymentStatusModal from './components/PaymentStatusModal';

// Componente interno con acceso al contexto del carrito
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AppContent() {
  const { items, getCartTotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCatalogLoader, setShowCatalogLoader] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderData, setOrderData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalStatus, setPaymentModalStatus] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus) {
      setPaymentModalStatus(paymentStatus);
      setShowPaymentModal(true);
    }
  }, [location]);

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentModalStatus(null);
    // Limpiar el parámetro de la URL después de cerrar el modal
    const params = new URLSearchParams(location.search);
    params.delete('payment');
    navigate({ search: params.toString() }, { replace: true });
  };

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
    setOrderData(null);
  };

  const handleConfirmOrder = (orderData) => {
    console.log('🛒 [Checkout] Datos del pedido confirmados:', orderData);
    setOrderData(orderData);
    setIsCheckoutOpen(false);
    
    // Aquí se procesará el pago con MercadoPago
    // Por ahora, redirigimos al checkout de MercadoPago con los datos del pedido
    handleMercadoPagoCheckout(orderData);
  };

  const handleMercadoPagoCheckout = async (orderData) => {
    try {
      console.log('💳 [MercadoPago] Iniciando proceso de pago...');
      
      // Calcular total con envío si es necesario
      const baseTotal = getCartTotal();
      const shippingCost = orderData.deliveryType === 'flex' ? 200 : 0;
      const finalTotal = baseTotal + shippingCost;
      
      // Preparar datos para MercadoPago
      const paymentData = {
        items: orderData.items.map(item => ({
          title: `${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''}`,
          quantity: item.quantity,
          unit_price: Number(item.price)
        })),
        deliveryInfo: {
          type: orderData.deliveryType,
          customer: orderData.customer,
          shippingCost: shippingCost
        },
        total: finalTotal
      };
      
      console.log('💳 [MercadoPago] Datos de pago:', paymentData);
      
      // Llamar al endpoint de MercadoPago (esto se implementará en el backend)
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        const { init_point } = await response.json();
        window.location.href = init_point;
      } else {
        console.error('❌ [MercadoPago] Error al crear la preferencia de pago');
        alert('Error al procesar el pago. Por favor, inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('❌ [MercadoPago] Error:', error);
      alert('Error al procesar el pago. Por favor, inténtalo nuevamente.');
    }
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

  const handleMercadoLibreAuth = async (code) => {
    try {
      console.log('🔐 [MercadoLibre Auth] Procesando código de autorización...');
      
      // Aquí intercambiaremos el código por un Access Token
      const response = await fetch('/api/mercadolibre/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });
      
      if (response.ok) {
        const { access_token } = await response.json();
        console.log('✅ [MercadoLibre Auth] Token obtenido exitosamente');
        
        // Guardar el token (por ahora en localStorage, luego en Firebase)
        localStorage.setItem('mercadolibre_token', access_token);
        
        // Mostrar mensaje de éxito
        alert('¡Autenticación con MercadoLibre exitosa! Ya puedes sincronizar productos.');
      } else {
        console.error('❌ [MercadoLibre Auth] Error al obtener token');
        alert('Error en la autenticación con MercadoLibre. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('❌ [MercadoLibre Auth] Error:', error);
      alert('Error en la autenticación con MercadoLibre. Inténtalo nuevamente.');
    }
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
    
    // Detectar callback de autenticación de MercadoLibre
    const authParam = urlParams.get('auth');
    const code = urlParams.get('code');
    if (authParam === 'mercadolibre' && code) {
      console.log('🔐 [MercadoLibre Auth] Código de autorización recibido:', code);
      handleMercadoLibreAuth(code);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
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
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={handleCheckoutClose}
        cartItems={items}
        cartTotal={getCartTotal()}
        onConfirmOrder={handleConfirmOrder}
      />
      
      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
      {/* Modal de pago */}
      <PaymentStatusModal
        open={showPaymentModal}
        status={paymentModalStatus}
        onClose={handleClosePaymentModal}
      />
    </div>
  );
}

// Componente principal App
function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
