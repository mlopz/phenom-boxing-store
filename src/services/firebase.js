import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Configuración de Firebase usando variables de entorno

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar que todas las variables estén definidas
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Firebase: Variables de entorno faltantes:', missingVars);
  throw new Error('Variables de entorno de Firebase faltantes. Revisa el archivo .env.local');
}



// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Configuración temporal: usar Firebase en producción para pruebas
// (Cambiar a emuladores cuando esté listo para desarrollo local)
console.log('🌐 [Firebase] Usando Firebase en producción para pruebas');

// Para usar emuladores locales, descomenta el código siguiente:
/*
if (import.meta.env.DEV) {
  console.log('🔧 [Firebase] Conectando a emuladores locales...');
  
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8081);
    console.log('✅ [Firebase] Firestore emulator conectado en puerto 8081');
  } catch (error) {
    console.log('⚠️ [Firebase] Firestore emulator ya conectado');
  }
  
  try {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('✅ [Firebase] Storage emulator conectado en puerto 9199');
  } catch (error) {
    console.log('⚠️ [Firebase] Storage emulator ya conectado');
  }
}
*/

// Funciones para productos
export const getProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return products;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

export const addProduct = async (productData) => {
  try {
    console.log('📦 [Firebase] Agregando producto:', productData.name);
    
    // Procesar imágenes si existen
    let processedData = { ...productData };
    if (productData.images && productData.images.length > 0) {
      console.log('🖼️ [Firebase] Procesando', productData.images.length, 'imágenes...');
      processedData.images = await processProductImages(productData.images);
      // Mantener compatibilidad con imagen principal
      processedData.image = processedData.images[0] || '';
    }
    
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, processedData);
    console.log('✅ [Firebase] Producto agregado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ [Firebase] Error agregando producto:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    console.log('🔄 [Firebase] Actualizando producto:', productId);
    
    // Procesar imágenes si existen
    let processedData = { ...productData };
    if (productData.images && productData.images.length > 0) {
      console.log('🖼️ [Firebase] Procesando', productData.images.length, 'imágenes...');
      processedData.images = await processProductImages(productData.images);
      // Mantener compatibilidad con imagen principal
      processedData.image = processedData.images[0] || '';
    }
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, processedData);
    console.log('✅ [Firebase] Producto actualizado:', productId);
  } catch (error) {
    console.error('❌ [Firebase] Error actualizando producto:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    console.log('🔍 [DEBUG] Intentando eliminar producto con ID:', productId);
    
    if (!productId) {
      throw new Error('ID de producto no válido');
    }
    
    const productRef = doc(db, 'products', productId);
    console.log('🔍 [DEBUG] Referencia del producto creada:', productRef.path);
    
    await deleteDoc(productRef);
    console.log('✅ [Firebase] Producto eliminado correctamente:', productId);
  } catch (error) {
    console.error('❌ [Firebase] Error eliminando producto:', error);
    console.error('❌ [Firebase] ProductId recibido:', productId);
    console.error('❌ [Firebase] Tipo de productId:', typeof productId);
    throw error;
  }
};

// Función para comprimir imagen automáticamente
const compressImage = (base64Data, quality = 0.8, maxWidth = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64 comprimido
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      console.log(`🗜️ [Compress] Imagen optimizada: ${Math.round(base64Data.length/1024)}KB → ${Math.round(compressedBase64.length/1024)}KB`);
      resolve(compressedBase64);
    };
    
    img.src = base64Data;
  });
};

// Función para subir imagen a Firebase Storage
export const uploadImageToStorage = async (base64Data, fileName) => {
  try {
    // Comprimir imagen antes de subir
    const compressedBase64 = await compressImage(base64Data, 0.8, 800);
    
    // Convertir base64 comprimido a blob
    const response = await fetch(compressedBase64);
    const blob = await response.blob();
    
    // Crear referencia en Storage
    const imageRef = ref(storage, `products/${Date.now()}_${fileName}`);
    
    // Subir imagen
    const snapshot = await uploadBytes(imageRef, blob);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ [Storage] Imagen subida y optimizada:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ [Storage] Error subiendo imagen:', error);
    throw error;
  }
};

// Función para procesar múltiples imágenes
export const processProductImages = async (images) => {
  try {
    const imageUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Si ya es una URL, mantenerla
      if (typeof image === 'string' && image.startsWith('http')) {
        imageUrls.push(image);
      } 
      // Si es base64, subirla a Storage
      else if (typeof image === 'string' && image.startsWith('data:')) {
        const fileName = `image_${i}.jpg`;
        const url = await uploadImageToStorage(image, fileName);
        imageUrls.push(url);
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('❌ [Storage] Error procesando imágenes:', error);
    throw error;
  }
};

// Funciones para categorías
export const getCategories = async () => {
  try {
    console.log('📂 [Firebase] Obteniendo categorías...');
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ [Firebase] ${categories.length} categorías obtenidas:`, categories);
    return categories;
  } catch (error) {
    console.error('❌ [Firebase] Error obteniendo categorías:', error);
    console.error('❌ [Firebase] Código de error:', error.code);
    console.error('❌ [Firebase] Mensaje:', error.message);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    console.log('➕ [Firebase] Agregando categoría con ID personalizado:', categoryData.id);
    
    // Usar setDoc con ID personalizado en lugar de addDoc
    const categoryRef = doc(db, 'categories', categoryData.id);
    const { id, ...dataWithoutId } = categoryData;
    
    await setDoc(categoryRef, {
      ...dataWithoutId,
      id: categoryData.id // Mantener el ID en los datos también
    });
    
    console.log('✅ [Firebase] Categoría agregada exitosamente:', categoryData.id);
    return categoryData.id;
  } catch (error) {
    console.error('❌ [Firebase] Error agregando categoría:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, categoryData);
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    throw error;
  }
};

// Funciones para imágenes
export const uploadImage = async (file, path) => {
  try {
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

// Función para migrar datos desde JSON
export const migrateDataFromJSON = async (jsonData) => {
  try {
    const { categories, products } = jsonData;
    
    // Migrar categorías
    for (const category of categories) {
      const { id, ...categoryData } = category;
      await addDoc(collection(db, 'categories'), categoryData);
    }
    
    // Migrar productos
    for (const product of products) {
      const { id, ...productData } = product;
      await addDoc(collection(db, 'products'), productData);
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error en la migración:', error);
    throw error;
  }
};

export { db, storage };
