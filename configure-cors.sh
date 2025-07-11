#!/bin/bash

# Script para configurar CORS en Firebase Storage
# Requiere autenticación con Google Cloud

echo "🔧 Configurando CORS para Firebase Storage..."

# Verificar si gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK no está instalado."
    echo "📋 Instrucciones manuales:"
    echo ""
    echo "1. Ve a la consola de Firebase: https://console.firebase.google.com/"
    echo "2. Selecciona tu proyecto: phenom-boxing-store"
    echo "3. Ve a Storage en el menú lateral"
    echo "4. Haz clic en 'Rules' (Reglas)"
    echo "5. Cambia las reglas a:"
    echo ""
    echo "rules_version = '2';"
    echo "service firebase.storage {"
    echo "  match /b/{bucket}/o {"
    echo "    match /{allPaths=**} {"
    echo "      allow read: if true;"
    echo "      allow write: if true;"
    echo "    }"
    echo "  }"
    echo "}"
    echo ""
    echo "6. Haz clic en 'Publish' (Publicar)"
    echo ""
    echo "Esto permitirá acceso público a las imágenes y resolverá el problema de CORS."
    exit 1
fi

# Configurar CORS si gcloud está disponible
echo "✅ Google Cloud SDK encontrado"
echo "🔄 Configurando CORS..."

# Autenticar (si es necesario)
gcloud auth application-default login

# Configurar CORS
gsutil cors set cors.json gs://phenom-boxing-store.firebasestorage.app

echo "✅ CORS configurado exitosamente"
echo "🔄 Verificando configuración..."

# Verificar configuración
gsutil cors get gs://phenom-boxing-store.firebasestorage.app

echo "✅ Configuración completada"
