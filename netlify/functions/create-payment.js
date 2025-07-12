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
    // Log básico para debug
    console.log('🚀 [Netlify Function] Iniciando creación de preferencia');
    
    // Validar variables de entorno
    const accessToken = process.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ Access Token no configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuración de MercadoPago incompleta' })
      };
    }

    // Importar MercadoPago dentro del try-catch
    const { MercadoPagoConfig, Preference } = require('mercadopago');

    // Configurar MercadoPago
    const client = new MercadoPagoConfig({
      accessToken: process.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });

    const preference = new Preference(client);

    // Parsear datos del request
    const { items, payer, back_urls, notification_url } = JSON.parse(event.body);

    console.log('🛒 [Netlify Function] Creando preferencia de pago:', { items, payer });

    // Crear preferencia
    const preferenceData = {
      items,
      payer,
      back_urls: back_urls || {
        success: `${process.env.VITE_SITE_URL}/?payment=success`,
        failure: `${process.env.VITE_SITE_URL}/?payment=failure`,
        pending: `${process.env.VITE_SITE_URL}/?payment=pending`
      },
      notification_url: notification_url || `${process.env.VITE_SITE_URL}/.netlify/functions/payment-webhook`,
      statement_descriptor: 'PHENOM STORE',
      external_reference: `phenom-${Date.now()}`,
      expires: false,
      auto_return: 'approved'
    };

    const result = await preference.create({ body: preferenceData });

    console.log('✅ [Netlify Function] Preferencia creada:', result.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      })
    };

  } catch (error) {
    console.error('❌ [Netlify Function] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error al crear la preferencia de pago',
        details: error.message 
      })
    };
  }
};
