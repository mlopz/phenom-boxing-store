import { getProducts, updateProduct, validateStorageUrl, regenerateStorageUrl } from '../services/firebase.js';

/**
 * Diagnostica y repara URLs problemáticas de Firebase Storage
 */
export const repairStorageUrls = async () => {
  console.log('🔍 Iniciando diagnóstico de URLs de Storage...');
  
  try {
    // Obtener todos los productos
    const products = await getProducts();
    console.log(`📦 Analizando ${products.length} productos...`);
    
    let totalProblems = 0;
    let totalFixed = 0;
    
    for (const product of products) {
      if (!product.images || !Array.isArray(product.images)) {
        continue;
      }
      
      console.log(`\n🔍 Verificando producto: ${product.name}`);
      
      let hasProblems = false;
      const fixedImages = [];
      
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        
        if (!imageUrl || typeof imageUrl !== 'string') {
          console.log(`  ❌ Imagen ${i + 1}: URL inválida`);
          fixedImages.push(''); // Mantener posición pero vacía
          hasProblems = true;
          totalProblems++;
          continue;
        }
        
        // Verificar si la URL es accesible
        const isValid = await validateStorageUrl(imageUrl);
        
        if (!isValid) {
          console.log(`  ❌ Imagen ${i + 1}: URL no accesible`);
          totalProblems++;
          hasProblems = true;
          
          // Intentar extraer la ruta del archivo y regenerar URL
          try {
            const storagePath = extractStoragePathFromUrl(imageUrl);
            if (storagePath) {
              console.log(`  🔄 Intentando regenerar URL para: ${storagePath}`);
              const newUrl = await regenerateStorageUrl(storagePath);
              
              // Verificar que la nueva URL funcione
              const newIsValid = await validateStorageUrl(newUrl);
              if (newIsValid) {
                fixedImages.push(newUrl);
                console.log(`  ✅ Imagen ${i + 1}: URL regenerada exitosamente`);
                totalFixed++;
              } else {
                fixedImages.push(''); // URL regenerada pero aún no accesible
                console.log(`  ⚠️ Imagen ${i + 1}: URL regenerada pero no accesible`);
              }
            } else {
              fixedImages.push(''); // No se pudo extraer la ruta
              console.log(`  ❌ Imagen ${i + 1}: No se pudo extraer la ruta de Storage`);
            }
          } catch (regenerateError) {
            fixedImages.push(''); // Error al regenerar
            console.log(`  ❌ Imagen ${i + 1}: Error regenerando URL - ${regenerateError.message}`);
          }
        } else {
          fixedImages.push(imageUrl); // URL válida, mantener
          console.log(`  ✅ Imagen ${i + 1}: URL válida`);
        }
      }
      
      // Si hubo problemas, actualizar el producto
      if (hasProblems) {
        try {
          // Filtrar URLs vacías para limpiar el array
          const cleanImages = fixedImages.filter(url => url && url.trim() !== '');
          
          await updateProduct(product.id, {
            ...product,
            images: cleanImages,
            image: cleanImages[0] || '' // Actualizar imagen principal
          });
          
          console.log(`  💾 Producto actualizado con ${cleanImages.length} imágenes válidas`);
        } catch (updateError) {
          console.error(`  ❌ Error actualizando producto ${product.name}:`, updateError.message);
        }
      }
    }
    
    console.log(`\n📊 Resumen del diagnóstico:`);
    console.log(`- Problemas encontrados: ${totalProblems}`);
    console.log(`- URLs reparadas: ${totalFixed}`);
    console.log(`- URLs no reparables: ${totalProblems - totalFixed}`);
    
    return {
      totalProblems,
      totalFixed,
      success: totalFixed > 0
    };
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    throw error;
  }
};

/**
 * Extrae la ruta de Storage desde una URL de Firebase
 * @param {string} url - URL de Firebase Storage
 * @returns {string|null} Ruta del archivo o null si no se puede extraer
 */
function extractStoragePathFromUrl(url) {
  try {
    // Patrones comunes de URLs de Firebase Storage
    const patterns = [
      // Patrón estándar: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffile.ext?alt=media&token=...
      /\/o\/([^?]+)/,
      // Patrón alternativo: https://storage.googleapis.com/bucket/path/file.ext
      /googleapis\.com\/[^\/]+\/(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // Decodificar la ruta (reemplazar %2F con /)
        const decodedPath = decodeURIComponent(match[1]);
        console.log(`🔍 Ruta extraída: ${decodedPath}`);
        return decodedPath;
      }
    }
    
    console.warn(`⚠️ No se pudo extraer la ruta de: ${url.substring(0, 80)}...`);
    return null;
  } catch (error) {
    console.error('❌ Error extrayendo ruta de Storage:', error);
    return null;
  }
}

/**
 * Ejecuta una reparación rápida de URLs problemáticas
 */
export const quickRepair = async () => {
  console.log('⚡ Iniciando reparación rápida...');
  
  try {
    const result = await repairStorageUrls();
    
    if (result.success) {
      console.log('✅ Reparación completada exitosamente');
      return true;
    } else {
      console.log('⚠️ No se pudieron reparar todas las URLs');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en la reparación rápida:', error);
    return false;
  }
};
