use client
import React from 'react';
import { Facebook, Instagram, Twitter, Heart, ExternalLink } from 'lucide-react';
import { Translations, Language } from '../types';
import { TRANSLATIONS } from '../constants'; // Import to use logic if needed, but here we just need to receive props or useContext, but simple prop passing or context is better.
// To keep it simple without Prop drilling all the way if App.tsx doesn't pass it yet, let's assume App passes it or we import based on a state. 
// However, the cleanest way in this architecture is to accept props.
// Since App.tsx renders Footer, I will update App.tsx to pass props. 
// Wait, I need to update Footer signature first.

interface Props {
  t: Translations[Language];
}

const Footer: React.FC<Props> = ({ t }) => {
  return (
    <footer className="bg-accent text-white relative mt-20">
      {/* Wave SVG Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform -translate-y-full">
        <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-accent"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-12 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-8 md:mb-0">
                <h2 className="text-4xl font-script mb-2">{t.hero_title}</h2>
                <p className="text-white/80 font-light max-w-md">{t.footer_desc}</p>
            </div>

            <div className="flex space-x-6 mb-8 md:mb-0">
                <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white hover:text-accent transform hover:scale-110 transition-all duration-300"><Instagram size={20} /></a>
                <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white hover:text-accent transform hover:scale-110 transition-all duration-300"><Facebook size={20} /></a>
                <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white hover:text-accent transform hover:scale-110 transition-all duration-300"><Twitter size={20} /></a>
            </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} {t.hero_title}. {t.footer_rights}</p>
            
            <a 
              href="https://zahra-mustefa.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 md:mt-0 flex items-center gap-2 group hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10"
            >
              <span>{t.footer_made_with}</span>
              <Heart className="w-4 h-4 text-primary fill-primary animate-pulse group-hover:scale-125 transition-transform" />
              <span>{t.footer_by}</span>
              <span className="font-semibold text-secondary underline decoration-secondary underline-offset-4 group-hover:text-white group-hover:decoration-white">Zahra Mustefa</span>
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;