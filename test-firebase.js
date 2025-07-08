// Script para probar la conexión a Firebase Real
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIVQ55J6FwlRRT-AooG9Wqw3rjZIDdKG4",
  authDomain: "phenom-boxing-store.firebaseapp.com",
  projectId: "phenom-boxing-store",
  storageBucket: "phenom-boxing-store.firebasestorage.app",
  messagingSenderId: "1062254907979",
  appId: "1:1062254907979:web:202c4f3ed4d24c1ed6b3ce"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('🔥 Probando conexión a Firebase Real...');
    
    // Probar productos
    console.log('📦 Obteniendo productos...');
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    console.log(`✅ Productos encontrados: ${productsSnapshot.size}`);
    
    productsSnapshot.forEach((doc) => {
      console.log(`  - ${doc.id}:`, doc.data().name);
    });
    
    // Probar categorías
    console.log('📂 Obteniendo categorías...');
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    console.log(`✅ Categorías encontradas: ${categoriesSnapshot.size}`);
    
    categoriesSnapshot.forEach((doc) => {
      console.log(`  - ${doc.id}:`, doc.data().name);
    });
    
    console.log('🎉 ¡Conexión a Firebase exitosa!');
    
  } catch (error) {
    console.error('❌ Error conectando a Firebase:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
  }
}

// Ejecutar prueba
testFirebase();
