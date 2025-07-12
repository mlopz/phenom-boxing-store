// Serverless function: ml-login.js
// Inicia el login OAuth de MercadoLibre y redirige al usuario a la pantalla de autorización

const CLIENT_ID = process.env.ML_CLIENT_ID || '6818950851523541';
const REDIRECT_URI = process.env.ML_REDIRECT_URI || 'https://phenom-boxing-store.netlify.app/.netlify/functions/ml-callback';
const AUTH_URL = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

exports.handler = async (event, context) => {
  return {
    statusCode: 302,
    headers: {
      Location: AUTH_URL,
    },
    body: '',
  };
};
