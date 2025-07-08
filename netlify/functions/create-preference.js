export default async (req, context) => {
  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { items, payer, shipments } = await req.json();
    
    // Validar que tenemos los datos necesarios
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el access token desde las variables de entorno
    const accessToken = process.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return new Response(JSON.stringify({ 
        error: 'Credenciales de MercadoPago no configuradas',
        message: 'Verifica que VITE_MERCADOPAGO_ACCESS_TOKEN esté configurado'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear la preferencia de pago
    const preference = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        currency_id: 'ARS' // Pesos argentinos
      })),
      payer: {
        name: payer?.name || '',
        surname: payer?.surname || '',
        email: payer?.email || '',
        phone: payer?.phone ? {
          area_code: payer.phone.area_code || '',
          number: payer.phone.number || ''
        } : undefined,
        identification: payer?.identification ? {
          type: payer.identification.type || 'DNI',
          number: payer.identification.number || ''
        } : undefined,
        address: payer?.address ? {
          street_name: payer.address.street_name || '',
          street_number: payer.address.street_number || '',
          zip_code: payer.address.zip_code || ''
        } : undefined
      },
      shipments: shipments ? {
        cost: parseFloat(shipments.cost || 0),
        mode: shipments.mode || 'not_specified',
        receiver_address: shipments.receiver_address ? {
          street_name: shipments.receiver_address.street_name || '',
          street_number: shipments.receiver_address.street_number || '',
          zip_code: shipments.receiver_address.zip_code || '',
          city_name: shipments.receiver_address.city_name || '',
          state_name: shipments.receiver_address.state_name || ''
        } : undefined
      } : undefined,
      back_urls: {
        success: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/payment-success`,
        failure: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/payment-failure`,
        pending: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/payment-pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      notification_url: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      statement_descriptor: 'PHENOM BOXING',
      external_reference: `phenom-${Date.now()}`
    };

    // Hacer la petición a MercadoPago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de MercadoPago:', data);
      return new Response(JSON.stringify({ 
        error: 'Error al crear la preferencia de pago',
        details: data
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retornar la preferencia creada
    return new Response(JSON.stringify({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      external_reference: data.external_reference
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en create-preference:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
