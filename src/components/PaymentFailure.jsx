import React, { useEffect, useState } from 'react';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener datos del pago desde los parámetros de URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const statusDetail = searchParams.get('status_detail');
    
    setPaymentData({
      paymentId,
      status,
      statusDetail,
      timestamp: new Date().toLocaleString('es-UY')
    });
  }, [searchParams]);

  const getErrorMessage = (statusDetail) => {
    const errorMessages = {
      'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
      'cc_rejected_bad_filled_other': 'Datos de la tarjeta incorrectos',
      'cc_rejected_high_risk': 'Pago rechazado por seguridad',
      'cc_rejected_max_attempts': 'Máximo de intentos alcanzado',
      'cc_rejected_card_disabled': 'Tarjeta deshabilitada',
      'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
      'rejected_by_bank': 'Pago rechazado por el banco',
      'rejected_insufficient_data': 'Datos insuficientes'
    };
    
    return errorMessages[statusDetail] || 'El pago no pudo ser procesado';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-phenom-black via-gray-900 to-phenom-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-phenom-black rounded-2xl p-8 border border-gray-700 text-center">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-500 rounded-full p-4">
              <XCircle className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="aggressive-text text-4xl text-white mb-4">
            PAGO <span className="text-red-500">NO PROCESADO</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Hubo un problema al procesar tu pago. No te preocupes, puedes intentarlo nuevamente.
          </p>

          {/* Información del error */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <h3 className="text-red-400 font-bold text-lg mb-3">
              Motivo del rechazo:
            </h3>
            <p className="text-red-300">
              {paymentData?.statusDetail ? getErrorMessage(paymentData.statusDetail) : 'Error desconocido'}
            </p>
            
            {paymentData?.paymentId && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <p className="text-gray-400 text-sm">
                  ID de referencia: <span className="font-mono">{paymentData.paymentId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Sugerencias */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-8 text-left">
            <h4 className="text-yellow-400 font-semibold mb-3">💡 Sugerencias:</h4>
            <ul className="text-yellow-200 text-sm space-y-2">
              <li>• Verifica que los datos de tu tarjeta sean correctos</li>
              <li>• Asegúrate de tener fondos suficientes</li>
              <li>• Contacta a tu banco si el problema persiste</li>
              <li>• Intenta con otro método de pago</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/checkout"
              className="flex items-center justify-center space-x-2 bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              <span>INTENTAR NUEVAMENTE</span>
            </Link>
            
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>VOLVER A LA TIENDA</span>
            </Link>
          </div>

          {/* Contacto */}
          <div className="pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">
              ¿Necesitas ayuda? Contáctanos:
            </p>
            <div className="flex justify-center">
              <a
                href="https://wa.me/59899123456"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
