import { getProducts, updateProduct } from '../services/firebase.js';

/**
 * Corrector directo de URLs de Firebase Storage
 * No valida URLs, solo las corrige directamente
 */

// Función para corregir URLs malformadas de Firebase Storage
export const fixFirebaseImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Detectar URLs malformadas con ?name=
  const malformedPattern = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\?name=(.+)/;
  const match = url.match(malformedPattern);
  
  if (match) {
    const [, bucket, encodedPath] = match;
    const correctedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    console.log('🔧 URL corregida:', url, '->', correctedUrl);
    return correctedUrl;
  }
  
  // Detectar URLs del emulador local
  if (url.includes('localhost:9199') || url.includes('127.0.0.1:9199')) {
    console.log('🔧 Detectada URL del emulador local:', url);
    // Extraer el path del archivo
    const pathMatch = url.match(/\/v0\/b\/[^/]+\/o\/(.+?)\?/);
    if (pathMatch) {
      const filePath = pathMatch[1];
      const correctedUrl = `https://firebasestorage.googleapis.com/v0/b/phenom-boxing-store.firebasestorage.app/o/${filePath}?alt=media`;
      console.log('🔧 URL del emulador corregida:', url, '->', correctedUrl);
      return correctedUrl;
    }
  }
  
  return url;
};

// Función principal para corregir todas las imágenes directamente
export const fixAllImageUrls = async () => {
  console.log('🔧 [DirectFix] Iniciando corrección directa de URLs...');
  
  try {
    // Obtener todos los productos
    const products = await getProducts();
    console.log(`📦 [DirectFix] Encontrados ${products.length} productos`);
    
    let fixedCount = 0;
    let errorCount = 0;
    const problematicProducts = [];
    
    for (const product of products) {
      try {
        if (product.image) {
          // Verificar si la URL necesita corrección
          const needsFixing = 
            product.image.includes('127.0.0.1:9199') || 
            product.image.includes('localhost:9199') ||
            product.image.includes('?name='); // URLs malformadas
          
          if (needsFixing) {
            const originalUrl = product.image;
            const correctedUrl = fixFirebaseImageUrl(product.image);
            
            problematicProducts.push({
              name: product.name,
              originalUrl,
              correctedUrl
            });
            
            if (correctedUrl !== originalUrl) {
              console.log(`🔧 [DirectFix] Corrigiendo: ${product.name}`);
              
              // Actualizar producto con URL corregida
              await updateProduct(product.id, {
                ...product,
                image: correctedUrl
              });
              
              console.log(`✅ [DirectFix] Corregido: ${product.name}`);
              fixedCount++;
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ [DirectFix] Error procesando ${product.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`🎉 [DirectFix] Proceso completado:`);
    console.log(`   ✅ Imágenes corregidas: ${fixedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 URLs problemáticas encontradas: ${problematicProducts.length}`);
    
    return {
      success: true,
      fixed: fixedCount,
      errors: errorCount,
      total: products.length,
      problematic: problematicProducts
    };
    
  } catch (error) {
    console.error('❌ [DirectFix] Error general:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para escanear productos sin corregir (solo mostrar problemas)
export const scanProblematicImages = async () => {
  console.log('🔍 [DirectFix] Escaneando productos...');
  
  try {
    const products = await getProducts();
    const problematicProducts = [];
    
    for (const product of products) {
      if (product.image) {
        const needsFixing = 
          product.image.includes('127.0.0.1:9199') || 
          product.image.includes('localhost:9199') ||
          product.image.includes('?name=');
        
        if (needsFixing) {
          problematicProducts.push({
            id: product.id,
            name: product.name,
            currentUrl: product.image,
            suggestedUrl: fixFirebaseImageUrl(product.image)
          });
        }
      }
    }
    
    return {
      success: true,
      total: products.length,
      problematic: problematicProducts.length,
      products: problematicProducts
    };
    
  } catch (error) {
    console.error('❌ [DirectFix] Error escaneando:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
