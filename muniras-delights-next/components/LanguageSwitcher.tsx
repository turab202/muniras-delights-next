"use client";
import React, { useState } from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ currentLang, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-accent hover:text-primary transition-colors focus:outline-none"
      >
        <Globe size={20} />
        <span className="uppercase font-semibold">{currentLang}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 border border-primary/20"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary/10 ${
                  currentLang === lang.code ? 'text-accent font-bold' : 'text-gray-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
