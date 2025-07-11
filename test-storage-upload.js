import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔧 [Test] Configuración de Firebase:');
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Storage Bucket:', firebaseConfig.storageBucket);
console.log('- Auth Domain:', firebaseConfig.authDomain);

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testStorageUpload() {
  try {
    console.log('\n🧪 [Test] Iniciando prueba de subida a Firebase Storage...');
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para Firebase Storage';
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    // Crear referencia en Storage
    const timestamp = Date.now();
    const fileName = `test-${timestamp}.txt`;
    const storageRef = ref(storage, `test/${fileName}`);
    
    console.log('📁 [Test] Subiendo archivo:', fileName);
    console.log('📍 [Test] Ruta en Storage:', `test/${fileName}`);
    
    // Intentar subir el archivo
    const uploadResult = await uploadBytes(storageRef, testBuffer, {
      contentType: 'text/plain'
    });
    
    console.log('✅ [Test] Archivo subido exitosamente');
    console.log('📊 [Test] Metadata:', {
      name: uploadResult.metadata.name,
      size: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType
    });
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    console.log('🔗 [Test] URL de descarga:', downloadURL);
    
    console.log('\n✅ [Test] Prueba de Storage completada exitosamente');
    console.log('🎉 [Test] Firebase Storage está funcionando correctamente');
    
  } catch (error) {
    console.error('\n❌ [Test] Error en la prueba de Storage:');
    console.error('🔍 [Test] Código de error:', error.code);
    console.error('📝 [Test] Mensaje:', error.message);
    console.error('🔧 [Test] Detalles completos:', error);
    
    // Diagnóstico específico
    if (error.code === 'storage/unauthorized') {
      console.log('\n🚨 [Diagnóstico] Error de autorización detectado:');
      console.log('1. Verifica que las reglas de Firebase Storage permitan escritura');
      console.log('2. Asegúrate de que el proyecto esté configurado correctamente');
      console.log('3. Revisa que el bucket de Storage exista');
    }
  }
}

// Ejecutar la prueba
testStorageUpload();
