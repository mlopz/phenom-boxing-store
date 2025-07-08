import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowLeft, Download } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener datos del pago desde los parámetros de URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrderId = searchParams.get('merchant_order_id');
    
    setPaymentData({
      paymentId,
      status,
      merchantOrderId,
      timestamp: new Date().toLocaleString('es-UY')
    });

    // Limpiar carrito del localStorage
    localStorage.removeItem('phenomCart');
  }, [searchParams]);

  const generateOrderNumber = () => {
    return `PHENOM-${Date.now().toString().slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-phenom-black via-gray-900 to-phenom-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-phenom-black rounded-2xl p-8 border border-gray-700 text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="aggressive-text text-4xl text-white mb-4">
            ¡PAGO <span className="text-green-500">EXITOSO</span>!
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Tu compra se ha procesado correctamente. ¡Gracias por elegir Phenom!
          </p>

          {/* Información del pedido */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-phenom-red" />
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
                <span className="text-gray-400">Estado:</span>
                <span className="text-green-500 font-semibold">APROBADO</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
            <p className="text-blue-300 text-sm">
              📧 Recibirás un email de confirmación con los detalles de tu compra.<br />
              📦 Te contactaremos pronto para coordinar la entrega.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>VOLVER A LA TIENDA</span>
            </Link>
            
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>IMPRIMIR COMPROBANTE</span>
            </button>
          </div>

          {/* Mensaje de agradecimiento */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              ¡Gracias por confiar en <span className="text-phenom-red font-bold">PHENOM</span>!<br />
              Tu compromiso con el deporte, el bienestar y la recuperación nos motiva a seguir creciendo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
