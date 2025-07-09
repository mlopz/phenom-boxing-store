import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Search } from 'lucide-react';
import { fixAllImageUrls, scanProblematicImages } from '../utils/directImageFix.js';
import { reloadCatalogFromScratch } from '../utils/fixFirebaseImages.js';

const ImageFixer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [fixResult, setFixResult] = useState(null);

  const handleScanImages = async () => {
    setIsScanning(true);
    setScanResult(null);
    setFixResult(null);
    
    try {
      const result = await scanProblematicImages();
      setScanResult(result);
    } catch (error) {
      setScanResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFixImages = async () => {
    setIsFixing(true);
    setFixResult(null);
    
    try {
      const result = await fixAllImageUrls();
      setFixResult(result);
      // Actualizar el escaneo después de corregir
      if (result.success) {
        setTimeout(() => handleScanImages(), 1000);
      }
    } catch (error) {
      setFixResult({
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
          <strong>⚠️ Problema detectado:</strong> Las imágenes están usando URLs malformadas 
          (<code>?name=</code>) o del emulador local (<code>127.0.0.1:9199</code>).
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          Esto causa errores 404 en producción. Usa las herramientas de abajo para solucionarlo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button
          onClick={handleScanImages}
          disabled={isScanning || isFixing}
          className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isScanning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isScanning ? 'Escaneando...' : 'Escanear Productos'}
        </button>
        
        <button
          onClick={handleFixImages}
          disabled={isFixing || isScanning}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFixing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isFixing ? 'Corrigiendo...' : 'Corregir Todas las Imágenes'}
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

      {/* Resultados del Escaneo */}
      {scanResult && (
        <div className={`rounded-lg p-4 mb-4 ${
          scanResult.success 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {scanResult.success ? (
              <Search className="w-5 h-5 text-blue-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h4 className={`font-semibold ${
              scanResult.success ? 'text-blue-800' : 'text-red-800'
            }`}>
              {scanResult.success ? '🔍 Escaneo Completado' : '❌ Error en el Escaneo'}
            </h4>
          </div>
          
          {scanResult.success ? (
            <div className="text-sm text-blue-700">
              <p>📦 Total de productos: <strong>{scanResult.total}</strong></p>
              <p>⚠️ Productos con URLs problemáticas: <strong>{scanResult.problematic}</strong></p>
              {scanResult.products && scanResult.products.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold mb-1">Productos afectados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {scanResult.products.slice(0, 5).map((product, index) => (
                      <li key={index} className="text-xs">
                        <strong>{product.name}</strong> - URL problemática detectada
                      </li>
                    ))}
                    {scanResult.products.length > 5 && (
                      <li className="text-xs italic">... y {scanResult.products.length - 5} más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <p>❌ Error: {scanResult.error}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Resultados de la Corrección */}
      {fixResult && (
        <div className={`rounded-lg p-4 mb-4 ${
          fixResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {fixResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h4 className={`font-semibold ${
              fixResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {fixResult.success ? '✅ Corrección Completada' : '❌ Error en la Corrección'}
            </h4>
          </div>
          
          {fixResult.success ? (
            <div className="text-sm text-green-700">
              <p>🔧 Imágenes corregidas: <strong>{fixResult.fixed}</strong></p>
              {fixResult.errors > 0 && (
                <p>⚠️ Errores encontrados: <strong>{fixResult.errors}</strong></p>
              )}
              <p className="mt-2 font-semibold text-green-800">
                🎉 ¡Proceso completado! Recarga la página para ver los cambios.
              </p>
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <p>❌ Error: {fixResult.error}</p>
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
