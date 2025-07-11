import React from 'react';
import { Zap, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-phenom-black border-t-4 border-phenom-red">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-red p-2 rounded-lg pulse-glow">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="aggressive-text text-2xl text-white text-shadow">
                  PHENOM
                </h3>
                <p className="text-phenom-red text-xs font-semibold tracking-wider">
                  DEPORTE • BIENESTAR • RECUPERACIÓN
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Tu tienda especializada en deportes de combate, medicina alternativa y recuperación deportiva. 
              Productos premium para atletas y personas que buscan bienestar integral.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="aggressive-text text-lg text-white mb-4">NAVEGACIÓN</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#productos" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Productos
                </a>
              </li>
              <li>
                <a href="#categorias" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Categorías
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="aggressive-text text-lg text-white mb-4">CATEGORÍAS</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Guantes de Boxeo
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Sacos de Entrenamiento
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Protecciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Accesorios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors text-sm">
                  Ropa Deportiva
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="aggressive-text text-lg text-white mb-4">CONTACTO</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-phenom-red" />
                <span className="text-gray-400 text-sm">
                  Av. del Boxeo 123, Ciudad Deportiva
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-phenom-red" />
                <span className="text-gray-400 text-sm">
                  +52 55 1234 5678
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-phenom-red" />
                <span className="text-gray-400 text-sm">
                  info@phenom.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Phenom. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-400 hover:text-phenom-red transition-colors">
                Política de Devoluciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
