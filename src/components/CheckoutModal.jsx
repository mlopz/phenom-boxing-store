import React, { useState } from 'react';
import { X, MapPin, Truck, User, Phone, Home, Clock } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, cartItems, cartTotal, onConfirmOrder }) => {
  const [deliveryType, setDeliveryType] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    pickupTime: ''
  });
  const [errors, setErrors] = useState({});

  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    setErrors({});
    // Limpiar campos no necesarios según el tipo
    if (type === 'pickup') {
      setCustomerData(prev => ({ ...prev, address: '' }));
    } else if (type === 'flex') {
      setCustomerData(prev => ({ ...prev, pickupTime: '' }));
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryType) {
      newErrors.deliveryType = 'Debes seleccionar un método de entrega';
    }

    if (!customerData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s\-()]{8,}$/.test(customerData.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (deliveryType === 'flex' && !customerData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria para envío';
    }

    if (deliveryType === 'pickup' && !customerData.pickupTime.trim()) {
      newErrors.pickupTime = 'Debes seleccionar un horario de retiro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = () => {
    if (validateForm()) {
      const orderData = {
        deliveryType,
        customer: customerData,
        items: cartItems,
        total: cartTotal
      };
      onConfirmOrder(orderData);
    }
  };

  const handleClose = () => {
    setDeliveryType('');
    setCustomerData({ name: '', phone: '', address: '', pickupTime: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-phenom-dark rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col h-full">
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              
              {/* Resumen del Pedido */}
              <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">📦 Resumen del Pedido</h3>
                <div className="space-y-3">
                  {cartItems.map(item => {
                    const uniqueId = item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id;
                    return (
                      <div key={uniqueId} className="flex justify-between items-center text-sm">
                        <div className="text-gray-300">
                          <span className="font-semibold">{item.name}</span>
                          {item.selectedSize && <span className="text-phenom-red ml-2">({item.selectedSize})</span>}
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <div className="text-white font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg">TOTAL:</span>
                      <span className="text-phenom-red font-bold text-xl">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones de Entrega */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg">🚚 Método de Entrega</h3>
                
                {errors.deliveryType && (
                  <p className="text-red-400 text-sm">{errors.deliveryType}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Pickup */}
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-phenom-red bg-phenom-red bg-opacity-10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handleDeliveryTypeChange('pickup')}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className={`h-6 w-6 ${deliveryType === 'pickup' ? 'text-phenom-red' : 'text-gray-400'}`} />
                      <h4 className="text-white font-semibold text-lg">Retiro en Local</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      Retira tu pedido en nuestro local
                    </p>
                    <p className="text-phenom-red font-semibold">GRATIS</p>
                    <p className="text-gray-400 text-xs mt-2">
                      📍 Dirección del local<br/>
                      🕒 Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00
                    </p>
                  </div>

                  {/* Flex */}
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      deliveryType === 'flex'
                        ? 'border-phenom-red bg-phenom-red bg-opacity-10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handleDeliveryTypeChange('flex')}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Truck className={`h-6 w-6 ${deliveryType === 'flex' ? 'text-phenom-red' : 'text-gray-400'}`} />
                      <h4 className="text-white font-semibold text-lg">Envío por Flex</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      Recibe tu pedido en tu domicilio
                    </p>
                    <p className="text-phenom-red font-semibold">$200</p>
                    <p className="text-gray-400 text-xs mt-2">
                      🚚 Entrega en 24-48hs<br/>
                      📦 Seguimiento en tiempo real
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              {deliveryType && (
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg">👤 Datos de Contacto</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full bg-phenom-black border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-phenom-red ${
                          errors.name ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Tu nombre completo"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full bg-phenom-black border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-phenom-red ${
                          errors.phone ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="+598 99 123 456"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Campos específicos según tipo de entrega */}
                  {deliveryType === 'flex' && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <Home className="inline h-4 w-4 mr-1" />
                        Dirección de Entrega *
                      </label>
                      <textarea
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full bg-phenom-black border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-phenom-red ${
                          errors.address ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Calle, número, apartamento, barrio, ciudad..."
                        rows="3"
                      />
                      {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                    </div>
                  )}

                  {deliveryType === 'pickup' && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Horario Preferido de Retiro *
                      </label>
                      <select
                        value={customerData.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        className={`w-full bg-phenom-black border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-phenom-red ${
                          errors.pickupTime ? 'border-red-500' : 'border-gray-600'
                        }`}
                      >
                        <option value="">Selecciona un horario</option>
                        <option value="mañana">Mañana (9:00 - 12:00)</option>
                        <option value="tarde">Tarde (14:00 - 18:00)</option>
                        <option value="sabado">Sábado (9:00 - 13:00)</option>
                      </select>
                      {errors.pickupTime && <p className="text-red-400 text-sm mt-1">{errors.pickupTime}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-600 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-gray-600 text-gray-400 hover:text-white hover:border-white py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={!deliveryType}
                  className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                    deliveryType
                      ? 'bg-gradient-red text-white hover-scale pulse-glow'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  PROCEDER AL PAGO
                </button>
              </div>
              
              {deliveryType === 'flex' && (
                <div className="text-center mt-4">
                  <p className="text-gray-400 text-sm">
                    Total con envío: <span className="text-phenom-red font-bold">${(cartTotal + 200).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
