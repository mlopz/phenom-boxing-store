import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import 'dotenv/config';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para corregir la URL de Firebase Storage
function fixFirebaseUrl(url) {
  if (!url) return url;
  
  // Caso 1: URL con ?name= (incorrecta)
  if (url.includes('?name=')) {
    const baseUrl = url.split('?')[0];
    const encodedPath = url.split('name=')[1];
    return `${baseUrl}/o/${encodedPath}?alt=media`;
  }
  
  // Caso 2: URL del emulador local (solo desarrollo)
  if (url.includes('127.0.0.1:9199') || url.includes('localhost:9199')) {
    return url
      .replace('127.0.0.1:9199', 'firebasestorage.googleapis.com/v0/b/phenom-boxing-store.firebasestorage.app')
      .replace('localhost:9199', 'firebasestorage.googleapis.com/v0/b/phenom-boxing-store.firebasestorage.app')
      .replace('/v0/b/', '/v0/b/phenom-boxing-store.firebasestorage.app/');
  }
  
  // Asegurarse de que la URL termine con ?alt=media
  if (!url.includes('?alt=media')) {
    return url + (url.includes('?') ? '&' : '?') + 'alt=media';
  }
  
  return url;
}

// Función principal
async function fixAllProductImages() {
  console.log('🔍 Iniciando corrección de URLs de imágenes...');
  
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 Encontrados ${snapshot.size} productos para revisar`);
    
    let fixedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();
      const updates = {};
      let needsUpdate = false;
      
      // Corregir imagen principal
      if (product.image) {
        const fixedUrl = fixFirebaseUrl(product.image);
        if (fixedUrl !== product.image) {
          updates.image = fixedUrl;
          needsUpdate = true;
          console.log(`🔄 Producto ${docSnap.id}: Corrigiendo imagen principal`);
        }
      }
      
      // Corregir array de imágenes (si existe)
      if (product.images && Array.isArray(product.images)) {
        const fixedImages = product.images.map(img => fixFirebaseUrl(img));
        if (JSON.stringify(fixedImages) !== JSON.stringify(product.images)) {
          updates.images = fixedImages;
          needsUpdate = true;
          console.log(`🖼️ Producto ${docSnap.id}: Corrigiendo ${fixedImages.length} imágenes`);
        }
      }
      
      // Actualizar el documento si es necesario
      if (needsUpdate) {
        await updateDoc(doc(db, 'products', docSnap.id), updates);
        fixedCount++;
        console.log(`✅ Producto ${docSnap.id} actualizado`);
      }
    }
    
    console.log(`\n🎉 Proceso completado!`);
    console.log(`✅ Productos actualizados: ${fixedCount}/${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
fixAllProductImages();
