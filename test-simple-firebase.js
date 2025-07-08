// Test simple de Firebase Real desde Node.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

// Configuración de Firebase (hardcodeada para prueba)
const firebaseConfig = {
  apiKey: "AIzaSyCIVQ55J6FwlRRT-AooG9Wqw3rjZIDdKG4",
  authDomain: "phenom-boxing-store.firebaseapp.com",
  projectId: "phenom-boxing-store",
  storageBucket: "phenom-boxing-store.firebasestorage.app",
  messagingSenderId: "1062254907979",
  appId: "1:1062254907979:web:202c4f3ed4d24c1ed6b3ce"
};

async function testSimpleFirebase() {
  try {
    console.log('🔥 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    console.log('📊 Proyecto ID:', firebaseConfig.projectId);
    
    // Probar conexión básica
    console.log('🔄 Probando conexión a Firestore...');
    const testRef = collection(db, 'products');
    const snapshot = await getDocs(testRef);
    
    console.log(`✅ Conexión exitosa! Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('📦 Primeros productos:');
      snapshot.docs.slice(0, 3).forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.data().name || 'Sin nombre'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error en test simple:', error);
    console.error('❌ Código:', error.code);
    console.error('❌ Mensaje:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Problema de permisos - verificar reglas de Firestore');
    } else if (error.code === 'unavailable') {
      console.log('🌐 Problema de conectividad - verificar internet/DNS');
    } else if (error.code === 'not-found') {
      console.log('🗂️ Base de datos no encontrada - verificar proyecto');
    }
  }
}

testSimpleFirebase();
