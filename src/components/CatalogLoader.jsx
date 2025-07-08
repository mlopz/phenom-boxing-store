import React, { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import catalogData from '../../catalogo-real.json';

const CatalogLoader = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearCollection = async (collectionName) => {
    addLog(`🗑️ Limpiando colección ${collectionName}...`);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, collectionName, docSnapshot.id))
      );
      await Promise.all(deletePromises);
      addLog(`✅ Colección ${collectionName} limpiada (${querySnapshot.docs.length} documentos eliminados)`, 'success');
    } catch (error) {
      addLog(`❌ Error limpiando ${collectionName}: ${error.message}`, 'error');
      throw error;
    }
  };

  const addCategories = async () => {
    addLog('📂 Agregando categorías...');
    let successCount = 0;
    
    for (const category of catalogData.categories) {
      try {
        await addDoc(collection(db, 'categories'), category);
        addLog(`✅ Categoría agregada: ${category.name}`, 'success');
        successCount++;
      } catch (error) {
        addLog(`❌ Error agregando categoría ${category.name}: ${error.message}`, 'error');
      }
    }
    
    addLog(`📂 ${successCount}/${catalogData.categories.length} categorías agregadas exitosamente`, 'success');
  };

  const addProducts = async () => {
    addLog('🛍️ Agregando productos...');
    let successCount = 0;
    
    for (const product of catalogData.products) {
      try {
        await addDoc(collection(db, 'products'), product);
        addLog(`✅ Producto agregado: ${product.name}`, 'success');
        successCount++;
      } catch (error) {
        addLog(`❌ Error agregando producto ${product.name}: ${error.message}`, 'error');
      }
    }
    
    addLog(`🛍️ ${successCount}/${catalogData.products.length} productos agregados exitosamente`, 'success');
  };

  const loadCatalog = async () => {
    setLoading(true);
    setLogs([]);
    setStatus('Iniciando carga del catálogo...');
    
    try {
      addLog('🚀 Iniciando actualización del catálogo de Phenom...', 'info');
      addLog('=' * 60);
      
      // Limpiar datos existentes
      await clearCollection('categories');
      await clearCollection('products');
      
      // Agregar nuevos datos
      await addCategories();
      await addProducts();
      
      addLog('=' * 60);
      addLog('🎉 ¡Catálogo actualizado exitosamente!', 'success');
      addLog(`📂 ${catalogData.categories.length} categorías cargadas`, 'success');
      addLog(`🛍️ ${catalogData.products.length} productos cargados`, 'success');
      
      setStatus('✅ Catálogo cargado exitosamente');
      
    } catch (error) {
      addLog(`❌ Error crítico: ${error.message}`, 'error');
      setStatus('❌ Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-phenom-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-phenom-red mb-4">
            🚀 Cargador de Catálogo Phenom
          </h1>
          <p className="text-gray-300 mb-6">
            Herramienta para cargar automáticamente el catálogo real en Firebase
          </p>
          
          <div className="bg-phenom-dark p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">📦 Datos a Cargar:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-phenom-red font-semibold">Categorías:</span> {catalogData.categories.length}
                <ul className="text-gray-400 mt-1">
                  {catalogData.categories.map(cat => (
                    <li key={cat.id}>• {cat.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-phenom-red font-semibold">Productos:</span> {catalogData.products.length}
                <div className="text-gray-400 mt-1">
                  <div>• Boxeo: {catalogData.products.filter(p => p.category === 'boxeo').length}</div>
                  <div>• Taekwondo: {catalogData.products.filter(p => p.category === 'taekwondo').length}</div>
                  <div>• Terapia: {catalogData.products.filter(p => p.category === 'terapia-sonido').length}</div>
                  <div>• Recuperación: {catalogData.products.filter(p => p.category === 'recuperacion').length}</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={loadCatalog}
            disabled={loading}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-red hover:scale-105 pulse-glow'
            }`}
          >
            {loading ? '⏳ Cargando...' : '🚀 CARGAR CATÁLOGO COMPLETO'}
          </button>
          
          {status && (
            <div className="mt-4 p-3 rounded-lg bg-phenom-dark">
              <p className="font-semibold">{status}</p>
            </div>
          )}
        </div>

        {/* Logs en tiempo real */}
        {logs.length > 0 && (
          <div className="bg-black rounded-lg p-4 border border-phenom-red">
            <h3 className="text-lg font-semibold mb-4 text-phenom-red">📋 Log de Actividad:</h3>
            <div className="max-h-96 overflow-y-auto space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className={`${getLogColor(log.type)}`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 bg-phenom-dark p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-phenom-red">📋 Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Haz clic en "CARGAR CATÁLOGO COMPLETO" para iniciar el proceso</li>
            <li>El sistema eliminará todos los productos y categorías existentes</li>
            <li>Cargará automáticamente las 4 categorías nuevas</li>
            <li>Cargará automáticamente los 13 productos del catálogo real</li>
            <li>Una vez completado, regresa a la tienda principal</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
            <p className="text-yellow-300">
              ⚠️ <strong>Advertencia:</strong> Esta operación eliminará todos los datos existentes y los reemplazará con el catálogo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogLoader;
