// Script para diagnosticar y corregir problemas de Firebase Storage
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';

// Configuración de Firebase (usar las mismas variables que en la app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function diagnoseStorageIssues() {
  console.log('🔍 Diagnosticando problemas de Firebase Storage...');
  
  try {
    // 1. Verificar configuración de Storage
    console.log('📋 Configuración de Storage:');
    console.log('- Storage Bucket:', firebaseConfig.storageBucket);
    
    // 2. Listar archivos en Storage
    console.log('\n📁 Archivos en Storage:');
    const storageRef = ref(storage, 'products/');
    try {
      const listResult = await listAll(storageRef);
      console.log(`- Encontrados ${listResult.items.length} archivos en /products/`);
      
      for (const item of listResult.items.slice(0, 5)) { // Solo mostrar los primeros 5
        console.log(`  - ${item.name}`);
        try {
          const url = await getDownloadURL(item);
          console.log(`    URL: ${url.substring(0, 80)}...`);
        } catch (urlError) {
          console.error(`    ❌ Error obteniendo URL: ${urlError.message}`);
        }
      }
    } catch (listError) {
      console.error('❌ Error listando archivos:', listError.message);
    }
    
    // 3. Verificar productos en Firestore
    console.log('\n📦 Productos en Firestore:');
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    let problematicProducts = [];
    
    for (const docSnap of querySnapshot.docs) {
      const product = docSnap.data();
      const productId = docSnap.id;
      
      if (product.images && Array.isArray(product.images)) {
        for (let i = 0; i < product.images.length; i++) {
          const imageUrl = product.images[i];
          
          // Verificar si la URL es problemática
          if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
            try {
              // Intentar hacer una petición HEAD para verificar accesibilidad
              const response = await fetch(imageUrl, { method: 'HEAD' });
              if (!response.ok) {
                problematicProducts.push({
                  productId,
                  productName: product.name,
                  imageIndex: i,
                  imageUrl,
                  error: `HTTP ${response.status}`
                });
              }
            } catch (fetchError) {
              problematicProducts.push({
                productId,
                productName: product.name,
                imageIndex: i,
                imageUrl,
                error: fetchError.message
              });
            }
          }
        }
      }
    }
    
    // 4. Mostrar productos problemáticos
    if (problematicProducts.length > 0) {
      console.log(`\n❌ Encontrados ${problematicProducts.length} problemas de imágenes:`);
      problematicProducts.forEach(problem => {
        console.log(`- Producto: ${problem.productName} (${problem.productId})`);
        console.log(`  Imagen ${problem.imageIndex}: ${problem.error}`);
        console.log(`  URL: ${problem.imageUrl.substring(0, 80)}...`);
      });
      
      return problematicProducts;
    } else {
      console.log('\n✅ No se encontraron problemas de imágenes');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    throw error;
  }
}

async function fixStorageRules() {
  console.log('\n🔧 Sugerencias para corregir problemas de Storage:');
  
  console.log(`
📋 Reglas de Firebase Storage recomendadas:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de imágenes de productos
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Reglas más restrictivas para otros archivos
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}

🔗 Para aplicar estas reglas:
1. Ve a Firebase Console > Storage > Rules
2. Reemplaza las reglas actuales con las de arriba
3. Haz clic en "Publicar"

🌐 Configuración CORS para Storage:
Si persisten los errores CORS, ejecuta este comando:

gsutil cors set cors.json gs://phenom-boxing-store.firebasestorage.app

Donde cors.json contiene:
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
`);
}

// Función para regenerar URLs problemáticas
async function regenerateProblematicUrls(problematicProducts) {
  console.log('\n🔄 Regenerando URLs problemáticas...');
  
  for (const problem of problematicProducts) {
    try {
      // Extraer el nombre del archivo de la URL problemática
      const urlParts = problem.imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      if (fileName.includes('products%2F')) {
        const cleanFileName = decodeURIComponent(fileName.replace('products%2F', ''));
        
        // Crear nueva referencia y obtener URL actualizada
        const imageRef = ref(storage, `products/${cleanFileName}`);
        const newUrl = await getDownloadURL(imageRef);
        
        console.log(`✅ Nueva URL para ${problem.productName}: ${newUrl.substring(0, 80)}...`);
        
        // Actualizar en Firestore
        const productRef = doc(db, 'products', problem.productId);
        const productDoc = await getDocs(collection(db, 'products'));
        const currentProduct = productDoc.docs.find(d => d.id === problem.productId)?.data();
        
        if (currentProduct && currentProduct.images) {
          const updatedImages = [...currentProduct.images];
          updatedImages[problem.imageIndex] = newUrl;
          
          await updateDoc(productRef, { images: updatedImages });
          console.log(`✅ Producto ${problem.productName} actualizado`);
        }
      }
    } catch (error) {
      console.error(`❌ Error regenerando URL para ${problem.productName}:`, error.message);
    }
  }
}

// Ejecutar diagnóstico
async function main() {
  try {
    const problems = await diagnoseStorageIssues();
    await fixStorageRules();
    
    if (problems.length > 0) {
      console.log('\n❓ ¿Deseas intentar regenerar las URLs problemáticas? (y/n)');
      // En un entorno real, aquí podrías usar readline para input del usuario
      // Por ahora, comentamos la regeneración automática
      // await regenerateProblematicUrls(problems);
    }
    
  } catch (error) {
    console.error('❌ Error en el script principal:', error);
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { diagnoseStorageIssues, fixStorageRules, regenerateProblematicUrls };
