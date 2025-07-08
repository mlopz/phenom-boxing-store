import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts, getCategories } from '../services/firebase';

const ProductGrid = ({ selectedCategory: externalSelectedCategory, onCategoryChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(externalSelectedCategory || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos desde Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Iniciando carga de datos desde Firebase...');
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        console.log('📦 Productos cargados:', productsData);
        console.log('📂 Categorías cargadas:', categoriesData);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
        setError('Error al cargar los productos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync with external category selection
  useEffect(() => {
    if (externalSelectedCategory && externalSelectedCategory !== selectedCategory) {
      setSelectedCategory(externalSelectedCategory);
    }
  }, [externalSelectedCategory, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    console.log('🔍 [ProductGrid] Filtrando productos:', {
      totalProducts: products.length,
      searchTerm,
      selectedCategory,
      sortBy,
      products: products.map(p => ({ id: p.id, name: p.name, category: p.category }))
    });
    
    console.log('📂 [ProductGrid] Categorías disponibles:', categories.map(c => ({ id: c.id, name: c.name })));
    console.log('🔍 [ProductGrid] Categoría seleccionada:', selectedCategory);
    
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matches = matchesSearch && matchesCategory;
      
      console.log(`🔍 [ProductGrid] Producto: ${product.name}`, {
        productCategory: product.category,
        selectedCategory,
        matchesCategory,
        matchesSearch,
        finalMatch: matches
      });
      
      return matches;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    console.log(`✅ [ProductGrid] Productos filtrados: ${filtered.length}/${products.length}`);
    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <section id="productos" className="py-16 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
              NUESTROS <span className="text-phenom-red">PRODUCTOS</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Descubre nuestra colección completa de productos para deportes de combate, medicina alternativa y recuperación deportiva.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-phenom-red"></div>
            <p className="text-gray-400 mt-4">Cargando productos...</p>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <section id="productos" className="py-16 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
              NUESTROS <span className="text-phenom-red">PRODUCTOS</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Descubre nuestra colección completa de productos para deportes de combate, medicina alternativa y recuperación deportiva.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-phenom-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-16 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
            NUESTROS <span className="text-phenom-red">PRODUCTOS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubre nuestra colección completa de productos para deportes de combate, medicina alternativa y recuperación deportiva.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-phenom-black border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-phenom-red focus:outline-none transition-colors"
            />
          </div>

          <div className="flex space-x-4">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  onCategoryChange?.(newCategory);
                }}
                className="pl-10 pr-8 py-3 bg-phenom-black border border-gray-600 rounded-lg text-white focus:border-phenom-red focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-phenom-black border border-gray-600 rounded-lg text-white focus:border-phenom-red focus:outline-none appearance-none cursor-pointer"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No products found */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No se encontraron productos que coincidan con tu búsqueda.
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-phenom-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
