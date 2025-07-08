#!/usr/bin/env node

// Script para actualizar el catálogo completo de Phenom con productos reales
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBvQSuupi_j8D5L8kVrMzQOQJ7HvQIhMJo",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "phenom-store-real.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "phenom-store-real",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "phenom-store-real.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nuevas categorías reales
const categories = [
  {
    id: 'boxeo',
    name: 'Boxeo',
    description: 'Equipamiento profesional para boxeo y entrenamiento',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop'
  },
  {
    id: 'taekwondo',
    name: 'Taekwondo',
    description: 'Protecciones y equipos para taekwondo',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop'
  },
  {
    id: 'terapia-sonido',
    name: 'Terapia de Sonido',
    description: 'Instrumentos para terapia de sonido y medicina alternativa',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'
  },
  {
    id: 'recuperacion',
    name: 'Recuperación Deportiva',
    description: 'Equipos para recuperación y terapias de frío/calor',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  }
];

// Productos reales del catálogo
const products = [
  // BOXEO
  {
    name: 'Guantes de Boxeo Premium',
    price: 89.99,
    category: 'boxeo',
    description: 'Guantes de cuero sintético y microfibra fuerte con hebilla de metal. Disponibles en 12 OZ, 14 OZ y 16 OZ.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop',
    features: ['Cuero sintético y microfibra', 'Hebilla de metal', 'Medidas: 12 OZ / 14 OZ / 16 OZ'],
    inStock: true
  },
  {
    name: 'Guantes de Boxeo Profesional',
    price: 99.99,
    category: 'boxeo',
    description: 'Guantes profesionales de cuero sintético y microfibra fuerte con hebilla de metal resistente.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop',
    features: ['Cuero sintético y microfibra', 'Hebilla de metal', 'Medidas: 12 OZ / 14 OZ / 16 OZ'],
    inStock: true
  },
  {
    name: 'Vendas de Boxeo',
    price: 24.99,
    category: 'boxeo',
    description: 'Vendas de algodón semi elástico con velcro, color negro. 305 mts el par.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    features: ['305 mts el par', 'Algodón semi elástico', 'Con velcro', 'Color negro'],
    inStock: true
  },

  // TAEKWONDO
  {
    name: 'Guantes de Taekwondo',
    price: 45.99,
    category: 'taekwondo',
    description: 'Protectores de color rojo para taekwondo. Disponibles en talles M, L y XL.',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop',
    features: ['Talles: M, L y XL', 'Protectores de color rojo'],
    inStock: true
  },
  {
    name: 'Protector de Pie Taekwondo',
    price: 39.99,
    category: 'taekwondo',
    description: 'Protectores de pie de color rojo para taekwondo. Talles M, L y XL disponibles.',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop',
    features: ['Talles: M, L y XL', 'Protectores de color rojo'],
    inStock: true
  },
  {
    name: 'Casco de Taekwondo',
    price: 79.99,
    category: 'taekwondo',
    description: 'Casco protector de color rojo para taekwondo. Disponible en talles M, L y XL.',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop',
    features: ['Talles: M, L y XL', 'Protectores de color rojo'],
    inStock: true
  },
  {
    name: 'Tibiales Protectores',
    price: 54.99,
    category: 'taekwondo',
    description: 'Protectores tibiales de tobillo a rodilla. Talle M: 34 CM, Talle L: 36 CM de canilla.',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop',
    features: ['Talle M: 34 CM de canilla', 'Talle L: 36 CM de canilla', 'Largo de tobillo a rodilla'],
    inStock: true
  },

  // TERAPIA DE SONIDO
  {
    name: 'Cuencos de Cuarzo Set Completo',
    price: 899.99,
    category: 'terapia-sonido',
    description: 'Set de 7 cuencos de cuarzo con vibración en 432 HZ. Incluye 2 bolsos con 4 y 3 cuencos.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    features: ['Set de 7 unidades', '2 bolsos incluidos', 'Medidas: 6", 7", 8", 9", 10", 11", 12"', 'Material: Cuarzo', 'Vibración en 432 HZ'],
    inStock: true
  },
  {
    name: 'Cuenco Tibetano',
    price: 149.99,
    category: 'terapia-sonido',
    description: 'Cuenco tibetano de aleación de zinc. Incluye baqueta de madera y almohadilla para apoyarlo.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    features: ['Medidas: 15 hasta 30 CM', 'Material: Aleación de zinc', 'Incluye baqueta de madera', 'Almohadilla para apoyarlo'],
    inStock: true
  },
  {
    name: 'Diapasón de Cristal',
    price: 199.99,
    category: 'terapia-sonido',
    description: 'Diapasón de cristal con vibración en 432 HZ. Incluye caja protectora.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    features: ['30 CM largo', 'Espesor: 1.6 CM', 'Incluye caja', 'Vibración en 432 HZ'],
    inStock: true
  },
  {
    name: 'Gong Platillo',
    price: 299.99,
    category: 'terapia-sonido',
    description: 'Gong platillo para terapia de sonido. Color negro y dorado, disponible en 25, 35 y 40 CM.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    features: ['Medidas: 25, 35 y 40 CM', 'Color: Negro y dorado', 'Terapia de sonido'],
    inStock: true
  },

  // RECUPERACIÓN DEPORTIVA
  {
    name: 'Sauna Box Full Body',
    price: 1299.99,
    category: 'recuperacion',
    description: 'Sauna portátil de instalación rápida con calentamiento extremadamente rápido. Tamaño full body.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    features: ['Instalación en 5 min', 'Calentamiento extremadamente rápido', 'Tamaño full body'],
    inStock: true
  },
  {
    name: 'Piscina PVC Terapia Frío/Calor',
    price: 449.99,
    category: 'recuperacion',
    description: 'Piscina circular de PVC para terapia de frío y calor. Capacidad de 350 litros.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    features: ['Forma circular', '75 CM diámetro / 85 CM altura', 'Carga: 350 LTS', 'Terapia de frío/calor'],
    inStock: true
  }
];

async function clearCollection(collectionName) {
  console.log(`🗑️ Limpiando colección ${collectionName}...`);
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises = querySnapshot.docs.map(docSnapshot => 
    deleteDoc(doc(db, collectionName, docSnapshot.id))
  );
  await Promise.all(deletePromises);
  console.log(`✅ Colección ${collectionName} limpiada`);
}

async function addCategories() {
  console.log('📂 Agregando categorías...');
  for (const category of categories) {
    try {
      await addDoc(collection(db, 'categories'), category);
      console.log(`✅ Categoría agregada: ${category.name}`);
    } catch (error) {
      console.error(`❌ Error agregando categoría ${category.name}:`, error);
    }
  }
}

async function addProducts() {
  console.log('🛍️ Agregando productos...');
  for (const product of products) {
    try {
      await addDoc(collection(db, 'products'), product);
      console.log(`✅ Producto agregado: ${product.name}`);
    } catch (error) {
      console.error(`❌ Error agregando producto ${product.name}:`, error);
    }
  }
}

async function updateCatalog() {
  try {
    console.log('🚀 Iniciando actualización del catálogo de Phenom...');
    console.log('=' * 60);
    
    // Limpiar datos existentes
    await clearCollection('categories');
    await clearCollection('products');
    
    // Agregar nuevos datos
    await addCategories();
    await addProducts();
    
    console.log('=' * 60);
    console.log('🎉 ¡Catálogo actualizado exitosamente!');
    console.log(`📂 ${categories.length} categorías agregadas`);
    console.log(`🛍️ ${products.length} productos agregados`);
    console.log('');
    console.log('🏪 Categorías actualizadas:');
    categories.forEach(cat => console.log(`   - ${cat.name}: ${cat.description}`));
    
  } catch (error) {
    console.error('❌ Error actualizando catálogo:', error);
  }
}

// Ejecutar actualización
updateCatalog();
