import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '../services/firebase';

const Categories = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar categorías desde Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError('Error al cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Las imágenes ahora vienen del JSON de cada categoría

  // Mostrar estado de carga
  if (loading) {
    return (
      <section id="categorias" className="py-16 bg-phenom-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
              EXPLORA NUESTRAS <span className="text-phenom-red">CATEGORÍAS</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas para llevar tu entrenamiento al siguiente nivel.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-phenom-red"></div>
            <p className="text-gray-400 mt-4">Cargando categorías...</p>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <section id="categorias" className="py-16 bg-phenom-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
              EXPLORA NUESTRAS <span className="text-phenom-red">CATEGORÍAS</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas para llevar tu entrenamiento al siguiente nivel.
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
    <section id="categorias" className="py-16 bg-phenom-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
            EXPLORA NUESTRAS <span className="text-phenom-red">CATEGORÍAS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas para llevar tu entrenamiento al siguiente nivel.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-lg bg-phenom-dark border border-gray-700 hover:border-phenom-red transition-all duration-300 hover-scale cursor-pointer"
              onClick={() => onCategoryClick?.(category.id)}
            >
              {/* Background Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image || 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=400&fit=crop'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-phenom-black via-phenom-black/50 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="aggressive-text text-2xl text-white mb-2 group-hover:text-phenom-red transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center text-phenom-red group-hover:text-white transition-colors">
                  <span className="font-semibold mr-2">EXPLORAR</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-phenom-red opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-dark rounded-lg p-8 border border-gray-700">
            <h3 className="aggressive-text text-2xl text-white mb-4">
              ¿NO ENCUENTRAS LO QUE <span className="text-phenom-red">BUSCAS?</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Contáctanos y te ayudaremos a encontrar el equipo perfecto para tu entrenamiento.
            </p>
            <button className="bg-gradient-red text-white px-8 py-3 rounded-lg font-bold hover-scale pulse-glow transition-all">
              CONTACTAR AHORA
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
