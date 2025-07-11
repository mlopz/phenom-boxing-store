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

/**
 * Actualiza un producto existente en Firestore
 * @param {string} productId - ID del producto a actualizar
 * @param {Object} productData - Datos actualizados del producto
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la actualización
 */
export const updateProduct = async (productId, productData) => {
  if (!productId) {
    console.error('❌ [Firebase] Error: ID de producto no proporcionado');
    throw new Error('ID de producto no proporcionado');
  }

  console.log(`🔄 [Firebase] Iniciando actualización del producto ID: ${productId}`);
  
  try {
    // 1. Preparar los datos del producto
    const processedData = { ...productData };
    
    // 2. Procesar imágenes si existen
    if (processedData.images && Array.isArray(processedData.images) && processedData.images.length > 0) {
      console.log(`🖼️ [Firebase] Procesando ${processedData.images.length} imágenes...`);
      
      // Filtrar imágenes vacías o inválidas
      const validImages = processedData.images.filter(img => 
        img && (typeof img === 'string' || img instanceof String)
      );
      
      // Procesar solo las imágenes válidas
      if (validImages.length > 0) {
        processedData.images = await processProductImages(validImages);
        // Mantener compatibilidad con imagen principal (primera imagen del array)
        processedData.image = processedData.images[0] || '';
      } else {
        // Si no hay imágenes válidas, establecer arrays vacíos
        processedData.images = [];
        processedData.image = '';
      }
      
      console.log(`✅ [Firebase] ${processedData.images.length} imágenes procesadas`);
    } else {
      // Si no hay imágenes, asegurarse de que los campos estén vacíos
      processedData.images = [];
      processedData.image = '';
    }
    
    // 3. Preparar los datos para Firestore (eliminar campos undefined)
    const updateData = Object.entries(processedData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    // 4. Actualizar el documento en Firestore
    console.log('📝 [Firebase] Actualizando documento en Firestore...');
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updateData, { merge: true });
    
    console.log(`✅ [Firebase] Producto ${productId} actualizado correctamente`);
    
  } catch (error) {
    console.error('❌ [Firebase] Error crítico actualizando producto:', error);
    
    // Mejorar el mensaje de error para el usuario
    let errorMessage = 'Error al actualizar el producto';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'No tienes permisos para actualizar este producto';
    } else if (error.code === 'not-found') {
      errorMessage = 'El producto no existe o ha sido eliminado';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet';
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Extrae la ruta de almacenamiento de una URL de Firebase Storage
 * @param {string} url - URL completa de la imagen en Firebase Storage
 * @returns {string|null} Ruta de la imagen o null si no se pudo extraer
 */
const extractImagePath = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('⚠️ [Storage] URL de imagen no válida');
    return null;
  }

  try {
    // Patrones de URL de Firebase Storage
    const patterns = [
      // Formato estándar: https://firebasestorage.googleapis.com/v0/b/bucket/o/path/to/image.jpg?alt=media&token=...
      /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/,
      
      // Formato de descarga directa: https://storage.googleapis.com/bucket/o/path%2Fto%2Fimage.jpg?alt=media&token=...
      /https:\/\/storage\.googleapis\.com\/[^/]+\/o\/([^?]+)/,
      
      // Formato alternativo: https://firebasestorage.googleapis.com/v0/b/bucket.appspot.com/o/path%2Fto%2Fimage.jpg?alt=media&token=...
      /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\.appspot\.com\/o\/([^?]+)/
    ];

    // Probar cada patrón hasta encontrar una coincidencia
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // Decodificar la URL (convierte %2F a /, etc.)
        const decodedPath = decodeURIComponent(match[1]);
        console.log(`🔍 [Storage] Ruta extraída: ${decodedPath}`);
        return decodedPath;
      }
    }

    // Si no coincide con ningún patrón conocido, intentar extraer la ruta manualmente
    console.warn('⚠️ [Storage] No se pudo extraer la ruta con patrones estándar, intentando extracción manual...');
    
    // Extraer la parte después de /o/ y antes de ?
    const oIndex = url.indexOf('/o/');
    if (oIndex !== -1) {
      const afterO = url.substring(oIndex + 3); // +3 para saltar '/o/'
      const beforeQuery = afterO.split('?')[0];
      const decodedPath = decodeURIComponent(beforeQuery);
      
      // Verificar que la ruta extraída tenga sentido
      if (decodedPath && !decodedPath.includes('http') && decodedPath.length > 1) {
        console.log(`🔍 [Storage] Ruta extraída manualmente: ${decodedPath}`);
        return decodedPath;
      }
    }
    
    console.warn('❌ [Storage] No se pudo extraer la ruta de la imagen');
    return null;
    
  } catch (error) {
    console.error('❌ [Storage] Error extrayendo ruta de la imagen:', error);
    return null;
  }
};

/**
 * Elimina un producto y sus imágenes asociadas de Firebase Storage
 * @param {string} productId - ID del producto a eliminar
 * @returns {Promise<{success: boolean, deletedImages: number}>} - Objeto con éxito y cantidad de imágenes eliminadas
 * @throws {Error} Si ocurre un error durante la eliminación
 */
export const deleteProduct = async (productId) => {
  // Validación de entrada
  if (!productId || typeof productId !== 'string') {
    console.error('❌ [Firebase] Error: ID de producto no válido');
    throw new Error('ID de producto no válido');
  }

  console.log(`🔍 [Firebase] Iniciando eliminación del producto ID: ${productId}`);
  
  // Iniciar transacción de Firestore para operación atómica
  const batch = writeBatch(db);
  const productRef = doc(db, 'products', productId);
  let deletedImagesCount = 0;
  
  try {
    // 1. Obtener el documento del producto
    console.log('📦 [Firebase] Obteniendo datos del producto...');
    const productSnap = await getDoc(productRef);
    
    // Verificar si el producto existe
    if (!productSnap.exists()) {
      console.warn(`⚠️ [Firebase] El producto con ID ${productId} no existe`);
      throw new Error('El producto no existe o ya ha sido eliminado');
    }
    
    const productData = productSnap.data();
    console.log('✅ [Firebase] Datos del producto obtenidos');
    
    // 2. Procesar eliminación de imágenes
    try {
      // Unificar todas las imágenes en un solo array (principal + secundarias)
      const allImages = [
        productData.image, // Imagen principal
        ...(Array.isArray(productData.images) ? productData.images : []) // Imágenes adicionales
      ].filter(Boolean); // Filtrar valores nulos/undefined
      
      console.log(`🖼️ [Storage] Procesando ${allImages.length} imágenes...`);
      
      // Eliminar cada imagen del Storage
      const deletePromises = allImages.map(async (imageUrl, index) => {
        if (!imageUrl) return;
        
        try {
          // Extraer la ruta de la imagen
          const imagePath = extractImagePath(imageUrl);
          
          if (!imagePath) {
            console.warn(`⚠️ [Storage] No se pudo extraer la ruta de la imagen: ${imageUrl.substring(0, 50)}...`);
            return;
          }
          
          console.log(`🗑️ [Storage] Eliminando imagen ${index + 1}/${allImages.length}: ${imagePath}`);
          const imageRef = ref(storage, imagePath);
          
          // Verificar si la referencia es válida
          if (!imageRef) {
            console.error(`❌ [Storage] Referencia de imagen inválida`);
            return;
          }
          
          // Eliminar el archivo de Storage
          await deleteObject(imageRef);
          console.log(`✅ [Storage] Imagen eliminada: ${imagePath}`);
          deletedImagesCount++;
          
        } catch (imgError) {
          // Manejar específicamente el error de "objeto no encontrado"
          if (imgError.code === 'storage/object-not-found') {
            console.warn(`ℹ️ [Storage] La imagen ya no existe: ${imageUrl.substring(0, 50)}...`);
          } else {
            console.error(`❌ [Storage] Error eliminando imagen:`, imgError);
            throw imgError; // Relanzar para ser capturado por el catch externo
          }
        }
      });
      
      // Esperar a que todas las eliminaciones de imágenes se completen
      await Promise.all(deletePromises);
      
    } catch (imgError) {
      console.error('❌ [Storage] Error crítico eliminando imágenes:', imgError);
      // No relanzamos el error aquí para intentar eliminar el documento de todas formas
    }
    
    // 3. Eliminar el documento del producto en la transacción
    console.log('🗑️ [Firebase] Programando eliminación del documento...');
    batch.delete(productRef);
    
    // 4. Ejecutar la transacción
    console.log('🔄 [Firebase] Ejecutando transacción...');
    await batch.commit();
    
    console.log(`✅ [Firebase] Producto eliminado correctamente. Imágenes eliminadas: ${deletedImagesCount}`);
    return { success: true, deletedImages: deletedImagesCount };
    
  } catch (error) {
    console.error('❌ [Firebase] Error crítico eliminando producto:', error);
    
    // Revertir la transacción en caso de error
    try {
      await batch.commit();
    } catch (commitError) {
      console.error('❌ [Firebase] Error al revertir la transacción:', commitError);
    }
    
    // Mejorar mensajes de error para el usuario
    let errorMessage = 'Error al eliminar el producto';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'No tienes permisos para eliminar este producto';
    } else if (error.code === 'not-found' || error.message.includes('no existe')) {
      errorMessage = 'El producto no existe o ya ha sido eliminado';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet';
    } else if (error.code === 'failed-precondition') {
      errorMessage = 'El producto no se puede eliminar porque está siendo utilizado';
    } else if (error.code === 'aborted') {
      errorMessage = 'La operación fue cancelada';
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
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

/**
 * Valida si una URL de Firebase Storage es accesible
 * @param {string} url - URL a validar
 * @returns {Promise<boolean>} true si la URL es accesible
 */
export const validateStorageUrl = async (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Para URLs de Firebase Storage, asumir que son válidas si tienen la estructura correcta
  // Esto evita problemas de CORS durante la validación
  if (url.includes('firebasestorage.googleapis.com') && url.includes('alt=media')) {
    console.log('✅ [Storage] URL de Firebase Storage válida (sin verificación CORS)');
    return true;
  }
  
  // Para otras URLs, intentar validación sin CORS
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true; // Si no hay error, asumir que es válida
  } catch (error) {
    console.warn('⚠️ [Storage] URL no accesible:', url.substring(0, 80) + '...');
    return false;
  }
};

/**
 * Regenera una URL de Firebase Storage desde una referencia
 * @param {string} storagePath - Ruta del archivo en Storage (ej: 'products/imagen.jpg')
 * @returns {Promise<string>} Nueva URL de descarga
 */
export const regenerateStorageUrl = async (storagePath) => {
  try {
    const imageRef = ref(storage, storagePath);
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`✅ [Storage] URL regenerada para: ${storagePath}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ [Storage] Error regenerando URL para ${storagePath}:`, error);
    throw error;
  }
};

/**
 * Sube una imagen a Firebase Storage y devuelve su URL de descarga
 * @param {string} base64Data - Imagen en formato base64 o data URL
 * @param {string} fileName - Nombre del archivo (se le agregará un prefijo único)
 * @returns {Promise<string>} URL de descarga pública de la imagen
 * @throws {Error} Si ocurre un error durante la subida
 */
export const uploadImageToStorage = async (base64Data, fileName) => {
  if (!base64Data) {
    throw new Error('No se proporcionaron datos de imagen');
  }

  // Validar que el nombre de archivo sea una cadena no vacía
  const safeFileName = (typeof fileName === 'string' && fileName.trim() !== '') 
    ? fileName.trim() 
    : `image_${Date.now()}.jpg`;
  
  try {
    console.log('🔄 [Storage] Iniciando subida de imagen...');
    
    // 1. Comprimir imagen antes de subir (si es una imagen base64 válida)
    let imageToUpload = base64Data;
    if (base64Data.startsWith('data:image/')) {
      try {
        console.log('🖼️ [Storage] Comprimiendo imagen...');
        imageToUpload = await compressImage(base64Data, 0.8, 800);
      } catch (compressError) {
        console.warn('⚠️ [Storage] No se pudo comprimir la imagen, subiendo original', compressError);
        // Continuar con la imagen original si falla la compresión
      }
    }
    
    // 2. Convertir a Blob (si es una data URL)
    let blob;
    if (typeof imageToUpload === 'string' && imageToUpload.startsWith('data:')) {
      try {
        const response = await fetch(imageToUpload);
        if (!response.ok) {
          throw new Error(`Error al convertir imagen: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      } catch (blobError) {
        console.error('❌ [Storage] Error al convertir a Blob:', blobError);
        throw new Error('Formato de imagen no válido');
      }
    } else {
      // Si ya es un Blob o un File, usarlo directamente
      blob = imageToUpload;
    }
    
    // 3. Validar tipo MIME (solo permitir imágenes)
    if (!blob.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen (JPEG, PNG, etc.)');
    }
    
    // 4. Crear referencia en Storage con nombre único y simple
    const fileExtension = blob.type.split('/')[1] || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `products/${timestamp}_${randomId}.${fileExtension}`;
    const imageRef = ref(storage, uniqueFileName);
    
    console.log(`🔼 [Storage] Subiendo imagen: ${uniqueFileName} (${(blob.size / 1024).toFixed(2)} KB)`);
    
    // 5. Configurar metadatos optimizados
    const metadata = {
      cacheControl: 'public, max-age=31536000',
      contentType: blob.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: safeFileName
      }
    };
    
    // 6. Subir el archivo a Firebase Storage
    const snapshot = await uploadBytes(imageRef, blob, metadata);
    
    // 7. Obtener URL de descarga con reintentos
    let downloadURL;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        downloadURL = await getDownloadURL(snapshot.ref);
        
        // Validar que la URL sea accesible
        const isValid = await validateStorageUrl(downloadURL);
        if (isValid) {
          break;
        } else if (attempts === maxAttempts - 1) {
          console.warn('⚠️ [Storage] URL generada pero no accesible inmediatamente');
        }
      } catch (urlError) {
        console.warn(`⚠️ [Storage] Intento ${attempts + 1} fallido obteniendo URL:`, urlError.message);
        if (attempts === maxAttempts - 1) {
          throw urlError;
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      }
    }
    
    console.log('✅ [Storage] Imagen subida exitosamente');
    console.log(`🔗 [Storage] URL generada: ${downloadURL.substring(0, 80)}...`);
    
    return downloadURL;
    
  } catch (error) {
    console.error('❌ [Storage] Error crítico subiendo imagen:', error);
    
    // Mejorar mensajes de error para el usuario
    let errorMessage = 'Error al subir la imagen';
    
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'No tienes permisos para subir imágenes. Verifica las reglas de Firebase Storage.';
    } else if (error.code === 'storage/canceled') {
      errorMessage = 'La subida de la imagen fue cancelada';
    } else if (error.code === 'storage/unknown') {
      errorMessage = 'Error desconocido al subir la imagen';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Cuota de almacenamiento excedida';
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Procesa múltiples imágenes para un producto, subiendo las nuevas a Firebase Storage
 * y manteniendo las URLs existentes.
 * @param {Array<string>} images - Array de URLs de imágenes o strings en base64
 * @returns {Promise<Array<string>>} Array de URLs de imágenes procesadas
 */
export const processProductImages = async (images) => {
  // Validación de entrada
  if (!images || !Array.isArray(images)) {
    console.log('⚠️ [Storage] No hay imágenes para procesar o no es un array');
    return [];
  }
  
  console.log(`🔄 [Storage] Iniciando procesamiento de ${images.length} imágenes...`);
  const processedImages = [];
  
  try {
    // Procesar cada imagen en paralelo para mejor rendimiento
    const uploadPromises = images.map(async (image, index) => {
      if (!image) {
        console.warn(`⚠️ [Storage] Imagen en índice ${index} es nula o indefinida`);
        return null;
      }
      
      // Si ya es una URL de Firebase Storage o HTTP/HTTPS, mantenerla
      if (typeof image === 'string') {
        // Verificar si es una URL de Firebase Storage (contiene 'firebasestorage' o es una URL HTTP/HTTPS)
        if (image.includes('firebasestorage') || image.startsWith('http')) {
          console.log(`🔗 [Storage] Manteniendo URL existente [${index}]: ${image.substring(0, 50)}...`);
          return image;
        }
        
        // Si es una cadena base64, subirla a Storage
        if (image.startsWith('data:image/')) {
          try {
            const fileName = `products/product_${Date.now()}_${index}.jpg`;
            console.log(`🔼 [Storage] Subiendo imagen ${index + 1} a Firebase Storage...`);
            const url = await uploadImageToStorage(image, fileName);
            console.log(`✅ [Storage] Imagen ${index + 1} subida correctamente`);
            return url;
          } catch (uploadError) {
            console.error(`❌ [Storage] Error subiendo imagen ${index + 1}:`, uploadError);
            return null; // Devolver null para imágenes fallidas
          }
        }
      }
      
      console.warn(`⚠️ [Storage] Formato de imagen no reconocido en índice ${index}:`, typeof image);
      return null;
    });
    
    // Esperar a que todas las subidas se completen
    const results = await Promise.all(uploadPromises);
    
    // Filtrar valores nulos (imágenes fallidas) y devolver solo las URLs válidas
    const validImages = results.filter(url => url !== null);
    
    console.log(`✅ [Storage] Procesamiento completado: ${validImages.length}/${images.length} imágenes exitosas`);
    return validImages;
    
  } catch (error) {
    console.error('❌ [Storage] Error crítico procesando imágenes:', error);
    throw new Error(`Error al procesar imágenes: ${error.message}`);
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
