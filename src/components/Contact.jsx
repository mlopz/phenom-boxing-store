import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {

  return (
    <section id="contacto" className="py-16 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="aggressive-text text-4xl md:text-5xl text-white mb-4 text-shadow">
            PONTE EN <span className="text-phenom-red">CONTACTO</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ¿Tienes preguntas sobre nuestros productos? ¿Necesitas asesoramiento personalizado? 
            Estamos aquí para ayudarte a encontrar el equipo perfecto.
          </p>
        </div>

        {/* Contact Information - Centered Layout */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-phenom-red p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Dirección</h4>
                <p className="text-gray-400">
                  Optica De Brunito<br />
                  Mercedes 1234<br />
                  Montevideo, Uruguay
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-phenom-red p-3 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Teléfono</h4>
                <p className="text-gray-400">+598 99 1234 5678</p>
                <p className="text-gray-400">WhatsApp: +598 99 8765 4321</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-phenom-red p-3 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Email</h4>
                <p className="text-gray-400">info@phenom.com</p>
                <p className="text-gray-400">ventas@phenom.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-phenom-red p-3 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Horarios</h4>
                <p className="text-gray-400">
                  Lunes - Viernes: 13:00 PM - 13:15 PM<br />
                  Sábados: Cerrado<br />
                  Domingos: Cerrado
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-phenom-black rounded-lg p-6 border border-gray-700 mt-8">
            <h4 className="aggressive-text text-lg text-white mb-4 text-center">
              ¿POR QUÉ ELEGIR <span className="text-phenom-red">PHENOM?</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-phenom-red rounded-full"></div>
                <span className="text-gray-400">Productos de calidad profesional</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-phenom-red rounded-full"></div>
                <span className="text-gray-400">Asesoramiento personalizado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-phenom-red rounded-full"></div>
                <span className="text-gray-400">Envíos rápidos y seguros</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-phenom-red rounded-full"></div>
                <span className="text-gray-400">Garantía en todos nuestros productos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
