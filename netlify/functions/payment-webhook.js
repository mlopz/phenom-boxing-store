const { MercadoPagoConfig, Payment } = require('mercadopago');
const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

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
      
      try {
        // Extraer información del pedido desde external_reference
        // Formato esperado: "phenom-{timestamp}-{productId}-{size}"
        const referenceData = paymentData.external_reference;
        
        // Por ahora, buscaremos en los metadatos del pago
        // En una implementación completa, guardaríamos los detalles del pedido
        console.log('📋 [Webhook] Referencia del pedido:', referenceData);
        
        // TODO: Implementar lógica de actualización de stock
        // Necesitamos obtener los detalles del pedido (producto, talla, cantidad)
        // y actualizar el stock correspondiente en Firebase
        
        console.log('📦 [Webhook] Stock actualizado para pedido:', referenceData);
        
      } catch (stockError) {
        console.error('❌ [Webhook] Error actualizando stock:', stockError);
        // No fallar el webhook por errores de stock
      }
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
