// Script para migrar datos del JSON a Firebase Real
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Firebase (usando variables de entorno)
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

async function migrateData() {
  try {
    console.log('🔥 Iniciando migración a Firebase Real...');
    
    // Leer datos del JSON
    const jsonPath = path.join(__dirname, 'src', 'data', 'products.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📦 Encontrados ${jsonData.categories.length} categorías y ${jsonData.products.length} productos`);
    
    // Migrar categorías
    console.log('📂 Migrando categorías...');
    for (const category of jsonData.categories) {
      const { id, ...categoryData } = category;
      await setDoc(doc(db, 'categories', id), {
        ...categoryData,
        order: jsonData.categories.indexOf(category)
      });
      console.log(`✅ Categoría migrada: ${category.name}`);
    }
    
    // Migrar productos
    console.log('🛍️ Migrando productos...');
    for (const product of jsonData.products) {
      const { id, ...productData } = product;
      await setDoc(doc(db, 'products', id.toString()), productData);
      console.log(`✅ Producto migrado: ${product.name}`);
    }
    
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('🔗 Verifica los datos en: https://console.firebase.google.com/project/phenom-boxing-store/firestore');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Asegúrate de que Firestore esté habilitado y en modo de prueba');
    }
    
    process.exit(1);
  }
}

// Ejecutar migración
migrateData();
