import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Package, Eye, Upload, Image } from 'lucide-react';
import { uploadImageToStorage, storage } from '../services/firebase';
import { ref, deleteObject } from 'firebase/storage';
import { debugFirebaseConfig, testStorageConnection } from '../utils/firebaseDebug';

const ProductsTab = ({ 
  products, 
  categories, 
  onAdd, 
  onEdit, 
  onDelete, 
  editingProduct, 
  onSave, 
  onCancel,
  showNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Debug de Firebase al cargar el componente
  useEffect(() => {
    console.log('🔧 [ProductsTab] Ejecutando diagnóstico de Firebase...');
    const configOk = debugFirebaseConfig();
    
    if (configOk) {
      // Solo probar Storage si la configuración está bien
      testStorageConnection().then(storageOk => {
        if (storageOk) {
          console.log('✅ [ProductsTab] Firebase Storage está funcionando correctamente');
        } else {
          console.error('❌ [ProductsTab] Hay problemas con Firebase Storage');
        }
      });
    }
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (editingProduct) {
    return (
      <ProductForm
        product={editingProduct}
        categories={categories}
        onSave={onSave}
        onCancel={onCancel}
        showNotification={showNotification}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="aggressive-text text-3xl text-white">
          GESTIÓN DE <span className="text-phenom-red">PRODUCTOS</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>AGREGAR PRODUCTO</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-phenom-black rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Buscar productos
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-phenom-red"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Filtrar por categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-phenom-red"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            onEdit={() => onEdit(product)}
            onDelete={(e) => onDelete(e, product.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, categories, onEdit, onDelete }) => {
  const category = categories.find(c => c.id === product.category);

  return (
    <div className="bg-phenom-black rounded-lg border border-gray-700 overflow-hidden">
      <div className="aspect-square bg-gray-800 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            product.inStock 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {product.inStock ? 'En Stock' : 'Agotado'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
          <p className="text-gray-400 text-sm">{category?.name}</p>
        </div>
        
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-phenom-red font-bold text-xl">
            ${product.price}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductForm = ({ product, categories, onSave, onCancel, showNotification }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    category: product.category || categories[0]?.id || '',
    price: product.price || 0,
    images: product.images || [product.image || ''].filter(Boolean), // Soporte para múltiples imágenes
    description: product.description || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : '',
    sizes: product.sizes || [],
    sizeStock: product.sizeStock || {},
    inStock: product.inStock !== undefined ? product.inStock : true
  });
  
  // Estado para agregar talles
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSizeValue, setNewSizeValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mostrar indicador de carga
      showNotification('Guardando producto...', 'info');
      
      console.log('🔍 [DEBUG] handleSubmit ejecutado');
      console.log('🔍 [DEBUG] product.id:', product.id);
      console.log('🔍 [DEBUG] formData.images:', formData.images);
      
      // Procesar imágenes: subir las que sean nuevas (data URLs)
      const processedImages = [];
      
      for (const img of formData.images) {
        if (img.startsWith('data:image')) {
          // Es una imagen nueva, subir a Firebase Storage
          console.log('🔼 [Storage] Subiendo nueva imagen...');
          const imageUrl = await uploadImageToStorage(img, `product_${Date.now()}.jpg`);
          processedImages.push(imageUrl);
        } else {
          // Es una URL existente, mantenerla
          processedImages.push(img);
        }
      }
      
      // Crear objeto de producto con las URLs procesadas
      const productData = {
        ...formData,
        id: product.id, // ✅ CRÍTICO: Preservar el ID para edición
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        image: processedImages[0] || '', // Mantener compatibilidad con imagen principal
        images: processedImages // Usar las URLs procesadas
      };
      
      console.log('✅ [DEBUG] Producto procesado para guardar:', productData);
      
      // Llamar a la función onSave con los datos procesados
      onSave(productData);
      
    } catch (error) {
      console.error('❌ [ERROR] Error en handleSubmit:', error);
      showNotification('Error al guardar el producto: ' + error.message, 'error');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validar límite de imágenes
      if (formData.images.length >= 10) {
        alert('Máximo 10 imágenes por producto.');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      // Mostrar indicador de carga
      showNotification('Subiendo imagen...', 'info');
      
      // Leer el archivo como DataURL
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Subir la imagen a Firebase Storage
          const imageUrl = await uploadImageToStorage(event.target.result, `products/${Date.now()}_${file.name}`);
          
          // Agregar la URL de la imagen al estado
          const newImages = [...formData.images, imageUrl];
          handleChange('images', newImages);
          
          showNotification('Imagen subida correctamente', 'success');
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          showNotification('Error al subir la imagen', 'error');
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error en handleImageUpload:', error);
      showNotification('Error al procesar la imagen', 'error');
    } finally {
      // Limpiar el input para permitir seleccionar la misma imagen de nuevo
      e.target.value = '';
    }
  };

  // Función para extraer el path de la imagen de una URL de Firebase Storage
  const extractImagePath = (url) => {
    try {
      // Ejemplo de URL: https://firebasestorage.googleapis.com/v0/b/tu-proyecto.appspot.com/o/products%2F12345_image.jpg?alt=media&token=xyz
      if (!url) return null;
      
      // Extraer la parte después de /o/ y antes de ?
      const urlParts = url.split('/o/');
      if (urlParts.length < 2) return null;
      
      const pathPart = urlParts[1].split('?')[0];
      const decodedPath = decodeURIComponent(pathPart);
      
      console.log('🔍 [Storage] Ruta extraída:', decodedPath);
      return decodedPath;
    } catch (error) {
      console.error('❌ [Storage] Error extrayendo ruta de la imagen:', error);
      return null;
    }
  };

  const removeImage = async (indexToRemove) => {
    try {
      const imageUrl = formData.images[indexToRemove];
      
      if (!imageUrl) {
        console.warn('❌ [Storage] No hay URL de imagen para eliminar');
        return;
      }
      
      console.log('🔍 [Storage] Iniciando eliminación de imagen:', imageUrl);
      
      // Verificar si la imagen está en Firebase Storage
      if (imageUrl.includes('firebasestorage')) {
        showNotification('Eliminando imagen del almacenamiento...', 'info');
        
        try {
          // Extraer el path de la imagen
          const imagePath = extractImagePath(imageUrl);
          
          if (imagePath) {
            console.log('🗑️ [Storage] Eliminando imagen del storage:', imagePath);
            const imageRef = ref(storage, imagePath);
            
            // Verificar si la referencia es válida
            if (!imageRef) {
              throw new Error('No se pudo crear la referencia a la imagen');
            }
            
            // Eliminar el archivo de Storage
            await deleteObject(imageRef);
            console.log('✅ [Storage] Imagen eliminada correctamente');
            showNotification('Imagen eliminada del almacenamiento', 'success');
          } else {
            console.warn('⚠️ [Storage] No se pudo extraer la ruta de la imagen');
            showNotification('No se pudo procesar la URL de la imagen', 'warning');
          }
        } catch (storageError) {
          console.error('❌ [Storage] Error eliminando imagen:', storageError);
          
          // Si el error es porque el archivo ya no existe, continuar de todos modos
          if (storageError.code === 'storage/object-not-found') {
            console.log('ℹ️ [Storage] La imagen ya no existe en el almacenamiento');
            showNotification('La imagen ya había sido eliminada', 'info');
          } else {
            // Para otros errores, mostrar advertencia pero continuar
            showNotification('No se pudo eliminar la imagen del almacenamiento', 'warning');
          }
        }
      } else {
        console.log('ℹ️ [Storage] La imagen no está en Firebase Storage, solo se eliminará localmente');
      }
      
      // Actualizar el estado local en cualquier caso
      const newImages = formData.images.filter((_, index) => index !== indexToRemove);
      console.log('🔄 [UI] Actualizando estado local con imágenes:', newImages.length);
      handleChange('images', newImages);
      
    } catch (error) {
      console.error('❌ [ERROR] Error en removeImage:', error);
      showNotification('Error al eliminar la imagen: ' + error.message, 'error');
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    handleChange('images', newImages);
  };

  const addSize = () => {
    setShowAddSize(true);
    setNewSizeValue('');
  };
  
  const handleAddSizeSubmit = () => {
    if (newSizeValue && newSizeValue.trim()) {
      const trimmedSize = newSizeValue.trim();
      if (!formData.sizes.includes(trimmedSize)) {
        const newSizes = [...formData.sizes, trimmedSize];
        handleChange('sizes', newSizes);
        
        // Inicializar stock para el nuevo talle
        initializeSizeStock(trimmedSize);
        
        console.log('Talle agregado:', trimmedSize, 'Lista actual:', newSizes);
        
        // Mostrar notificación de éxito
        if (showNotification) {
          showNotification(`Talle "${trimmedSize}" agregado correctamente`, 'success');
        }
        
        // Limpiar y cerrar
        setNewSizeValue('');
        setShowAddSize(false);
      } else {
        // Mostrar notificación de error
        if (showNotification) {
          showNotification('Este talle ya existe', 'error');
        }
      }
    }
  };
  
  const handleCancelAddSize = () => {
    setShowAddSize(false);
    setNewSizeValue('');
  };

  const removeSize = (sizeToRemove) => {
    const newSizes = formData.sizes.filter(size => size !== sizeToRemove);
    handleChange('sizes', newSizes);
    
    // También eliminar el stock de ese talle
    const newSizeStock = { ...formData.sizeStock };
    delete newSizeStock[sizeToRemove];
    handleChange('sizeStock', newSizeStock);
    
    // Mostrar notificación de éxito
    if (showNotification) {
      showNotification(`Talle "${sizeToRemove}" eliminado correctamente`, 'success');
    }
  };

  // Función para actualizar el stock de un talle específico
  const handleSizeStockChange = (size, stock) => {
    const newSizeStock = {
      ...formData.sizeStock,
      [size]: parseInt(stock) || 0
    };
    handleChange('sizeStock', newSizeStock);
  };

  // Función para inicializar stock cuando se agrega un nuevo talle
  const initializeSizeStock = (size) => {
    if (!formData.sizeStock[size]) {
      const newSizeStock = {
        ...formData.sizeStock,
        [size]: 0
      };
      handleChange('sizeStock', newSizeStock);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="aggressive-text text-3xl text-white">
          {product.id ? 'EDITAR' : 'AGREGAR'} <span className="text-phenom-red">PRODUCTO</span>
        </h2>
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancelar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-phenom-black rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-phenom-red"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-phenom-red"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-phenom-red"
                required
              />
            </div>

            {/* Galería de Imágenes */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Galería de Imágenes del Producto
              </label>
              
              {/* Vista previa de imágenes */}
              {formData.images.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Imagen ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />
                        {/* Indicador de imagen principal */}
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-phenom-red text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                        {/* Botones de control */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700 transition-colors"
                              title="Mover a la izquierda"
                            >
                              ←
                            </button>
                          )}
                          {index < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700 transition-colors"
                              title="Mover a la derecha"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                            title="Eliminar imagen"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 La primera imagen será la imagen principal del producto. Usa las flechas para reordenar.
                  </p>
                </div>
              )}
              
              {/* Input de archivo */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Agregar Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-400 text-sm">
                  JPG, PNG, GIF (máx. 5MB) - {formData.images.length}/10 imágenes
                </span>
              </div>
            </div>

            {/* Gestión de Talles */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Talles Disponibles
              </label>
              
              {formData.sizes.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                        <span className="text-white text-sm">{size}</span>
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar talle"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!showAddSize ? (
                <button
                  type="button"
                  onClick={addSize}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Talle</span>
                </button>
              ) : (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={newSizeValue}
                      onChange={(e) => setNewSizeValue(e.target.value)}
                      placeholder="Ej: S, M, L, XL, 8 oz, 10 oz"
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-phenom-red focus:outline-none"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSizeSubmit();
                        } else if (e.key === 'Escape') {
                          handleCancelAddSize();
                        }
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddSizeSubmit}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <Save className="h-3 w-3" />
                      <span>Agregar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddSize}
                      className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <X className="h-3 w-3" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 Presiona Enter para agregar o Escape para cancelar
                  </p>
                </div>
              )}
              <p className="text-gray-400 text-xs mt-1">
                💡 Los talles son opcionales. Si no agregas talles, el producto se agregará directamente al carrito.
              </p>
            </div>

            {/* Gestión de Stock por Talle */}
            {formData.sizes.length > 0 && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  📦 Stock por Talle
                </label>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.sizes.map((size) => {
                      const currentStock = formData.sizeStock[size] || 0;
                      const isOutOfStock = currentStock === 0;
                      return (
                        <div key={size} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{size}</span>
                            {isOutOfStock && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                Agotado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">Stock:</span>
                            <input
                              type="number"
                              min="0"
                              value={currentStock}
                              onChange={(e) => handleSizeStockChange(size, e.target.value)}
                              className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-center focus:outline-none focus:border-phenom-red"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                    <p className="text-gray-400 text-xs">
                      💡 <strong>Stock por talle:</strong> Configura cuántas unidades tienes disponibles de cada talle. 
                      Si pones 0, ese talle aparecerá como "Agotado" en la tienda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => handleChange('inStock', e.target.checked)}
                  className="rounded border-gray-600 text-phenom-red focus:ring-phenom-red"
                />
                <span className="text-gray-300">Producto en stock</span>
              </label>
              <p className="text-gray-400 text-xs mt-1">
                💡 Si el producto tiene talles, el stock se maneja individualmente por talle arriba.
              </p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-phenom-red resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Características (separadas por comas)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => handleChange('features', e.target.value)}
                rows={3}
                placeholder="Característica 1, Característica 2, Característica 3"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-phenom-red resize-none"
              />
            </div>

            {/* Vista previa de imagen */}
            {formData.image && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Vista previa
                </label>
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden max-w-48">
                  <img
                    src={formData.image}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-red text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <Save className="h-4 w-4" />
            <span>GUARDAR PRODUCTO</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductsTab;
