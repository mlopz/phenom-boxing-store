import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, LayoutGrid } from 'lucide-react';

const CategoriesTab = ({ 
  categories, 
  onAdd, 
  onEdit, 
  onDelete, 
  editingCategory, 
  onSave, 
  onCancel 
}) => {
  if (editingCategory) {
    return (
      <CategoryForm
        category={editingCategory}
        categories={categories}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="aggressive-text text-3xl text-white">
          GESTIÓN DE <span className="text-phenom-red">CATEGORÍAS</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-gradient-red text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>AGREGAR CATEGORÍA</span>
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => onEdit(category)}
            onDelete={() => onDelete(category.id)}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay categorías disponibles</p>
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, onEdit, onDelete }) => {
  return (
    <div className="bg-phenom-black rounded-lg border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-phenom-red p-2 rounded-lg">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{category.name}</h3>
            <p className="text-gray-400 text-sm">ID: {category.id}</p>
          </div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-6 min-h-[3rem]">
        {category.description}
      </p>
      
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
  );
};

const CategoryForm = ({ category, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: category.id || '',
    name: category.name || '',
    description: category.description || ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'El ID es requerido';
    } else if (formData.id !== category.id && categories.find(c => c.id === formData.id)) {
      newErrors.id = 'Este ID ya existe';
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'El ID solo puede contener letras minúsculas, números y guiones';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generateId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value) => {
    handleChange('name', value);
    // Auto-generar ID si es una nueva categoría
    if (!category.id) {
      handleChange('id', generateId(value));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="aggressive-text text-3xl text-white">
          {category.id ? 'EDITAR' : 'AGREGAR'} <span className="text-phenom-red">CATEGORÍA</span>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              ID de la categoría *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="ej: guantes-boxeo"
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                errors.id ? 'border-red-500' : 'border-gray-600 focus:border-phenom-red'
              }`}
              required
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Solo letras minúsculas, números y guiones. Se usa en la URL.
            </p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="ej: Guantes de Boxeo"
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-600 focus:border-phenom-red'
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción de la categoría..."
              rows={3}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600 focus:border-phenom-red'
              }`}
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Vista previa */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 className="text-gray-300 text-sm font-medium mb-3">Vista previa:</h4>
            <div className="bg-phenom-black rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-phenom-red p-2 rounded-lg">
                  <LayoutGrid className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-bold">
                    {formData.name || 'Nombre de la categoría'}
                  </h5>
                  <p className="text-gray-400 text-xs">ID: {formData.id || 'id-categoria'}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                {formData.description || 'Descripción de la categoría'}
              </p>
            </div>
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
            <span>GUARDAR CATEGORÍA</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriesTab;
