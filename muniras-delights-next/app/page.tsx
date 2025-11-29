'use client'

import { useState } from 'react'
import { TRANSLATIONS } from '../constants/index'
import { Language, MenuItem } from '../types/index'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Hero from '../components/Hero'
import Menu from '../components/Menu'
import OrderForm from '../components/OrderForm'
import About from '../components/About'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import { ShoppingCart, Menu as MenuIcon, X, MapPin, Phone, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const [lang, setLang] = useState<Language>('en')
  const [isOrderOpen, setIsOrderOpen] = useState(false)
  const [cart, setCart] = useState<{ itemId: string; qty: number }[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const t = TRANSLATIONS[lang]

  // RTL handling for Arabic
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const fontFamily = 'font-sans'

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
        const existing = prev.find(i => i.itemId === item.id)
        if(existing) {
            return prev.map(i => i.itemId === item.id ? {...i, qty: i.qty + 1} : i)
        }
        return [...prev, { itemId: item.id, qty: 1 }]
    })
    setIsOrderOpen(true)
  }

  const cartTotalQty = cart.reduce((acc, i) => acc + i.qty, 0)

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${fontFamily} bg-[#FAFAFA]`}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="font-script text-3xl text-accent font-bold group-hover:text-primary transition-colors">
                Munira&apos;s
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {['home', 'menu', 'about', 'contact'].map((item) => (
                 <a 
                   key={item}
                   href={item === 'home' ? '#' : `#${item}`} 
                   className="text-gray-600 hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-secondary after:left-0 after:-bottom-1 hover:after:w-full after:transition-all"
                 >
                   {t[`nav_${item}` as keyof typeof t]}
                 </a>
              ))}
              
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              
              <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
              
              <button 
                onClick={() => setIsOrderOpen(true)}
                className="relative p-3 text-accent hover:bg-primary/10 rounded-full transition-colors group"
              >
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform"/>
                {cartTotalQty > 0 && (
                    <span className="absolute top-1 right-1 bg-secondary text-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {cartTotalQty}
                    </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
                <button 
                    onClick={() => setIsOrderOpen(true)}
                    className="relative p-2 text-accent"
                >
                    <ShoppingCart size={24} />
                    {cartTotalQty > 0 && (
                        <span className="absolute top-0 right-0 bg-secondary text-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cartTotalQty}
                        </span>
                    )}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-accent transition-colors">
                    {mobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-white border-t shadow-lg overflow-hidden"
                >
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {['home', 'menu', 'about', 'contact'].map((item) => (
                            <a 
                                key={item}
                                onClick={() => setMobileMenuOpen(false)} 
                                href={item === 'home' ? '#' : `#${item}`} 
                                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-primary/10 hover:text-accent rounded-lg transition-colors"
                            >
                                {t[`nav_${item}` as keyof typeof t]}
                            </a>
                        ))}
                        
                        {/* Mobile Language Selector - Explicit Buttons */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Language</p>
                            <div className="grid grid-cols-3 gap-2 px-2">
                                <button 
                                    onClick={() => { setLang('en'); setMobileMenuOpen(false); }}
                                    className={`py-2 px-1 rounded-md text-sm font-medium transition-all ${lang === 'en' ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    English
                                </button>
                                <button 
                                    onClick={() => { setLang('am'); setMobileMenuOpen(false); }}
                                    className={`py-2 px-1 rounded-md text-sm font-medium transition-all ${lang === 'am' ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    አማርኛ
                                </button>
                                <button 
                                    onClick={() => { setLang('ar'); setMobileMenuOpen(false); }}
                                    className={`py-2 px-1 rounded-md text-sm font-medium transition-all ${lang === 'ar' ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    العربية
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        <Hero t={t} onOrderClick={() => setIsOrderOpen(true)} />
        <Menu t={t} lang={lang} addToCart={addToCart} />
        <About t={t} />
        <Testimonials t={t} lang={lang} />
        
        {/* Contact Section - Advanced Design */}
        <section id="contact" className="py-24 px-4 bg-white relative">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
             
             <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-secondary font-bold tracking-widest uppercase text-sm">{t.contact_subtitle}</span>
                    <h2 className="text-5xl font-script text-accent mt-2">{t.contact_title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Address Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:border-primary/30 transition-all"
                    >
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.contact_visit}</h3>
                        <p className="text-gray-500">Bole Atlas, Next to Sapphire Addis</p>
                        <p className="text-gray-500">Addis Ababa, Ethiopia</p>
                    </motion.div>

                    {/* Phone Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:border-primary/30 transition-all"
                    >
                         <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.contact_call}</h3>
                        <p className="text-gray-500 font-mono">+251 911 234 567</p>
                        <p className="text-gray-500 font-mono">+251 912 345 678</p>
                    </motion.div>

                    {/* Hours Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:border-primary/30 transition-all"
                    >
                         <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.contact_hours}</h3>
                        <p className="text-gray-500">Mon - Sat: 8:00 AM - 9:00 PM</p>
                        <p className="text-gray-500">Sunday: 10:00 AM - 8:00 PM</p>
                    </motion.div>
                </div>
            </div>
        </section>
      </main>

      <Footer t={t} />

      {/* Order Modal */}
      <OrderForm 
        t={t} 
        lang={lang}
        isOpen={isOrderOpen} 
        onClose={() => setIsOrderOpen(false)} 
        initialCart={cart}
      />
    </div>
  )
}