"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations, Language } from '../types';
import { TESTIMONIALS_DATA } from '../constants';
import { Quote } from 'lucide-react';

interface Props {
  t: Translations[Language];
  lang: Language;
}

const Testimonials: React.FC<Props> = ({ t, lang }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 8000); // Slower rotation for readability
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 text-[20rem] text-primary/10 font-script leading-none select-none -translate-y-20 -translate-x-20">
        Love
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
            <h2 className="text-5xl font-script text-accent">{t.testimonials_title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode='wait'>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative border border-primary/20"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-accent text-secondary p-4 rounded-full shadow-lg border-4 border-white">
                <Quote size={32} fill="currentColor" />
              </div>
              
              <div className="flex flex-col items-center justify-center mt-6">
                <div className="flex text-secondary text-2xl mb-8 space-x-1">
                    {[...Array(TESTIMONIALS_DATA[current].rating)].map((_, i) => (
                        <motion.span 
                            key={i} 
                            initial={{ opacity: 0, scale: 0 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: i * 0.1 }}
                        >
                            ★
                        </motion.span>
                    ))}
                </div>
                
                <p className="text-xl md:text-3xl text-gray-700 text-center font-light leading-relaxed mb-10 font-serif">
                    "{TESTIMONIALS_DATA[current].text[lang]}"
                </p>
                
                <div className="text-center">
                    <h4 className="font-bold text-accent text-xl tracking-wider uppercase">
                        {TESTIMONIALS_DATA[current].name[lang]}
                    </h4>
                    <span className="text-sm text-gray-400 font-medium mt-1 block">Verified Customer</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-12">
            {TESTIMONIALS_DATA.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-12 h-2 rounded-full transition-all duration-300 ${current === idx ? 'bg-accent' : 'bg-gray-200 hover:bg-primary'}`}
                />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;