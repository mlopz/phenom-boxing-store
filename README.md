# Phenom - Tienda de Boxeo y Artes Marciales

Una tienda de e-commerce moderna y agresiva especializada en equipos de boxeo y artes marciales.

## Características

### 🥊 Funcionalidades Principales
- **Catálogo completo** de productos de boxeo y artes marciales
- **Carrito de compras** con persistencia en localStorage
- **Proceso de checkout simulado** con generación de órdenes
- **Filtrado y búsqueda** de productos por categoría y nombre
- **Diseño responsive** optimizado para móviles y desktop
- **Interfaz agresiva y deportiva** con colores impactantes

### 🛒 E-commerce
- Agregar/quitar productos del carrito
- Actualizar cantidades
- Proceso de compra simulado
- Generación de número de orden
- Confirmación de pedido

### 🎨 Diseño
- **Paleta de colores agresiva**: Negro, rojo y blanco
- **Tipografías deportivas**: Bebas Neue y Oswald
- **Efectos visuales**: Animaciones, hover effects, pulse glow
- **Responsive design** para todos los dispositivos

### 📦 Productos Incluidos
- **Guantes de Boxeo**: Profesionales y de entrenamiento
- **Sacos de Entrenamiento**: Pesados y de velocidad
- **Protecciones**: Cascos, bucales, protecciones corporales
- **Accesorios**: Vendas, cuerdas, equipos de entrenamiento
- **Ropa Deportiva**: Shorts, camisetas técnicas

## Tecnologías Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool y desarrollo
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos
- **Context API** - Gestión del estado del carrito

## Instalación y Uso

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
cd phenom-boxing-store

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Linter de código

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.jsx      # Navegación principal
│   ├── Hero.jsx        # Sección hero
│   ├── ProductCard.jsx # Tarjeta de producto
│   ├── ProductGrid.jsx # Grid de productos
│   ├── Categories.jsx  # Sección de categorías
│   ├── Cart.jsx        # Carrito lateral
│   ├── Checkout.jsx    # Proceso de compra
│   ├── Contact.jsx     # Formulario de contacto
│   └── Footer.jsx      # Pie de página
├── context/            # Context API
│   └── CartContext.jsx # Estado del carrito
├── data/               # Datos de la aplicación
│   └── products.json   # Productos y categorías
├── App.jsx             # Componente principal
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

## Gestión de Productos

Los productos se gestionan a través del archivo `src/data/products.json`. Este archivo contiene:

### Categorías
```json
{
  "id": "categoria-id",
  "name": "Nombre de la Categoría",
  "description": "Descripción de la categoría"
}
```

### Productos
```json
{
  "id": 1,
  "name": "Nombre del Producto",
  "category": "categoria-id",
  "price": 99.99,
  "image": "url-de-la-imagen",
  "description": "Descripción del producto",
  "features": ["Característica 1", "Característica 2"],
  "inStock": true
}
```

## Personalización

### Colores
Los colores principales se definen en `tailwind.config.js`:
- `phenom-red`: #DC2626
- `phenom-dark`: #1F2937
- `phenom-black`: #111827

### Fuentes
- **Títulos agresivos**: Bebas Neue
- **Texto general**: Oswald

### Imágenes
Las imágenes de productos utilizan Unsplash como placeholder. Para producción, reemplaza con imágenes reales de productos.

## Funcionalidades Futuras

- [ ] Integración con pasarela de pagos real
- [ ] Sistema de usuarios y autenticación
- [ ] Wishlist de productos
- [ ] Reviews y calificaciones
- [ ] Sistema de inventario en tiempo real
- [ ] Panel de administración
- [ ] Integración con CMS para gestión de contenido

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

**Phenom Boxing & Martial Arts**
- Email: info@phenom.com
- Teléfono: +52 55 1234 5678
- Dirección: Av. del Boxeo 123, Ciudad Deportiva

---

*Desarrollado con ❤️ para la comunidad de boxeo y artes marciales*
