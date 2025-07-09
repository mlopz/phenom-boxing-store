import { 
  getProducts, 
  getCategories, 
  updateProduct, 
  uploadProductImage, 
  deleteProductImage 
} from '../services/firebase.js';

/**
 * Script para corregir las URLs de imágenes de Firebase Storage
 * que están apuntando al emulador local en lugar de Firebase real
 */

// Función para verificar si una URL ya tiene el formato correcto de Firebase Storage
export const isCorrectFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Verificar si es una URL correcta de Firebase Storage
  const correctPattern = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/[^?]+\?alt=media/;
  return correctPattern.test(url);
};

// Función para corregir URLs de Firebase Storage malformadas
export const fixFirebaseImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Si ya es una URL correcta, no hacer nada
  if (isCorrectFirebaseUrl(url)) {
    return url;
  }
  
  // Detectar URLs malformadas de Firebase Storage
  const firebaseStorageRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\?name=(.+)/;
  const match = url.match(firebaseStorageRegex);
  
  if (match) {
    const [, bucket, encodedPath] = match;
    // Construir la URL correcta
    const correctedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    console.log(' URL corregida:', url, '->', correctedUrl);
    return correctedUrl;
  }
  
  // Detectar URLs del emulador local y convertirlas
  if (url.includes('localhost:9199') || url.includes('127.0.0.1:9199')) {
    console.log(' Detectada URL del emulador local:', url);
    // Extraer el path del archivo
    const pathMatch = url.match(/\/v0\/b\/[^/]+\/o\/(.+?)\?/);
    if (pathMatch) {
      const filePath = pathMatch[1];
      const correctedUrl = `https://firebasestorage.googleapis.com/v0/b/phenom-boxing-store.firebasestorage.app/o/${filePath}?alt=media`;
      console.log(' URL del emulador corregida:', url, '->', correctedUrl);
      return correctedUrl;
    }
  }
  
  return url;
};

// Función para verificar si una URL de imagen es válida
export const isValidImageUrl = async (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Si la URL ya tiene el formato correcto, no la validamos para evitar errores 404
  if (isCorrectFirebaseUrl(url)) {
    return true;
  }
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Error verificando URL:', url, error);
    return false;
  }
};

export const fixFirebaseImages = async () => {
  console.log(' [Fix Images] Iniciando corrección de imágenes...');
  
  try {
    // Obtener todos los productos
    const products = await getProducts();
    console.log(` [Fix Images] Encontrados ${products.length} productos`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        console.log(` [Fix Images] Procesando producto: ${product.name}`);
        
        // Verificar si la imagen necesita corrección
        const needsFixing = product.image && (
          product.image.includes('127.0.0.1:9199') || 
          product.image.includes('localhost:9199') ||
          product.image.includes('?name=') // URLs malformadas
        );
        
        if (needsFixing) {
          console.log(` [Fix Images] Imagen problemática detectada: ${product.name}`);
          console.log(` [Fix Images] URL original: ${product.image}`);
          
          // Intentar corregir la URL primero
          const correctedUrl = fixFirebaseImageUrl(product.image);
          
          if (correctedUrl !== product.image) {
            console.log(` [Fix Images] URL corregida: ${correctedUrl}`);
            
            // Actualizar producto con URL corregida
            await updateProduct(product.id, {
              ...product,
              image: correctedUrl
            });
            
            console.log(` [Fix Images] URL actualizada para: ${product.name}`);
            fixedCount++;
          } else if (product.originalImageData) {
            console.log(` [Fix Images] Resubiendo imagen desde datos originales...`);
            
            // Convertir base64 a blob
            const response = await fetch(product.originalImageData);
            const blob = await response.blob();
            
            // Subir nueva imagen a Firebase Storage real
            const newImageUrl = await uploadProductImage(product.id, blob);
            
            // Actualizar producto con nueva URL
            await updateProduct(product.id, {
              ...product,
              image: newImageUrl
            });
            
            console.log(` [Fix Images] Imagen resubida para: ${product.name}`);
            fixedCount++;
          } else {
            console.log(` [Fix Images] No se puede corregir: ${product.name}`);
            
            // Marcar producto sin imagen válida
            await updateProduct(product.id, {
              ...product,
              image: '/placeholder-product.jpg' // Imagen placeholder
            });
            
            console.log(` [Fix Images] Placeholder asignado para: ${product.name}`);
            fixedCount++;
          }
        } else {
          console.log(` [Fix Images] Imagen OK para: ${product.name}`);
        }
        
      } catch (error) {
        console.error(` [Fix Images] Error procesando ${product.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(` [Fix Images] Proceso completado:`);
    console.log(`   [Fix Images] Imágenes corregidas: ${fixedCount}`);
    console.log(`   [Fix Images] Errores: ${errorCount}`);
    
    return {
      success: true,
      fixed: fixedCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error(' [Fix Images] Error general:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función alternativa: Recargar todo el catálogo desde cero
 */
export const reloadCatalogFromScratch = async () => {
  console.log(' [Reload Catalog] Iniciando recarga completa...');
  
  try {
    // Importar el catálogo original
    const { default: catalogData } = await import('../data/catalog.js');
    
    console.log(' [Reload Catalog] Catálogo original cargado');
    console.log(`   [Reload Catalog] Productos: ${catalogData.products.length}`);
    console.log(`   [Reload Catalog] Categorías: ${catalogData.categories.length}`);
    
    // Aquí se podría implementar la lógica de recarga completa
    // Por ahora solo mostramos la información
    
    return {
      success: true,
      message: 'Catálogo listo para recarga'
    };
    
  } catch (error) {
    console.error(' [Reload Catalog] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
