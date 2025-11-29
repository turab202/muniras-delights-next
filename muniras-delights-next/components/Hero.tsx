use client
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Translations, Language } from '../types';

interface Props {
  t: Translations[Language];
  onOrderClick: () => void;
}

const Hero: React.FC<Props> = ({ t, onOrderClick }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const PHRASES = [
    t.typing_phrase_1,
    t.typing_phrase_2,
    t.typing_phrase_3,
    t.typing_phrase_4,
    t.typing_phrase_5,
    t.typing_phrase_6,
    t.typing_phrase_7,
  ];

  useEffect(() => {
    // Reset index if it goes out of bounds when switching languages (though array length is constant)
    if (currentPhraseIndex >= PHRASES.length) {
        setCurrentPhraseIndex(0);
    }
  }, [t, currentPhraseIndex]);

  useEffect(() => {
    const currentFullText = PHRASES[currentPhraseIndex];
    
    const handleTyping = () => {
      setDisplayedText(prev => {
        if (!isDeleting) {
          if (prev.length < currentFullText.length) {
            return currentFullText.slice(0, prev.length + 1);
          } else {
            setTimeout(() => setIsDeleting(true), 2500);
            return prev;
          }
        } else {
          if (prev.length > 0) {
            return currentFullText.slice(0, prev.length - 1);
          } else {
            setIsDeleting(false);
            setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % PHRASES.length);
            return "";
          }
        }
      });
    };

    const typingSpeed = isDeleting ? 30 : 70;
    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex, PHRASES]);

  // Floating variants for sweet elements
  const floatVariant = (delay: number) => ({
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  });

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#FFF8F0]">
      {/* 1. Advanced Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-[#F7CAC9] to-[#ffe4e1] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[60%] bg-gradient-to-bl from-[#FFD700] to-[#fffacd] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-gradient-to-t from-[#F7CAC9] to-[#ffe4e1] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. Floating Sweet Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Cupcake Top Left */}
        <motion.img 
          src="https://cdn-icons-png.flaticon.com/512/2682/2682455.png" 
          alt="cupcake"
          className="absolute top-[15%] left-[5%] md:left-[10%] w-16 md:w-24 opacity-30 drop-shadow-lg"
          animate={floatVariant(0)}
        />
        {/* Donut Bottom Right */}
        <motion.img 
          src="https://cdn-icons-png.flaticon.com/512/3081/3081919.png" 
          alt="donut"
          className="absolute bottom-[20%] right-[5%] md:right-[10%] w-20 md:w-32 opacity-30 drop-shadow-lg"
          animate={floatVariant(1)}
        />
        {/* Macaron Top Right */}
        <motion.img 
          src="https://cdn-icons-png.flaticon.com/512/541/541732.png" 
          alt="macaron"
          className="absolute top-[20%] right-[15%] w-12 md:w-20 opacity-25 drop-shadow-md"
          animate={floatVariant(2)}
        />
        {/* Strawberry Bottom Left */}
        <motion.img 
          src="https://cdn-icons-png.flaticon.com/512/590/590772.png" 
          alt="strawberry"
          className="absolute bottom-[25%] left-[15%] w-14 md:w-24 opacity-25 drop-shadow-md"
          animate={floatVariant(1.5)}
        />
        {/* Cookie Middle Left */}
        <motion.img 
          src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
          alt="cookie"
          className="absolute top-[45%] left-[5%] w-10 md:w-16 opacity-20 blur-[1px]"
          animate={floatVariant(3)}
        />
      </div>

      {/* 3. Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <span className="block text-accent text-sm md:text-lg tracking-[0.3em] uppercase font-bold mb-4 opacity-70">
            {t.hero_est}
          </span>
          <h1 className="text-7xl md:text-9xl font-script text-accent mb-6 leading-tight drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-accent to-[#8B4513] pb-2">
            {t.hero_title}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
             <div className="h-[1px] w-12 md:w-24 bg-accent"></div>
             <div className="text-2xl text-accent">❦</div>
             <div className="h-[1px] w-12 md:w-24 bg-accent"></div>
          </div>
        </motion.div>
        
        <div className="h-28 md:h-32 flex items-center justify-center max-w-3xl">
            <h2 className="text-2xl md:text-4xl text-gray-700 font-light font-sans tracking-wide leading-relaxed">
              {displayedText}
              <span className="animate-pulse text-primary ml-1 text-4xl">|</span>
            </h2>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="flex flex-col sm:flex-row gap-6 justify-center mt-10 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px rgba(107, 66, 38, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onOrderClick}
            className="px-12 py-5 bg-gradient-to-r from-accent to-[#5a3620] text-white rounded-full font-bold text-lg shadow-xl ring-2 ring-white ring-offset-2 ring-offset-[#FFF8F0] transition-all"
          >
            {t.hero_cta_order}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#fff", borderColor: "#FFD700" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                const menu = document.getElementById('menu');
                menu?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-12 py-5 bg-white/60 backdrop-blur-md text-accent border border-accent/20 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {t.hero_cta_explore}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;