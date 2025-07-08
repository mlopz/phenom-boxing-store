import React, { useEffect, useState } from 'react';
import { Clock, ArrowLeft, Eye, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener datos del pago desde los parámetros de URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('payment_type_id');
    
    setPaymentData({
      paymentId,
      status,
      paymentType,
      timestamp: new Date().toLocaleString('es-UY')
    });
  }, [searchParams]);

  const getPaymentTypeMessage = (paymentType) => {
    const messages = {
      'ticket': 'Pago en efectivo (Abitab, Redpagos, etc.)',
      'bank_transfer': 'Transferencia bancaria',
      'atm': 'Cajero automático',
      'credit_card': 'Tarjeta de crédito',
      'debit_card': 'Tarjeta de débito'
    };
    
    return messages[paymentType] || 'Método de pago seleccionado';
  };

  const generateOrderNumber = () => {
    return `PHENOM-${Date.now().toString().slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-phenom-black via-gray-900 to-phenom-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-phenom-black rounded-2xl p-8 border border-gray-700 text-center">
          {/* Icono de pendiente */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-500 rounded-full p-4">
              <Clock className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="aggressive-text text-4xl text-white mb-4">
            PAGO <span className="text-yellow-500">PENDIENTE</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Tu pago está siendo procesado. Te notificaremos cuando se complete.
          </p>

          {/* Información del pedido */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-phenom-red" />
              Detalles del Pedido
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Número de Orden:</span>
                <span className="text-white font-mono">{generateOrderNumber()}</span>
              </div>
              
              {paymentData?.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">ID de Pago:</span>
                  <span className="text-white font-mono">{paymentData.paymentId}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha:</span>
                <span className="text-white">{paymentData?.timestamp}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Método de Pago:</span>
                <span className="text-yellow-400">
                  {paymentData?.paymentType ? getPaymentTypeMessage(paymentData.paymentType) : 'Procesando...'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className="text-yellow-500 font-semibold">PENDIENTE</span>
              </div>
            </div>
          </div>

          {/* Información sobre el proceso */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
            <h4 className="text-blue-400 font-semibold mb-3">ℹ️ ¿Qué sigue?</h4>
            <div className="text-blue-300 text-sm text-left space-y-2">
              <p>• Tu pedido está reservado mientras procesamos el pago</p>
              <p>• Recibirás una notificación cuando se confirme</p>
              <p>• El proceso puede tomar entre 1-3 días hábiles</p>
              <p>• Te contactaremos para coordinar la entrega</p>
            </div>
          </div>

          {/* Instrucciones específicas según método de pago */}
          {paymentData?.paymentType === 'ticket' && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-8">
              <h4 className="text-yellow-400 font-semibold mb-3">💰 Pago en Efectivo</h4>
              <p className="text-yellow-200 text-sm">
                Debes completar el pago en el punto de pago seleccionado (Abitab, Redpagos, etc.) 
                dentro de las próximas 48 horas para confirmar tu pedido.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>VOLVER A LA TIENDA</span>
            </Link>
          </div>

          {/* Contacto */}
          <div className="pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">
              ¿Tienes dudas sobre tu pedido?
            </p>
            <div className="flex justify-center">
              <a
                href="https://wa.me/59899123456"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mensaje de agradecimiento */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              ¡Gracias por elegir <span className="text-phenom-red font-bold">PHENOM</span>!<br />
              Te mantendremos informado sobre el estado de tu pedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
