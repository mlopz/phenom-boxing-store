import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const StorageReset = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const cleanAllImageReferences = async () => {
    setIsProcessing(true);
    setResults(null);

    try {
      console.log('🧹 [Reset] Iniciando limpieza completa de referencias de imágenes...');
      
      // Obtener todos los productos
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📦 [Reset] Encontrados ${products.length} productos`);

      let cleanedCount = 0;
      const cleanedProducts = [];

      // Limpiar referencias de imágenes de todos los productos
      for (const product of products) {
        if (product.image) {
          console.log(`🧹 [Reset] Limpiando imagen de producto: ${product.name}`);
          
          // Actualizar producto sin imagen
          await updateDoc(doc(db, 'products', product.id), {
            image: null
          });
          
          cleanedCount++;
          cleanedProducts.push(product.name);
        }
      }

      // Obtener todas las categorías
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📂 [Reset] Encontradas ${categories.length} categorías`);

      let cleanedCategoriesCount = 0;
      const cleanedCategoriesList = [];

      // Limpiar referencias de imágenes de todas las categorías
      for (const category of categories) {
        if (category.image) {
          console.log(`🧹 [Reset] Limpiando imagen de categoría: ${category.name}`);
          
          // Actualizar categoría sin imagen
          await updateDoc(doc(db, 'categories', category.id), {
            image: null
          });
          
          cleanedCategoriesCount++;
          cleanedCategoriesList.push(category.name);
        }
      }

      const totalCleaned = cleanedCount + cleanedCategoriesCount;

      setResults({
        success: true,
        totalProducts: products.length,
        totalCategories: categories.length,
        cleanedProducts: cleanedCount,
        cleanedCategories: cleanedCategoriesCount,
        totalCleaned,
        cleanedProductsList: cleanedProducts,
        cleanedCategoriesList: cleanedCategoriesList
      });

      console.log(`✅ [Reset] Limpieza completa finalizada. ${totalCleaned} referencias eliminadas.`);

    } catch (error) {
      console.error('❌ [Reset] Error durante la limpieza:', error);
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const handleResetClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmReset = () => {
    cleanAllImageReferences();
  };

  const handleCancelReset = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Trash2 className="h-6 w-6 text-red-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Reset Completo de Storage</h3>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Acción Destructiva</h4>
            <p className="text-red-700 text-sm mb-2">
              Esta acción eliminará TODAS las referencias de imágenes de productos y categorías en Firestore.
            </p>
            <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
              <li>Los productos y categorías seguirán existiendo</li>
              <li>Solo se eliminarán las URLs de imágenes problemáticas</li>
              <li>Podrás re-subir las imágenes después</li>
              <li>Esta acción NO es reversible</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleResetClick}
          disabled={isProcessing}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              Limpiando referencias...
            </>
          ) : (
            <>
              <Trash2 className="h-5 w-5 mr-2" />
              Limpiar Todas las Referencias de Imágenes
            </>
          )}
        </button>

        {/* Modal de confirmación */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-800">Confirmar Reset Completo</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar TODAS las referencias de imágenes? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelReset}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Sí, Limpiar Todo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className={`rounded-lg p-4 ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                {results.success ? (
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">✅ Limpieza Completada</h4>
                    <div className="text-green-700 text-sm space-y-2">
                      <p><strong>Productos procesados:</strong> {results.totalProducts}</p>
                      <p><strong>Categorías procesadas:</strong> {results.totalCategories}</p>
                      <p><strong>Referencias de imágenes eliminadas:</strong> {results.totalCleaned}</p>
                      
                      {results.cleanedProductsList.length > 0 && (
                        <div>
                          <p><strong>Productos limpiados:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {results.cleanedProductsList.map((name, index) => (
                              <li key={index}>{name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {results.cleanedCategoriesList.length > 0 && (
                        <div>
                          <p><strong>Categorías limpiadas:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {results.cleanedCategoriesList.map((name, index) => (
                              <li key={index}>{name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="font-semibold mt-3">
                        🎉 Ahora puedes re-subir las imágenes sin errores 404 o CORS.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">❌ Error en la Limpieza</h4>
                    <p className="text-red-700 text-sm">{results.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageReset;
