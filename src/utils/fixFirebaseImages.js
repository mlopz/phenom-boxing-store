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

export const fixFirebaseImages = async () => {
  console.log('🔧 [Fix Images] Iniciando corrección de imágenes...');
  
  try {
    // Obtener todos los productos
    const products = await getProducts();
    console.log(`📦 [Fix Images] Encontrados ${products.length} productos`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        console.log(`🔍 [Fix Images] Procesando producto: ${product.name}`);
        
        // Verificar si la imagen tiene URL del emulador local
        if (product.image && product.image.includes('127.0.0.1:9199')) {
          console.log(`⚠️ [Fix Images] Imagen con URL local detectada: ${product.name}`);
          
          // Si el producto tiene imagen en base64 en los datos originales, usarla
          if (product.originalImageData) {
            console.log(`📸 [Fix Images] Resubiendo imagen desde datos originales...`);
            
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
            
            console.log(`✅ [Fix Images] Imagen corregida para: ${product.name}`);
            fixedCount++;
          } else {
            console.log(`⚠️ [Fix Images] No hay datos originales para: ${product.name}`);
            
            // Marcar producto sin imagen válida
            await updateProduct(product.id, {
              ...product,
              image: '/placeholder-product.jpg' // Imagen placeholder
            });
            
            console.log(`🔄 [Fix Images] Placeholder asignado para: ${product.name}`);
            fixedCount++;
          }
        } else {
          console.log(`✅ [Fix Images] Imagen OK para: ${product.name}`);
        }
        
      } catch (error) {
        console.error(`❌ [Fix Images] Error procesando ${product.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`🎉 [Fix Images] Proceso completado:`);
    console.log(`   ✅ Imágenes corregidas: ${fixedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    
    return {
      success: true,
      fixed: fixedCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ [Fix Images] Error general:', error);
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
  console.log('🔄 [Reload Catalog] Iniciando recarga completa...');
  
  try {
    // Importar el catálogo original
    const { default: catalogData } = await import('../data/catalog.js');
    
    console.log('📋 [Reload Catalog] Catálogo original cargado');
    console.log(`   📦 Productos: ${catalogData.products.length}`);
    console.log(`   📂 Categorías: ${catalogData.categories.length}`);
    
    // Aquí se podría implementar la lógica de recarga completa
    // Por ahora solo mostramos la información
    
    return {
      success: true,
      message: 'Catálogo listo para recarga'
    };
    
  } catch (error) {
    console.error('❌ [Reload Catalog] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
