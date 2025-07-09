# Plan de Solución: Corrección de URLs de Imágenes en Firebase Storage

## Problema Actual
- Las imágenes nuevas subidas a través del panel de administración generan URLs malformadas
- Error 404 al intentar acceder a las imágenes
- Las URLs generadas tienen el formato incorrecto: `?name=products/...` en lugar de `/o/products/...?alt=media`

## Análisis
1. **Código actual**: El componente `ProductsTab.jsx` maneja la subida de imágenes usando `FileReader` y guarda el resultado como data URL
2. **Problema identificado**: No se está utilizando el SDK de Firebase Storage para subir los archivos, solo se están leyendo localmente
3. **Impacto**: Las imágenes no se están guardando en Firebase Storage, solo se están almacenando como strings en la base de datos

## Solución Propuesta

### 1. Actualizar el flujo de subida de imágenes
- [ ] Modificar `handleImageUpload` en `ProductsTab.jsx` para que:
  - Suba el archivo a Firebase Storage
  - Obtenga la URL pública de descarga
  - Actualice el estado con la URL correcta

### 2. Implementar función de subida a Firebase Storage
- [ ] Crear función en `firebase.js` para manejar la subida de archivos
- [ ] Manejar correctamente los permisos de Storage
- [ ] Generar nombres únicos para los archivos

### 3. Actualizar la función de guardado
- [ ] Asegurar que las URLs se guarden en el formato correcto
- [ ] Manejar la eliminación de imágenes antiguas al actualizar

### 4. Probar el flujo completo
- [ ] Probar subida de nuevas imágenes
- [ ] Verificar que las imágenes se muestran correctamente
- [ ] Probar la edición de productos con imágenes existentes

## Próximos Pasos
1. Implementar los cambios en el código
2. Probar en entorno de desarrollo
3. Desplegar a producción
4. Verificar que las imágenes se cargan correctamente
