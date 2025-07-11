// Utilidad para diagnosticar problemas de Firebase en el frontend

export const debugFirebaseConfig = () => {
  console.log('🔧 [Firebase Debug] Verificando configuración...');
  
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  console.log('📊 [Firebase Debug] Variables de entorno:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? '✅ Definida' : '❌ Faltante'}`);
    if (value) {
      console.log(`  Valor: ${value.substring(0, 20)}...`);
    }
  });
  
  const missingVars = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
    
  if (missingVars.length > 0) {
    console.error('❌ [Firebase Debug] Variables faltantes:', missingVars);
    return false;
  }
  
  console.log('✅ [Firebase Debug] Todas las variables están definidas');
  return true;
};

export const testStorageConnection = async () => {
  try {
    console.log('🧪 [Storage Debug] Probando conexión a Firebase Storage...');
    
    // Importar dinámicamente para evitar errores si Firebase no está configurado
    const { getStorage, ref, uploadBytes } = await import('firebase/storage');
    const { storage } = await import('../services/firebase');
    
    // Crear un archivo de prueba muy pequeño
    const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" en bytes
    const testRef = ref(storage, `debug/test-${Date.now()}.txt`);
    
    console.log('📁 [Storage Debug] Intentando subir archivo de prueba...');
    
    const result = await uploadBytes(testRef, testData);
    
    console.log('✅ [Storage Debug] Archivo subido exitosamente');
    console.log('📊 [Storage Debug] Metadata:', {
      name: result.metadata.name,
      size: result.metadata.size
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ [Storage Debug] Error en prueba de Storage:');
    console.error('🔍 [Storage Debug] Código:', error.code);
    console.error('📝 [Storage Debug] Mensaje:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('🚨 [Storage Debug] Error de autorización - Posibles causas:');
      console.log('1. Las reglas de Firebase Storage no permiten escritura');
      console.log('2. El proyecto no está configurado correctamente');
      console.log('3. Las variables de entorno no se cargaron en producción');
    }
    
    return false;
  }
};
