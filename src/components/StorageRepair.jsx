import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { repairStorageUrls, quickRepair } from '../utils/repairStorageUrls.js';

const StorageRepair = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleQuickRepair = async () => {
    setIsRepairing(true);
    setRepairResult(null);
    
    try {
      console.log('🔧 Iniciando reparación rápida de URLs...');
      const success = await quickRepair();
      
      setRepairResult({
        success,
        message: success 
          ? 'Reparación completada exitosamente' 
          : 'Algunas URLs no pudieron ser reparadas'
      });
    } catch (error) {
      console.error('❌ Error en la reparación:', error);
      setRepairResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleDetailedRepair = async () => {
    setIsRepairing(true);
    setRepairResult(null);
    setShowDetails(true);
    
    try {
      console.log('🔍 Iniciando diagnóstico detallado...');
      const result = await repairStorageUrls();
      
      setRepairResult({
        success: result.success,
        message: `Diagnóstico completado: ${result.totalFixed}/${result.totalProblems} URLs reparadas`,
        details: result
      });
    } catch (error) {
      console.error('❌ Error en el diagnóstico:', error);
      setRepairResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">
          Reparación de URLs de Storage
        </h3>
      </div>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>¿Problemas con imágenes?</strong> Esta herramienta diagnostica y repara 
          URLs de Firebase Storage que no cargan correctamente (errores 404 o CORS).
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleQuickRepair}
          disabled={isRepairing}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRepairing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isRepairing ? 'Reparando...' : 'Reparación Rápida'}
        </button>

        <button
          onClick={handleDetailedRepair}
          disabled={isRepairing}
          className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRepairing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {isRepairing ? 'Diagnosticando...' : 'Diagnóstico Detallado'}
        </button>
      </div>

      {repairResult && (
        <div className={`mt-4 p-4 rounded-lg border ${
          repairResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {repairResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              repairResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {repairResult.message}
            </span>
          </div>
          
          {showDetails && repairResult.details && (
            <div className="text-sm text-gray-600 mt-2">
              <p>• Problemas encontrados: {repairResult.details.totalProblems}</p>
              <p>• URLs reparadas: {repairResult.details.totalFixed}</p>
              <p>• URLs no reparables: {repairResult.details.totalProblems - repairResult.details.totalFixed}</p>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            💡 <strong>Tip:</strong> Revisa la consola del navegador para ver detalles del proceso.
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">¿Cuándo usar esta herramienta?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Las imágenes no cargan en la tienda</li>
          <li>• Ves errores 404 en la consola del navegador</li>
          <li>• Errores CORS al acceder a Firebase Storage</li>
          <li>• Después de cambios en las reglas de Firebase</li>
        </ul>
      </div>
    </div>
  );
};

export default StorageRepair;
