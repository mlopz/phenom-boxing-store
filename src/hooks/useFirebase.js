import { useState, useEffect } from 'react';
import { 
  getProducts, 
  getCategories, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  uploadImage 
} from '../firebase/services';

// Hook personalizado para manejar Firebase
export const useFirebase = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar productos desde Firebase
  const loadProducts = async () => {
    try {
      setLoading(true);
      const firebaseProducts = await getProducts();
      setProducts(firebaseProducts);
      setError(null);
    } catch (err) {
      setError('Error cargando productos: ' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías desde Firebase
  const loadCategories = async () => {
    try {
      setLoading(true);
      const firebaseCategories = await getCategories();
      setCategories(firebaseCategories);
      setError(null);
    } catch (err) {
      setError('Error cargando categorías: ' + err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [firebaseProducts, firebaseCategories] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(firebaseProducts);
      setCategories(firebaseCategories);
      setError(null);
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto
  const createProduct = async (productData, imageFile = null) => {
    try {
      setLoading(true);
      
      let finalProductData = { ...productData };
      
      // Si hay imagen, subirla primero
      if (imageFile) {
        const imageResult = await uploadImage(imageFile, 'products');
        finalProductData.imageUrl = imageResult.url;
        finalProductData.imagePath = imageResult.path;
      }
      
      const productId = await addProduct(finalProductData);
      await loadProducts(); // Recargar productos
      setError(null);
      return productId;
    } catch (err) {
      setError('Error creando producto: ' + err.message);
      console.error('Error creating product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProductData = async (productId, productData, imageFile = null) => {
    try {
      setLoading(true);
      
      let finalProductData = { ...productData };
      
      // Si hay nueva imagen, subirla
      if (imageFile) {
        const imageResult = await uploadImage(imageFile, 'products');
        finalProductData.imageUrl = imageResult.url;
        finalProductData.imagePath = imageResult.path;
      }
      
      await updateProduct(productId, finalProductData);
      await loadProducts(); // Recargar productos
      setError(null);
    } catch (err) {
      setError('Error actualizando producto: ' + err.message);
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const removeProduct = async (productId) => {
    try {
      setLoading(true);
      await deleteProduct(productId);
      await loadProducts(); // Recargar productos
      setError(null);
    } catch (err) {
      setError('Error eliminando producto: ' + err.message);
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Agregar categoría
  const createCategory = async (categoryData, imageFile = null) => {
    try {
      setLoading(true);
      
      let finalCategoryData = { ...categoryData };
      
      // Si hay imagen, subirla primero
      if (imageFile) {
        const imageResult = await uploadImage(imageFile, 'categories');
        finalCategoryData.imageUrl = imageResult.url;
        finalCategoryData.imagePath = imageResult.path;
      }
      
      const categoryId = await addCategory(finalCategoryData);
      await loadCategories(); // Recargar categorías
      setError(null);
      return categoryId;
    } catch (err) {
      setError('Error creando categoría: ' + err.message);
      console.error('Error creating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría
  const updateCategoryData = async (categoryId, categoryData, imageFile = null) => {
    try {
      setLoading(true);
      
      let finalCategoryData = { ...categoryData };
      
      // Si hay nueva imagen, subirla
      if (imageFile) {
        const imageResult = await uploadImage(imageFile, 'categories');
        finalCategoryData.imageUrl = imageResult.url;
        finalCategoryData.imagePath = imageResult.path;
      }
      
      await updateCategory(categoryId, finalCategoryData);
      await loadCategories(); // Recargar categorías
      setError(null);
    } catch (err) {
      setError('Error actualizando categoría: ' + err.message);
      console.error('Error updating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const removeCategory = async (categoryId) => {
    try {
      setLoading(true);
      await deleteCategory(categoryId);
      await loadCategories(); // Recargar categorías
      setError(null);
    } catch (err) {
      setError('Error eliminando categoría: ' + err.message);
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado
    products,
    categories,
    loading,
    error,
    
    // Funciones de carga
    loadProducts,
    loadCategories,
    loadAllData,
    
    // Funciones de productos
    createProduct,
    updateProduct: updateProductData,
    removeProduct,
    
    // Funciones de categorías
    createCategory,
    updateCategory: updateCategoryData,
    removeCategory,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

export default useFirebase;
