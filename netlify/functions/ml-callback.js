// Serverless function: ml-callback.js
// Recibe el callback de MercadoLibre, intercambia el code por tokens y guarda en Firestore

const fetch = require('node-fetch');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const CLIENT_ID = process.env.ML_CLIENT_ID || '6818950851523541';
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET || 'Dp0H7OmjQEkQFZ0YqokObnGXAuHnbdSR';
const REDIRECT_URI = process.env.ML_REDIRECT_URI || 'https://phenom-boxing-store.netlify.app/.netlify/functions/ml-callback';

let app;

function getApp() {
  if (!app) {
    app = initializeApp({
      credential: applicationDefault(),
    });
  }
  return app;
}

exports.handler = async (event, context) => {
  const params = new URLSearchParams(event.queryStringParameters);
  const code = params.get('code');
  if (!code) {
    return {
      statusCode: 400,
      body: 'No se recibió el código de autorización de MercadoLibre.',
    };
  }

  // Intercambiar code por tokens
  try {
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return {
        statusCode: 500,
        body: 'Error al obtener el access_token de MercadoLibre: ' + JSON.stringify(tokenData),
      };
    }

    // Guardar tokens en Firestore
    getApp();
    const db = getFirestore();
    await db.collection('ml_tokens').doc('main').set({
      ...tokenData,
      created: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h2>¡Conexión exitosa con MercadoLibre!</h2><p>Puedes cerrar esta ventana.</p>`
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Error en el callback de MercadoLibre: ' + error.message,
    };
  }
};
