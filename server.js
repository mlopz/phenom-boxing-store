import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Depuración: Mostrar las variables de entorno cargadas
console.log('Variables de entorno en el servidor:', {
  VITE_MERCADOPAGO_PUBLIC_KEY: process.env.VITE_MERCADOPAGO_PUBLIC_KEY,
  VITE_MERCADOPAGO_ACCESS_TOKEN: process.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
  VITE_MERCADOPAGO_ENVIRONMENT: process.env.VITE_MERCADOPAGO_ENVIRONMENT,
  VITE_SITE_URL: process.env.VITE_SITE_URL
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para crear preferencia de MercadoPago
app.post('/api/create-preference', async (req, res) => {
  try {
    const { items, payer, shipments } = req.body;
    
    // Validar que tenemos los datos necesarios
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    // Obtener el access token desde las variables de entorno
    const accessToken = process.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ 
        error: 'Credenciales de MercadoPago no configuradas',
        message: 'Verifica que VITE_MERCADOPAGO_ACCESS_TOKEN esté configurado'
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
        success: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}?payment=success`,
        failure: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}?payment=failure`,
        pending: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}?payment=pending`
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      notification_url: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      statement_descriptor: 'PHENOM BOXING',
      external_reference: `phenom-${Date.now()}`
    };

    console.log('Creando preferencia con:', JSON.stringify(preference, null, 2));

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
      return res.status(response.status).json({ 
        error: 'Error al crear la preferencia de pago',
        details: data
      });
    }

    console.log('Preferencia creada exitosamente:', data.id);

    // Retornar la preferencia creada
    res.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      external_reference: data.external_reference
    });

  } catch (error) {
    console.error('Error en create-preference:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Endpoint para autenticación OAuth de MercadoLibre
app.post('/api/mercadolibre/auth', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización requerido' });
    }
    
    // Credenciales de la aplicación (estas las obtendrás de MercadoLibre)
    const clientId = process.env.MERCADOLIBRE_CLIENT_ID;
    const clientSecret = process.env.MERCADOLIBRE_CLIENT_SECRET;
    const redirectUri = process.env.MERCADOLIBRE_REDIRECT_URI || 'http://localhost:3006/?auth=mercadolibre';
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'Credenciales de MercadoLibre no configuradas',
        message: 'Verifica MERCADOLIBRE_CLIENT_ID y MERCADOLIBRE_CLIENT_SECRET'
      });
    }
    
    console.log('🔐 [MercadoLibre Auth] Intercambiando código por token...');
    
    // Intercambiar código por Access Token
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('❌ [MercadoLibre Auth] Error al obtener token:', tokenData);
      return res.status(tokenResponse.status).json({ 
        error: 'Error al obtener Access Token',
        details: tokenData
      });
    }
    
    console.log('✅ [MercadoLibre Auth] Token obtenido exitosamente');
    
    // Obtener información del usuario para validar
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    if (userResponse.ok) {
      console.log('👤 [MercadoLibre Auth] Usuario autenticado:', userData.nickname);
    }
    
    // Retornar el token y información relevante
    res.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: tokenData.user_id,
      user_info: userResponse.ok ? {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        site_id: userData.site_id
      } : null
    });
    
  } catch (error) {
    console.error('❌ [MercadoLibre Auth] Error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor backend de Phenom funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend de Phenom ejecutándose en http://localhost:${PORT}`);
  console.log(`📦 Endpoint de MercadoPago: http://localhost:${PORT}/api/create-preference`);
});
