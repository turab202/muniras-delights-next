use client
import React, { useState } from 'react';
import { MenuItem, Translations, Language } from '../types';
import { MENU_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Sparkles } from 'lucide-react';

interface Props {
  t: Translations[Language];
  lang: Language;
  addToCart: (item: MenuItem) => void;
}

const Menu: React.FC<Props> = ({ t, lang, addToCart }) => {
  const [filter, setFilter] = useState<'all' | 'cakes' | 'pastries' | 'catering' | 'icecream'>('all');

  const filteredItems = filter === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === filter);

  const categories = [
    { id: 'all', label: t.menu_filter_all },
    { id: 'cakes', label: t.menu_filter_cakes },
    { id: 'pastries', label: t.menu_filter_pastries },
    { id: 'catering', label: t.menu_filter_catering },
    { id: 'icecream', label: t.menu_filter_icecream },
  ];

  return (
    <section id="menu" className="py-24 px-4 max-w-7xl mx-auto bg-background relative overflow-hidden">
       {/* Decorative Background Patterns */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-xl animate-pulse"></div>
       </div>

      <div className="text-center mb-20 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-secondary" size={20} />
            <span className="text-accent text-sm font-bold uppercase tracking-widest">{t.menu_selection}</span>
            <Sparkles className="text-secondary" size={20} />
        </div>
        <h2 className="text-5xl md:text-7xl font-script text-accent mb-6 drop-shadow-sm">{t.menu_title}</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light mb-12">
          {t.menu_subtitle}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base transition-all duration-300 font-medium ${
                filter === cat.id 
                  ? 'bg-accent text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-accent' 
                  : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md hover:text-accent hover:-translate-y-1'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              key={item.id}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 relative border border-gray-50"
            >
              <div className="relative h-72 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-black/20 transition-colors"></div>
                <img 
                  src={item.image} 
                  alt={item.name[lang]} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
                
                {/* Price Tag */}
                <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-sm text-accent px-4 py-1.5 rounded-full font-bold shadow-sm border border-accent/10">
                   ${item.price}
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6 z-20 bg-accent/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                   {item.category}
                </div>
                
                {/* Overlay Button */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-white text-accent font-bold py-3 px-8 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-secondary hover:text-accent flex items-center gap-2"
                  >
                    <Plus size={18} strokeWidth={3} /> {t.hero_cta_order}
                  </button>
                </div>
              </div>
              
              <div className="p-8 relative bg-white">
                <div className="absolute -top-5 right-8 bg-secondary text-accent p-2.5 rounded-full shadow-lg border-4 border-white">
                    <Star size={18} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif group-hover:text-accent transition-colors">{item.name[lang]}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{item.description[lang]}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-400">
              <p>{t.menu_no_items}</p>
          </div>
      )}
    </section>
  );
};

export default Menu;