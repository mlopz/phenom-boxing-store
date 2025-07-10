import React, { useState, useEffect } from 'react';
import { Shield, Package, LayoutGrid, Download, Eye, Save, Plus, Edit, Trash2, ArrowLeft, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import StorageCleanup from './StorageCleanup';

import { getProducts, getCategories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory } from '../services/firebase';

const AdminPanel = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Contraseña simple para acceso al panel
  const ADMIN_PASSWORD = 'phenom2024';

  // Cargar datos desde Firebase al inicializar
  useEffect(() => {
    if (isAuthenticated) {
      loadDataFromFirebase();
    }
  }, [isAuthenticated]);

  // Función para cargar datos desde Firebase
  const loadDataFromFirebase = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      showNotification(`Datos cargados: ${productsData?.length || 0} productos, ${categoriesData?.length || 0} categorías`, 'success');
    } catch (error) {
      console.error('Error cargando datos desde Firebase:', error);
      showNotification('Error al cargar datos desde Firebase: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };



  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    onBack();
  };

  // Funciones para gestión de productos
  const handleAddProduct = () => {
    const newProduct = {
      name: '',
      category: categories[0]?.id || '',
      price: 0,
      image: '',
      description: '',
      features: [],
      inStock: true
    };
    setEditingProduct(newProduct);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  /**
   * Maneja el guardado de un producto, ya sea nuevo o existente
   * @param {Object} product - Datos del producto a guardar
   */
  const handleSaveProduct = async (product) => {
    console.log('🔍 [DEBUG] Iniciando guardado de producto');
    console.log('📦 [Producto] Datos recibidos:', {
      id: product.id || 'nuevo',
      nombre: product.name,
      tieneImagen: !!product.image,
      numImagenes: product.images?.length || 0
    });
    
    setLoading(true);
    
    try {
      // 1. Validar datos básicos del producto
      if (!product.name || !product.category) {
        throw new Error('El nombre y la categoría son campos requeridos');
      }
      
      // 2. Procesar el producto según si es nuevo o existente
      if (product.id) {
        console.log('🔄 [Producto] Actualizando producto existente con ID:', product.id);
        
        // 2.1. Actualizar producto existente
        await updateProduct(product.id, product);
        
        // 2.2. Actualizar estado local
        const updatedProducts = products.map(p => 
          p.id === product.id ? product : p
        );
        
        setProducts(updatedProducts);
        showNotification('✅ Producto actualizado correctamente', 'success');
        console.log('✅ [Producto] Producto actualizado con éxito');
        
      } else {
        console.log('🆕 [Producto] Creando nuevo producto...');
        
        // 2.1. Crear nuevo producto
        const newProductId = await addProduct(product);
        console.log('🔑 [Producto] Nuevo ID generado:', newProductId);
        
        // 2.2. Actualizar estado local con el nuevo ID
        const newProduct = { ...product, id: newProductId };
        setProducts(prevProducts => [...prevProducts, newProduct]);
        
        showNotification('✅ Producto creado correctamente', 'success');
        console.log('✅ [Producto] Producto creado con éxito');
      }
      
      // 3. Cerrar el formulario de edición
      setEditingProduct(null);
      
    } catch (error) {
      console.error('❌ [ERROR] Error en handleSaveProduct:', error);
      
      // 4. Manejar errores específicos
      let errorMessage = 'Error al guardar el producto';
      
      if (error.message.includes('permission-denied')) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.message.includes('network-request-failed')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  // Estado para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const handleDeleteProduct = (e, productId) => {
    // Prevenir propagación del evento
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔍 [DEBUG] handleDeleteProduct ejecutado');
    console.log('🔍 [DEBUG] productId recibido:', productId);
    
    // Encontrar el producto para mostrar su nombre
    const product = products.find(p => p.id === productId);
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (productToDelete) {
      console.log('🔍 [DEBUG] Usuario confirmó eliminación');
      await executeDelete(productToDelete.id);
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };
  
  const cancelDelete = () => {
    console.log('🔍 [DEBUG] Usuario canceló eliminación');
    setShowDeleteModal(false);
    setProductToDelete(null);
  };
  
  /**
   * Ejecuta la eliminación de un producto y sus imágenes asociadas
   * @param {string} productId - ID del producto a eliminar
   */
  const executeDelete = async (productId) => {
    setLoading(true);
    
    try {
      console.log('🔍 [Firebase] Iniciando proceso de eliminación para producto ID:', productId);
      
      // 1. Buscar el producto en el estado local para mostrar información detallada
      const productToDelete = products.find(p => p.id === productId);
      
      if (!productToDelete) {
        throw new Error('El producto no se encontró en la lista local');
      }
      
      const productName = productToDelete.name || 'Producto sin nombre';
      const imageCount = [
        productToDelete.image,
        ...(productToDelete.images || [])
      ].filter(Boolean).length;
      
      console.log(`🗑️ [Firebase] Eliminando producto: "${productName}" (ID: ${productId})`);
      console.log(`📊 [Firebase] Detalles: ${imageCount} imagen(es) a eliminar`);
      
      // 2. Mostrar confirmación al usuario
      const confirmMessage = `¿Estás seguro de que deseas eliminar "${productName}"?\n\n` +
        `Se eliminarán ${imageCount} imagen(es) asociadas.\n\n` +
        `Esta acción no se puede deshacer.`;
      
      if (!window.confirm(confirmMessage)) {
        console.log('❌ [Firebase] Eliminación cancelada por el usuario');
        return;
      }
      
      // 3. Llamar a la función deleteProduct que gestiona la eliminación en Firestore y Storage
      console.log('🔄 [Firebase] Iniciando eliminación del producto y sus imágenes...');
      const startTime = Date.now();
      
      const result = await deleteProduct(productId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (result && result.success) {
        // 4. Actualizar el estado local solo si la eliminación fue exitosa
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        
        console.log(`✅ [Firebase] Producto e imágenes eliminados correctamente en ${elapsedTime}s`);
        console.log(`📊 [Firebase] Imágenes eliminadas: ${result.deletedImages}`);
        
        showNotification(
          `"${productName}" eliminado correctamente (${result.deletedImages} imágenes)`, 
          'success'
        );
      } else {
        throw new Error(result?.error || 'No se pudo completar la eliminación');
      }
      
    } catch (error) {
      console.error('❌ [Firebase] Error en executeDelete:', error);
      
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error al eliminar el producto';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para eliminar productos';
      } else if (error.code === 'not-found' || error.message.includes('no existe')) {
        errorMessage = 'El producto no existe o ya ha sido eliminado';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para gestión de categorías
  const handleAddCategory = () => {
    const newCategory = {
      name: '',
      order: categories.length + 1
    };
    setEditingCategory(newCategory);
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async (category) => {
    setLoading(true);
    try {
      // Verificar si la categoría ya existe en la lista actual (edición)
      const existingCategory = categories.find(c => c.id === category.id);
      
      if (existingCategory) {
        // Editar categoría existente
        console.log('🔄 [Admin] Editando categoría existente:', category.id);
        await updateCategory(category.id, category);
        const updatedCategories = categories.map(c => c.id === category.id ? category : c);
        setCategories(updatedCategories);
        showNotification('Categoría actualizada correctamente', 'success');
      } else {
        // Agregar nueva categoría (usar el ID personalizado del formulario)
        console.log('➕ [Admin] Creando nueva categoría:', category.id);
        
        // Para nuevas categorías, usar el ID personalizado del formulario
        const categoryData = {
          id: category.id,
          name: category.name,
          description: category.description
        };
        
        await addCategory(categoryData);
        const newCategory = { ...categoryData };
        setCategories([...categories, newCategory]);
        showNotification('Categoría agregada correctamente', 'success');
      }
      setEditingCategory(null);
    } catch (error) {
      console.error('Error guardando categoría:', error);
      showNotification('Error al guardar categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    // Verificar cuántos productos tienen esta categoría
    const affectedProducts = products.filter(p => p.category === categoryId);
    const confirmMessage = affectedProducts.length > 0 
      ? `¿Estás seguro de que quieres eliminar esta categoría?\n\n${affectedProducts.length} producto(s) quedarán como "Sin categoría".`
      : '¿Estás seguro de que quieres eliminar esta categoría?';
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        // Eliminar la categoría de Firebase
        await deleteCategory(categoryId);
        
        // Actualizar productos afectados a "Sin categoría"
        const updatedProducts = [...products];
        let productsUpdated = 0;
        
        for (let product of affectedProducts) {
          const updatedProduct = { ...product, category: 'sin-categoria' };
          await updateProduct(product.id, updatedProduct);
          
          // Actualizar en el estado local
          const index = updatedProducts.findIndex(p => p.id === product.id);
          if (index !== -1) {
            updatedProducts[index] = updatedProduct;
            productsUpdated++;
          }
        }
        
        // Actualizar estados
        setProducts(updatedProducts);
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        setCategories(updatedCategories);
        
        // Mostrar notificación con detalles
        const message = productsUpdated > 0 
          ? `Categoría eliminada. ${productsUpdated} producto(s) movidos a "Sin categoría".`
          : 'Categoría eliminada correctamente';
        showNotification(message, 'success');
        
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        showNotification('Error al eliminar categoría: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para recargar datos desde Firebase
  const handleRefreshData = () => {
    if (window.confirm('¿Quieres recargar los datos desde Firebase? Esto actualizará la información mostrada.')) {
      loadDataFromFirebase();
    }
  };

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="bg-phenom-black rounded-lg p-8 border border-gray-700 max-w-md w-full">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-phenom-red mx-auto mb-4" />
            <h1 className="aggressive-text text-2xl text-white mb-2">
              PANEL DE <span className="text-phenom-red">ADMINISTRACIÓN</span>
            </h1>
            <p className="text-gray-400">Ingresa la contraseña para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-phenom-red"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-red text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              ACCEDER
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              VOLVER A LA TIENDA
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header del panel */}
      <div className="bg-phenom-black border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver a la tienda</span>
              </button>
              <h1 className="aggressive-text text-xl text-white">
                PANEL DE <span className="text-phenom-red">ADMINISTRACIÓN</span>
              </h1>
              {loading && (
                <div className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-1">
                  <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                  <span className="text-blue-300 text-sm font-medium">Cargando desde Firebase...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Recargar desde Firebase</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Navegación de pestañas */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-phenom-red text-phenom-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-phenom-red text-phenom-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-phenom-red text-phenom-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'storage'
                  ? 'border-phenom-red text-phenom-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🔧 Storage
            </button>

          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab products={products} categories={categories} />
        )}
        
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            categories={categories}
            onAdd={handleAddProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            editingProduct={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setEditingProduct(null)}
            showNotification={showNotification}
          />
        )}
        
        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            editingCategory={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setEditingCategory(null)}
          />
        )}
        
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reparación de Storage</h2>
              <p className="text-gray-600 mb-6">
                Diagnostica y repara problemas con las imágenes de Firebase Storage de forma inteligente.
              </p>
            </div>
            
            <StorageCleanup />
          </div>
        )}
        
      </div>
      
      {/* Modal de confirmación para eliminar producto */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-phenom-black border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">⚠</span>
              </div>
              <h3 className="text-white text-lg font-bold">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-300 mb-2">
              ¿Estás seguro de que quieres eliminar este producto?
            </p>
            
            {productToDelete && (
              <div className="bg-gray-800 rounded p-3 mb-4">
                <p className="text-white font-semibold">{productToDelete.name}</p>
                <p className="text-gray-400 text-sm">{productToDelete.category}</p>
              </div>
            )}
            
            <p className="text-red-400 text-sm mb-6">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Dashboard
const DashboardTab = ({ products, categories }) => {
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  const totalCategories = categories.length;

  return (
    <div className="space-y-8">
      <h2 className="aggressive-text text-3xl text-white mb-6">
        DASHBOARD DE <span className="text-phenom-red">ADMINISTRACIÓN</span>
      </h2>
      
      {/* Corrector de Imágenes Firebase */}
      <ImageFixer />
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-phenom-red" />
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Productos</p>
              <p className="text-white text-2xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">En Stock</p>
              <p className="text-white text-2xl font-bold">{inStockProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✗</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Agotados</p>
              <p className="text-white text-2xl font-bold">{outOfStockProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <LayoutGrid className="h-8 w-8 text-phenom-red" />
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Categorías</p>
              <p className="text-white text-2xl font-bold">{totalCategories}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Productos por categoría */}
      <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-xl font-bold mb-4">Productos por Categoría</h3>
        <div className="space-y-3">
          {categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category.id);
            return (
              <div key={category.id} className="flex justify-between items-center">
                <span className="text-gray-300">{category.name}</span>
                <span className="text-phenom-red font-bold">{categoryProducts.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
