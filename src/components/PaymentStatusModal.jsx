import React, { useEffect, useRef } from 'react';

export default function PaymentStatusModal({ open, status, onClose }) {
  const closeBtnRef = useRef(null);
  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  let title = '';
  let message = '';
  let icon = null;
  let iconBg = '';

  switch (status) {
    case 'success':
      title = '¡Pago exitoso!';
      message = 'Gracias por tu compra. Tu pedido fue procesado correctamente.';
      iconBg = 'bg-green-100';
      icon = (
        <svg className="w-16 h-16 text-green-600 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      );
      break;
    case 'failure':
      title = 'Error en el pago';
      message = 'El pago fue rechazado o cancelado. Puedes intentar nuevamente.';
      iconBg = 'bg-red-100';
      icon = (
        <svg className="w-16 h-16 text-red-600 animate-shake" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      );
      break;
    case 'pending':
      title = 'Pago pendiente';
      message = 'Tu pago está pendiente de confirmación. Te avisaremos cuando se acredite.';
      iconBg = 'bg-yellow-100';
      icon = (
        <svg className="w-16 h-16 text-yellow-600 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      );
      break;
    default:
      return null;
  }

  // Animaciones personalizadas
  const style = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    .animate-shake { animation: shake 0.8s; }
    .animate-spin-slow { animation: spin 2s linear infinite; }
  `;

  return (
    <>
      <style>{style}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 transition-all">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-fade-in scale-95 animate-in">
          <div className={`mx-auto mb-4 flex items-center justify-center rounded-full w-20 h-20 shadow-lg ${iconBg}`}>{icon}</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
          <p className="mb-8 text-gray-600">{message}</p>
          <button
            ref={closeBtnRef}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-8 rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            onClick={onClose}
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </>
  );
}
