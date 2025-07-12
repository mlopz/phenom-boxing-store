import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Shield, ExternalLink, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getConfig, validateConfig } from '../config/mercadopago';

const Checkout = ({ isOpen, onClose }) => {
  const { items, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: form, 2: processing, 3: config instructions
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpConfig, setMpConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });

  useEffect(() => {
    // Validar configuración de MercadoPago al abrir el checkout
    if (isOpen) {
      const config = getConfig();
      const validation = validateConfig();
      
      setMpConfig(config);
      setConfigError(validation.isValid ? null : validation.errors);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep(2);
    
    try {
      // Verificar configuración antes de proceder
      if (configError) {
        setStep(3);
        return;
      }

      // Preparar datos para MercadoPago
      const preferenceData = {
        items: items.map(item => ({
          id: item.id.toString(),
          title: item.name,
          description: `${item.name} - Phenom Boxing Store`,
          quantity: item.quantity,
          unit_price: Number(item.price)
        })),
        payer: {
          name: formData.firstName,
          surname: formData.lastName,
          email: formData.email,
          phone: formData.phone ? {
            area_code: '',
            number: formData.phone
          } : undefined,
          address: {
            street_name: formData.address,
            zip_code: formData.zipCode
          }
        },
        shipments: {
          cost: 0, // Envío gratuito por ahora
          mode: 'not_specified',
          receiver_address: {
            street_name: formData.address,
            city_name: formData.city,
            zip_code: formData.zipCode
          }
        }
      };

      // Crear preferencia de pago
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }

      // Redirigir a MercadoPago
      const checkoutUrl = mpConfig.environment === 'sandbox' 
        ? data.sandbox_init_point 
        : data.init_point;
      
      if (checkoutUrl) {
        // Limpiar carrito antes de redirigir
        clearCart();
        // Redirigir a MercadoPago
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }
      
    } catch (error) {
      console.error('Error en el checkout:', error);
      // Mostrar instrucciones de configuración en caso de error
      setStep(3);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setIsProcessing(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={handleClose}></div>
      
      {/* Checkout Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-phenom-dark rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          
          {step === 1 ? (
            // Checkout Form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-600">
                <h2 className="aggressive-text text-2xl text-white">
                  FINALIZAR <span className="text-phenom-red">COMPRA</span>
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column - Customer Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="aggressive-text text-xl text-white mb-4 flex items-center">
                        <User className="h-5 w-5 text-phenom-red mr-2" />
                        INFORMACIÓN PERSONAL
                      </h3>
                      
                      {/* Mostrar error de configuración si existe */}
                      {configError && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                          <h4 className="text-red-400 font-semibold mb-2">⚠️ Configuración de MercadoPago</h4>
                          <ul className="text-red-300 text-sm space-y-1">
                            {configError.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          name="firstName"
                          placeholder="Nombre"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                        />
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Apellido"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Teléfono (ej: +598 99 123 456)"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="aggressive-text text-xl text-white mb-4 flex items-center">
                        <MapPin className="h-5 w-5 text-phenom-red mr-2" />
                        DIRECCIÓN DE ENTREGA
                      </h3>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="address"
                          placeholder="Dirección completa"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="city"
                            placeholder="Ciudad"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                          />
                          <input
                            type="text"
                            name="zipCode"
                            placeholder="Código Postal"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="bg-phenom-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="aggressive-text text-xl text-white mb-4 flex items-center">
                        <Shield className="h-5 w-5 text-phenom-red mr-2" />
                        MÉTODO DE PAGO
                      </h3>
                      
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <img 
                            src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__large.png" 
                            alt="MercadoPago" 
                            className="h-8"
                          />
                          <span className="text-blue-300 font-semibold">Pago Seguro con MercadoPago</span>
                        </div>
                        <p className="text-blue-200 text-sm mb-3">
                          Acepta tarjetas de crédito, débito, transferencias bancarias y pagos en efectivo.
                        </p>
                        <div className="flex items-center space-x-2 text-green-400 text-sm">
                          <Shield className="h-4 w-4" />
                          <span>Transacción 100% segura y encriptada</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Order Summary */}
                  <div>
                    <h3 className="aggressive-text text-xl text-white mb-4">
                      RESUMEN DEL <span className="text-phenom-red">PEDIDO</span>
                    </h3>
                    
                    <div className="bg-phenom-black rounded-lg p-4 space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center space-x-3 border-b border-gray-700 pb-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm font-semibold">{item.name}</p>
                            <p className="text-gray-400 text-xs">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="text-phenom-red font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="aggressive-text text-lg text-white">TOTAL:</span>
                          <span className="aggressive-text text-xl text-phenom-red">
                            ${getCartTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || (configError && configError.length > 0)}
                      className="w-full mt-6 bg-gradient-red text-white py-4 rounded-lg font-bold text-lg hover-scale pulse-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>PROCESANDO...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          <span>PAGAR CON MERCADOPAGO</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : step === 2 ? (
            // Processing Step
            <div className="p-8 text-center">
              <div className="mb-8">
                <Loader className="h-24 w-24 text-phenom-red mx-auto mb-4 animate-spin" />
                <h2 className="aggressive-text text-3xl text-white mb-2">
                  PROCESANDO <span className="text-phenom-red">PAGO</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Preparando tu pedido para MercadoPago...
                </p>
              </div>
              
              <div className="bg-phenom-black rounded-lg p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-300 text-sm">
                  Por favor espera mientras configuramos tu pago seguro.
                </p>
              </div>
            </div>
          ) : (
            // Configuration Instructions Step
            <div className="p-8">
              <div className="mb-8 text-center">
                <ExternalLink className="h-24 w-24 text-blue-500 mx-auto mb-4" />
                <h2 className="aggressive-text text-3xl text-white mb-2">
                  CONFIGURACIÓN <span className="text-phenom-red">MERCADOPAGO</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Para activar los pagos reales, necesitas configurar MercadoPago
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-blue-400 font-bold text-xl mb-4">📋 Pasos para Configurar:</h3>
                  <ol className="text-blue-200 space-y-3 text-sm">
                    <li><strong>1.</strong> Ve a <a href="https://www.mercadopago.com.uy/developers" target="_blank" className="text-blue-400 underline">MercadoPago Developers</a></li>
                    <li><strong>2.</strong> Crea una aplicación y obtén tus credenciales</li>
                    <li><strong>3.</strong> Edita el archivo <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code></li>
                    <li><strong>4.</strong> Reemplaza las credenciales de prueba por las reales</li>
                    <li><strong>5.</strong> Reinicia el servidor para aplicar los cambios</li>
                  </ol>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-yellow-400 font-semibold mb-3">🔑 Credenciales Necesarias:</h4>
                  <div className="text-yellow-200 text-sm space-y-2">
                    <p><strong>VITE_MERCADOPAGO_PUBLIC_KEY:</strong> Tu Public Key</p>
                    <p><strong>VITE_MERCADOPAGO_ACCESS_TOKEN:</strong> Tu Access Token</p>
                    <p><strong>VITE_MERCADOPAGO_ENVIRONMENT:</strong> "production" para pagos reales</p>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <h4 className="text-green-400 font-semibold mb-3">✅ Funcionalidades Incluidas:</h4>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Pagos con tarjetas de crédito y débito</li>
                    <li>• Transferencias bancarias</li>
                    <li>• Pagos en efectivo (Abitab, Redpagos)</li>
                    <li>• Páginas de éxito, error y pendiente</li>
                    <li>• Configuración flexible de credenciales</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleClose}
                    className="bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover-scale transition-all"
                  >
                    CERRAR
                  </button>
                  <a
                    href="https://www.mercadopago.com.uy/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>IR A MERCADOPAGO</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
