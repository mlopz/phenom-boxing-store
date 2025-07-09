const { MercadoPagoConfig, Payment } = require('mercadopago');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    console.log('🔔 [Webhook] Notificación recibida:', event.body);

    // Parsear la notificación
    const notification = JSON.parse(event.body);

    // Solo procesar notificaciones de pago
    if (notification.type !== 'payment') {
      console.log('ℹ️ [Webhook] Notificación ignorada, tipo:', notification.type);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'ignored' })
      };
    }

    // Configurar MercadoPago
    const client = new MercadoPagoConfig({
      accessToken: process.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000
      }
    });

    const payment = new Payment(client);

    // Obtener detalles del pago
    const paymentData = await payment.get({ id: notification.data.id });

    console.log('💳 [Webhook] Datos del pago:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference
    });

    // Si el pago fue aprobado, actualizar stock
    if (paymentData.status === 'approved') {
      console.log('✅ [Webhook] Pago aprobado, actualizando stock...');
      
      // TODO: Aquí implementaremos la actualización de stock en Firebase
      // Por ahora solo logueamos
      console.log('📦 [Webhook] Stock actualizado para pedido:', paymentData.external_reference);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        status: 'processed',
        payment_id: paymentData.id,
        payment_status: paymentData.status
      })
    };

  } catch (error) {
    console.error('❌ [Webhook] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error al procesar webhook',
        details: error.message 
      })
    };
  }
};
