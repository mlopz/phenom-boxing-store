import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { fixFirebaseImages, reloadCatalogFromScratch } from '../utils/fixFirebaseImages.js';

const ImageFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFixImages = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      const fixResult = await fixFirebaseImages();
      setResult(fixResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleReloadCatalog = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      const reloadResult = await reloadCatalogFromScratch();
      setResult(reloadResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">
          🔧 Corrector de Imágenes Firebase
        </h3>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Problema detectado:</strong> Las imágenes están usando URLs del emulador local 
          (<code>127.0.0.1:9199</code>) en lugar de Firebase Storage real.
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          Esto causa errores HTTPS en producción. Usa las herramientas de abajo para solucionarlo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={handleFixImages}
          disabled={isFixing}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFixing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isFixing ? 'Corrigiendo...' : 'Corregir URLs de Imágenes'}
        </button>

        <button
          onClick={handleReloadCatalog}
          disabled={isFixing}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFixing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isFixing ? 'Recargando...' : 'Recargar Catálogo Completo'}
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-4 ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h4 className={`font-semibold ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Proceso Completado' : '❌ Error en el Proceso'}
            </h4>
          </div>
          
          {result.success ? (
            <div className="text-sm text-green-700">
              {result.fixed !== undefined && (
                <p>🔧 Imágenes corregidas: <strong>{result.fixed}</strong></p>
              )}
              {result.errors !== undefined && result.errors > 0 && (
                <p>⚠️ Errores encontrados: <strong>{result.errors}</strong></p>
              )}
              {result.message && (
                <p>📋 {result.message}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <p>❌ Error: {result.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          💡 <strong>Tip:</strong> Después de corregir las imágenes, recarga la página para ver los cambios.
        </p>
      </div>
    </div>
  );
};

export default ImageFixer;
