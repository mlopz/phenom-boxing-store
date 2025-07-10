import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, CheckCircle, Search } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const StorageCleanup = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null);

  // Función para verificar si una URL es problemática
  const isProblematicUrl = (url) => {
    if (!url) return false;
    
    // URLs con ?name= son problemáticas
    if (url.includes('?name=')) return true;
    
    // URLs que no tienen token son problemáticas
    if (url.includes('firebasestorage.googleapis.com') && !url.includes('token=')) return true;
    
    return false;
  };

  const diagnoseStorageIssues = async () => {
    setIsProcessing(true);
    setDiagnosticResults(null);

    try {
      console.log('🔍 [Diagnóstico] Analizando problemas de Storage...');
      
      // Obtener todos los productos
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener todas las categorías
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const problematicProducts = [];
      const problematicCategories = [];

      // Analizar productos
      products.forEach(product => {
        if (product.image && isProblematicUrl(product.image)) {
          problematicProducts.push({
            id: product.id,
            name: product.name,
            url: product.image,
            issue: product.image.includes('?name=') ? 'URL con ?name=' : 'URL sin token'
          });
        }
      });

      // Analizar categorías
      categories.forEach(category => {
        if (category.image && isProblematicUrl(category.image)) {
          problematicCategories.push({
            id: category.id,
            name: category.name,
            url: category.image,
            issue: category.image.includes('?name=') ? 'URL con ?name=' : 'URL sin token'
          });
        }
      });

      setDiagnosticResults({
        totalProducts: products.length,
        totalCategories: categories.length,
        problematicProducts,
        problematicCategories,
        totalProblematic: problematicProducts.length + problematicCategories.length
      });

      console.log(`🔍 [Diagnóstico] Encontrados ${problematicProducts.length + problematicCategories.length} elementos problemáticos`);

    } catch (error) {
      console.error('❌ [Diagnóstico] Error:', error);
      setDiagnosticResults({
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanProblematicReferences = async () => {
    if (!diagnosticResults || diagnosticResults.totalProblematic === 0) {
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      console.log('🧹 [Limpieza] Limpiando solo referencias problemáticas...');
      
      let cleanedCount = 0;
      const cleanedItems = [];
      const errors = [];

      // Limpiar productos problemáticos
      for (const product of diagnosticResults.problematicProducts) {
        try {
          console.log(`🧹 [Limpieza] Limpiando producto: ${product.name}`);
          
          await updateDoc(doc(db, 'products', product.id), {
            image: null
          });
          
          cleanedCount++;
          cleanedItems.push(`Producto: ${product.name}`);
        } catch (error) {
          console.warn(`⚠️ [Limpieza] Error en producto ${product.name}:`, error.message);
          errors.push(`Producto ${product.name}: ${error.message}`);
        }
      }

      // Limpiar categorías problemáticas
      for (const category of diagnosticResults.problematicCategories) {
        try {
          console.log(`🧹 [Limpieza] Limpiando categoría: ${category.name}`);
          
          await updateDoc(doc(db, 'categories', category.id), {
            image: null
          });
          
          cleanedCount++;
          cleanedItems.push(`Categoría: ${category.name}`);
        } catch (error) {
          console.warn(`⚠️ [Limpieza] Error en categoría ${category.name}:`, error.message);
          errors.push(`Categoría ${category.name}: ${error.message}`);
        }
      }

      setResults({
        success: true,
        cleanedCount,
        cleanedItems,
        errors,
        totalProblematic: diagnosticResults.totalProblematic
      });

      console.log(`✅ [Limpieza] Completada. ${cleanedCount} elementos limpiados.`);

    } catch (error) {
      console.error('❌ [Limpieza] Error general:', error);
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Trash2 className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Limpieza Inteligente de Storage</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Search className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Limpieza Selectiva</h4>
            <p className="text-blue-700 text-sm mb-2">
              Esta herramienta identifica y limpia solo las referencias problemáticas que causan errores 404 y CORS.
            </p>
            <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
              <li>Detecta URLs con formato incorrecto (?name=)</li>
              <li>Identifica URLs sin token de acceso</li>
              <li>Limpia solo las referencias problemáticas</li>
              <li>Mantiene las imágenes que funcionan correctamente</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Botón de diagnóstico */}
        <button
          onClick={diagnoseStorageIssues}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              Analizando...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Diagnosticar Problemas de Storage
            </>
          )}
        </button>

        {/* Resultados del diagnóstico */}
        {diagnosticResults && !diagnosticResults.error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">📊 Resultados del Diagnóstico</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Productos totales:</strong> {diagnosticResults.totalProducts}</p>
                <p><strong>Categorías totales:</strong> {diagnosticResults.totalCategories}</p>
              </div>
              <div>
                <p><strong>Productos problemáticos:</strong> {diagnosticResults.problematicProducts.length}</p>
                <p><strong>Categorías problemáticas:</strong> {diagnosticResults.problematicCategories.length}</p>
              </div>
            </div>
            
            {diagnosticResults.totalProblematic > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-red-600 mb-2">
                  🚨 {diagnosticResults.totalProblematic} elementos con problemas encontrados
                </p>
                
                {/* Botón de limpieza */}
                <button
                  onClick={cleanProblematicReferences}
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center mt-3"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Limpiar Solo Referencias Problemáticas
                    </>
                  )}
                </button>
              </div>
            )}
            
            {diagnosticResults.totalProblematic === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">
                  ✅ No se encontraron problemas de Storage
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resultados de la limpieza */}
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
                      <p><strong>Referencias problemáticas encontradas:</strong> {results.totalProblematic}</p>
                      <p><strong>Referencias limpiadas exitosamente:</strong> {results.cleanedCount}</p>
                      
                      {results.cleanedItems.length > 0 && (
                        <div>
                          <p><strong>Elementos limpiados:</strong></p>
                          <ul className="list-disc list-inside ml-4 max-h-32 overflow-y-auto">
                            {results.cleanedItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {results.errors.length > 0 && (
                        <div>
                          <p><strong>Errores encontrados:</strong></p>
                          <ul className="list-disc list-inside ml-4 text-orange-600 max-h-32 overflow-y-auto">
                            {results.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="font-semibold mt-3">
                        🎉 Los errores 404 y CORS deberían estar solucionados.
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

        {diagnosticResults && diagnosticResults.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">❌ Error en el Diagnóstico</h4>
                <p className="text-red-700 text-sm">{diagnosticResults.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageCleanup;
