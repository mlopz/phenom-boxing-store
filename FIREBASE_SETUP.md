# 🔥 Configuración de Firebase para Phenom Boxing Store

Esta guía te ayudará a configurar Firebase para hacer tu tienda completamente operativa con base de datos real.

## 📋 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `phenom-boxing-store` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Selecciona tu cuenta de Google Analytics
6. Haz clic en "Crear proyecto"

## 🗄️ Paso 2: Configurar Firestore Database

1. En el panel de Firebase, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (por ahora)
4. Elige la ubicación más cercana (ej: `southamerica-east1` para Uruguay)
5. Haz clic en **"Listo"**

### Reglas de seguridad (temporal):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORAL - cambiar en producción
    }
  }
}
```

## 📁 Paso 3: Configurar Firebase Storage

1. En el panel de Firebase, ve a **"Storage"**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas de seguridad por defecto
4. Selecciona la misma ubicación que Firestore
5. Haz clic en **"Listo"**

### Reglas de seguridad (temporal):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // TEMPORAL - cambiar en producción
    }
  }
}
```

## 🔑 Paso 4: Obtener Credenciales

1. En el panel de Firebase, ve a **"Configuración del proyecto"** (ícono de engranaje)
2. En la pestaña **"General"**, baja hasta **"Tus apps"**
3. Haz clic en **"Agregar app"** y selecciona **"Web"** (ícono `</>`
4. Nombre de la app: `Phenom Boxing Store`
5. **NO** marques "También configura Firebase Hosting"
6. Haz clic en **"Registrar app"**
7. **COPIA** la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 📝 Paso 5: Configurar Variables de Entorno

1. Abre tu archivo `.env.local`
2. Reemplaza las variables de Firebase con tus credenciales reales:

```bash
# Configuración de Firebase
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## 🚀 Paso 6: Ejecutar la Migración

1. **Reinicia** tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a tu panel de administración: `http://localhost:3002/admin`

3. Ingresa la contraseña: `phenom2024`

4. Haz clic en la pestaña **"Firebase"**

5. Haz clic en **"Probar Conexión"** para verificar que todo esté bien

6. Si la conexión es exitosa, haz clic en **"Migrar Datos"**

7. ¡Espera a que termine la migración!

## ✅ Paso 7: Verificar la Migración

1. Ve a Firebase Console → Firestore Database
2. Deberías ver las colecciones:
   - `products` (con todos tus productos)
   - `categories` (con todas tus categorías)

3. Ve a Firebase Console → Storage
4. Verás las carpetas:
   - `products/` (para imágenes de productos)
   - `categories/` (para imágenes de categorías)

## 🔒 Paso 8: Configurar Seguridad (IMPORTANTE)

### Reglas de Firestore (Producción):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de productos y categorías
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Solo desde el panel admin
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // Solo desde el panel admin
    }
    
    // Órdenes solo lectura/escritura para usuarios autenticados
    match /orders/{orderId} {
      allow read, write: if true; // Ajustar según necesidades
    }
  }
}
```

### Reglas de Storage (Producción):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de imágenes
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Solo desde el panel admin
    }
  }
}
```

## 🎉 ¡Listo!

Tu tienda Phenom ahora está conectada a Firebase y es completamente operativa:

- ✅ **Base de datos real** - No más localStorage
- ✅ **Imágenes en la nube** - URLs automáticas y CDN
- ✅ **Panel admin funcional** - Cambios instantáneos
- ✅ **Escalabilidad** - Crece con tu negocio
- ✅ **Backup automático** - Nunca perder datos
- ✅ **Integración con MercadoPago** - Pagos reales

## 🆘 Solución de Problemas

### Error: "Firebase config not found"
- Verifica que las variables en `.env.local` tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo

### Error: "Permission denied"
- Verifica las reglas de Firestore y Storage
- Asegúrate de que estén en "modo de prueba" inicialmente

### Error: "Network error"
- Verifica tu conexión a internet
- Verifica que el proyecto de Firebase esté activo

### La migración no funciona
- Verifica que todas las credenciales sean correctas
- Revisa la consola del navegador para errores específicos
- Asegúrate de que Firestore y Storage estén habilitados

## 📞 Soporte

Si tienes problemas con la configuración, revisa:
1. La consola del navegador (F12)
2. Los logs de Firebase Console
3. Que todas las variables de entorno estén correctas
