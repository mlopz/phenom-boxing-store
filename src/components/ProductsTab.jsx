import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Package, Eye, Upload, Image } from 'lucide-react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 [DEBUG] handleSubmit ejecutado');
    console.log('🔍 [DEBUG] product.id:', product.id);
    console.log('🔍 [DEBUG] formData.images:', formData.images);
    console.log('🔍 [DEBUG] formData.images.length:', formData.images.length);
    
    const productData = {
      ...formData,
      id: product.id, // ✅ CRÍTICO: Preservar el ID para edición
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      image: formData.images[0] || '', // Mantener compatibilidad con imagen principal
      images: formData.images // Nueva propiedad para múltiples imágenes
    };
    
    console.log('🔍 [DEBUG] productData creado:', productData);
    console.log('🔍 [DEBUG] productData.id:', productData.id);
    console.log('🔍 [DEBUG] productData.images:', productData.images);
    console.log('🔍 [DEBUG] Llamando onSave...');
    
    onSave(productData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onload = (event) => {
      const newImages = [...formData.images, event.target.result];
      handleChange('images', newImages);
    };
    reader.readAsDataURL(file);
    
    // Limpiar el input para permitir seleccionar la misma imagen de nuevo
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    const newImages = formData.images.filter((_, index) => index !== indexToRemove);
    handleChange('images', newImages);
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
