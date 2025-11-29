"use client";
import React from 'react';
import { Translations, Language } from '../types';

interface Props {
  t: Translations[Language];
}

const About: React.FC<Props> = ({ t }) => {
  return (
    <section id="about" className="py-32 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-fixed bg-center">
      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/90 to-accent/70 backdrop-blur-[3px]"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Image collage or Decorative Element */}
        <div className="hidden md:block relative h-[500px]">
            <div className="absolute top-10 left-10 w-full h-full border-2 border-secondary/50 rounded-tl-[100px] rounded-br-[100px]"></div>
            <img 
                src="https://images.unsplash.com/photo-1626803775151-61d756612fcd?auto=format&fit=crop&w=800&q=80" 
                alt="Cake Decoration" 
                className="absolute inset-0 w-full h-full object-cover rounded-tl-[100px] rounded-br-[100px] shadow-2xl"
            />
        </div>

        {/* Right Side: Content */}
        <div className="text-white">
            <div className="inline-block px-4 py-1 border border-secondary/50 rounded-full text-secondary text-sm font-bold tracking-widest uppercase mb-6">
                Our Heritage
            </div>
            <h2 className="text-5xl md:text-7xl font-script text-secondary mb-8 drop-shadow-lg leading-none">
                {t.about_title}
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 leading-loose mb-10 font-light text-justify">
                {t.about_story}
            </p>

            <div className="flex items-center gap-4">
                <div className="w-16 h-[2px] bg-secondary"></div>
                <div className="font-script text-4xl text-secondary animate-pulse">
                    {t.about_signature}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default About;