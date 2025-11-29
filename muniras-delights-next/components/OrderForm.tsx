"use client";
import React, { useState, useRef } from 'react';
import { Translations, Language, MenuItem, OrderData } from '../types';
import { MENU_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  t: Translations[Language];
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  initialCart: { itemId: string; qty: number }[];
}

const OrderForm: React.FC<Props> = ({ t, lang, isOpen, onClose, initialCart }) => {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<{ itemId: string; qty: number }[]>(initialCart);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', deliveryDate: '' });
  const [file, setFile] = useState<File | null>(null);

  // Sync initial cart if it changes (simple effect)
  React.useEffect(() => {
    if (initialCart.length > 0) {
        // Merge or replace logic could go here, for now simpler is replace if empty
        if(cart.length === 0) setCart(initialCart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCart]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === id);
      if (!existing && delta > 0) return [...prev, { itemId: id, qty: 1 }];
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => i.itemId !== id);
        return prev.map(i => i.itemId === id ? { ...i, qty: newQty } : i);
      }
      return prev;
    });
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const product = MENU_ITEMS.find(p => p.id === item.itemId);
      return acc + (product ? product.price * item.qty : 0);
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const orderData: OrderData = {
      items: cart.map(c => ({ id: c.itemId, quantity: c.qty })),
      customer,
      paymentMethod: 'bank_transfer',
      screenshot: file
    };
    console.log("Order Submitted:", orderData);
    setStep(5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-script text-accent">Order Process</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <motion.div 
            className="bg-secondary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="p-6 flex-1">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Select Items */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold mb-4 text-accent">{t.order_step_1}</h3>
                <div className="space-y-4">
                  {MENU_ITEMS.map(item => {
                    const inCart = cart.find(c => c.itemId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name[lang]} className="w-16 h-16 object-cover rounded-md" />
                          <div>
                            <p className="font-bold">{item.name[lang]}</p>
                            <p className="text-sm text-gray-500">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">-</button>
                          <span className="font-bold w-6 text-center">{inCart?.qty || 0}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full bg-primary text-accent hover:bg-opacity-80 flex items-center justify-center">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-right">
                    <p className="text-xl font-bold">Total: ${calculateTotal()}</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Details */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4 text-accent">{t.order_step_2}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.label_name}</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                            value={customer.name}
                            onChange={e => setCustomer({...customer, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.label_phone}</label>
                        <input 
                            type="tel" 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                            value={customer.phone}
                            onChange={e => setCustomer({...customer, phone: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.label_address}</label>
                        <textarea 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                            value={customer.address}
                            onChange={e => setCustomer({...customer, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.label_date}</label>
                        <input 
                            type="date" 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                            value={customer.deliveryDate}
                            onChange={e => setCustomer({...customer, deliveryDate: e.target.value})}
                        />
                    </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Info */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold mb-4 text-accent">{t.order_step_3}</h3>
                <div className="bg-background p-6 rounded-xl border border-secondary text-center">
                    <p className="text-lg mb-4">{t.bank_instruction}</p>
                    <p className="text-3xl font-bold text-accent mb-2">${calculateTotal()}</p>
                    <p className="text-sm text-gray-500">Bank of Abyssinia / Commercial Bank of Ethiopia</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Upload */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold mb-4 text-accent">{t.order_step_4}</h3>
                <div className="border-2 border-dashed border-primary rounded-xl p-8 text-center bg-gray-50 hover:bg-primary/5 transition-colors relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <Upload size={48} className="text-accent mb-2" />
                        <span className="font-semibold text-accent">{file ? file.name : t.btn_upload}</span>
                        {file && <p className="text-green-600 mt-2 text-sm"><Check size={16} className="inline"/> Ready</p>}
                    </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                 {/* Simple Confetti Particles */}
                 {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={i}
                     className="absolute w-3 h-3 bg-primary rounded-full"
                     initial={{ x: 0, y: 0, opacity: 1 }}
                     animate={{ 
                       x: (Math.random() - 0.5) * 400, 
                       y: (Math.random() - 0.5) * 400,
                       opacity: 0 
                     }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     style={{ left: '50%', top: '50%', backgroundColor: ['#F7CAC9', '#FFD700', '#6B4226'][i % 3] }}
                   />
                 ))}

                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-accent mb-2">{t.success_title}</h3>
                <p className="text-gray-600 mb-6">{t.success_message}</p>
                <button 
                    onClick={() => window.open("https://t.me/@Mesh_brnfzu", "_blank")}
                    className="bg-[#0088cc] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0077b5] transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-2.02-1.23-2.02-1.23s-.7-.44.02-1.16c.17-.16 3.42-3.13 3.48-3.39.01-.03.01-.15-.06-.21s-.19-.04-.27-.02c-.11.02-1.87 1.18-5.28 3.46-.49.34-.94.51-1.34.5-.44-.01-1.29-.25-1.92-.42-.77-.21-1.38-.32-1.32-.88.03-.29.43-.59 1.18-.9 4.62-2.01 7.71-3.34 9.27-3.99 2.66-1.11 3.21-1.3 3.57-1.3.08 0 .26.02.37.12.09.08.12.19.13.27-.01.07.01.27 0 .44z"/></svg>
                    {t.telegram_btn}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="p-6 border-t flex justify-between bg-gray-50">
            {step > 1 && (
                <button 
                    onClick={() => setStep(s => s - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                   {lang === 'ar' ? <ArrowRight size={18}/> : <ArrowLeft size={18}/>} {t.btn_back}
                </button>
            )}
            <div className="flex-1"></div> {/* Spacer */}
            <button 
                onClick={() => {
                    if (step === 1 && cart.length === 0) return alert("Please select items");
                    if (step === 2 && (!customer.name || !customer.phone)) return alert("Please fill details");
                    if (step === 4) handleSubmit();
                    else setStep(s => s + 1);
                }}
                className="px-8 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 font-bold"
            >
                {step === 4 ? t.btn_submit : t.btn_next} {lang === 'ar' ? <ArrowLeft size={18}/> : <ArrowRight size={18}/>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderForm;
