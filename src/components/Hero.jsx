import React from 'react';
import { ArrowRight, Target, Zap, Shield } from 'lucide-react';

const Hero = ({ onShopClick }) => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center boxing-pattern">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-phenom-black via-phenom-dark to-phenom-black opacity-90"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="aggressive-text text-6xl md:text-8xl text-white mb-6 text-shadow">
            ELEVA TU
            <span className="text-phenom-red block">BIENESTAR INTEGRAL</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
            Deportes de combate, medicina alternativa y recuperación deportiva.
            <br />
            <span className="text-phenom-red font-semibold">Productos premium para atletas y personas que buscan bienestar integral.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onShopClick}
              className="bg-gradient-red text-white px-8 py-4 rounded-lg font-bold text-lg hover-scale pulse-glow flex items-center justify-center space-x-2 transition-all"
            >
              <span>COMPRAR AHORA</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button 
              onClick={onShopClick}
              className="border-2 border-phenom-red text-phenom-red px-8 py-4 rounded-lg font-bold text-lg hover:bg-phenom-red hover:text-white transition-all hover-scale"
            >
              VER CATÁLOGO
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center group">
              <div className="bg-phenom-red p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="aggressive-text text-xl text-white mb-2">DEPORTE</h3>
              <p className="text-gray-400">Equipos profesionales para deportes de combate y entrenamiento de alto rendimiento.</p>
            </div>

            <div className="text-center group">
              <div className="bg-phenom-red p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="aggressive-text text-xl text-white mb-2">TERAPIA</h3>
              <p className="text-gray-400">Instrumentos de terapia de sonido y medicina alternativa para tu bienestar.</p>
            </div>

            <div className="text-center group">
              <div className="bg-phenom-red p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="aggressive-text text-xl text-white mb-2">RECUPERACIÓN</h3>
              <p className="text-gray-400">Equipos de recuperación deportiva y terapias de frío/calor para atletas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-phenom-red rounded-full animate-pulse opacity-60"></div>
      <div className="absolute bottom-32 right-16 w-6 h-6 bg-phenom-red rounded-full animate-pulse opacity-40"></div>
      <div className="absolute top-1/2 right-8 w-3 h-3 bg-white rounded-full animate-pulse opacity-50"></div>
    </section>
  );
};

export default Hero;
