// Script para verificar la estructura de productos en Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCIVQ55J6FwlRRT-AooG9Wqw3rjZIDdKG4",
  authDomain: "phenom-boxing-store.firebaseapp.com",
  projectId: "phenom-boxing-store",
  storageBucket: "phenom-boxing-store.firebasestorage.app",
  messagingSenderId: "1062254907979",
  appId: "1:1062254907979:web:202c4f3ed4d24c1ed6b3ce"
};

async function checkProductStructure() {
  try {
    console.log('🔍 Verificando estructura de productos en Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Obtener algunos productos para verificar estructura
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(3));
    const snapshot = await getDocs(q);
    
    console.log(`📦 Productos encontrados: ${snapshot.size}`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🏷️ Producto ID: ${doc.id}`);
      console.log('📋 Estructura completa:', JSON.stringify(data, null, 2));
      console.log('🔑 Campos disponibles:', Object.keys(data));
      
      // Verificar campos críticos
      const criticalFields = ['name', 'description', 'price', 'category', 'image'];
      criticalFields.forEach(field => {
        const hasField = data.hasOwnProperty(field);
        const value = data[field];
        console.log(`  ${hasField ? '✅' : '❌'} ${field}: ${hasField ? (typeof value + ' - ' + (typeof value === 'string' ? `"${value}"` : value)) : 'FALTANTE'}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  }
}

checkProductStructure();
