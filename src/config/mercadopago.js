// Configuración de MercadoPago
// Este archivo permite cambiar fácilmente las credenciales

// Depuración: Mostrar las variables de entorno
console.log('Variables de entorno cargadas:', {
  VITE_MERCADOPAGO_PUBLIC_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
  VITE_MERCADOPAGO_ACCESS_TOKEN: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
  VITE_MERCADOPAGO_ENVIRONMENT: import.meta.env.VITE_MERCADOPAGO_ENVIRONMENT,
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL
});

const mercadopagoConfig = {
  // Credenciales - Cambiar por las tuyas
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'TEST-tu-public-key-aqui',
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'TEST-tu-access-token-aqui',
  
  // Entorno: 'sandbox' para pruebas, 'production' para real
  environment: import.meta.env.VITE_MERCADOPAGO_ENVIRONMENT || 'sandbox',
  
  // URL base de tu sitio
  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:3000',
  
  // Configuración de preferencias de pago
  preferences: {
    // URLs de retorno después del pago
    back_urls: {
      success: `${import.meta.env.VITE_SITE_URL || 'http://localhost:3001'}/pago-exitoso`,
      failure: `${import.meta.env.VITE_SITE_URL || 'http://localhost:3001'}/pago-fallido`,
      pending: `${import.meta.env.VITE_SITE_URL || 'http://localhost:3001'}/pago-pendiente`
    },
    
    // Configuración adicional
    auto_return: 'approved',
    binary_mode: true, // Solo pagos aprobados o rechazados
    
    // Métodos de pago excluidos (opcional)
    payment_methods: {
      excluded_payment_types: [
        // { id: 'ticket' }, // Excluir pagos en efectivo
        // { id: 'atm' }     // Excluir cajeros automáticos
      ],
      installments: 12 // Máximo de cuotas
    }
  }
};

// Función para validar configuración
export const validateConfig = () => {
  const errors = [];
  
  // Depuración: Mostrar valores actuales
  console.log('Validando credenciales:', {
    publicKey: mercadopagoConfig.publicKey,
    accessToken: mercadopagoConfig.accessToken,
    environment: mercadopagoConfig.environment
  });
  
  // Verificar que las credenciales no sean los valores por defecto
  const publicKeyInvalid = !mercadopagoConfig.publicKey || 
      mercadopagoConfig.publicKey === 'TEST-tu-public-key-aqui' ||
      mercadopagoConfig.publicKey.includes('tu-public-key');
      
  const accessTokenInvalid = !mercadopagoConfig.accessToken || 
      mercadopagoConfig.accessToken === 'TEST-tu-access-token-aqui' ||
      mercadopagoConfig.accessToken.includes('tu-access-token');
  
  console.log('Validación:', {
    publicKeyInvalid,
    accessTokenInvalid,
    publicKeyValue: mercadopagoConfig.publicKey,
    accessTokenValue: mercadopagoConfig.accessToken
  });
  
  if (publicKeyInvalid) {
    errors.push('Public Key de MercadoPago no configurado');
  }
  
  if (accessTokenInvalid) {
    errors.push('Access Token de MercadoPago no configurado');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para obtener configuración según el entorno
export const getConfig = () => {
  const validation = validateConfig();
  
  if (!validation.isValid && mercadopagoConfig.environment === 'production') {
    console.warn('⚠️ MercadoPago no está configurado correctamente para producción:', validation.errors);
  }
  
  return mercadopagoConfig;
};

export default mercadopagoConfig;
