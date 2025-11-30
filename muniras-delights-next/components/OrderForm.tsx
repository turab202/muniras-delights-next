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

// Simple toast system
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          &times;
        </button>
      </div>
    </motion.div>
  );
};

const OrderForm: React.FC<Props> = ({ t, lang, isOpen, onClose, initialCart }) => {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<{ itemId: string; qty: number }[]>(initialCart);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', deliveryDate: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToast({ message, type });
  };

  // Sync initial cart if it changes
  React.useEffect(() => {
    if (initialCart.length > 0) {
      if (cart.length === 0) setCart(initialCart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCart]);

  // Mobile-specific: Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Mobile-optimized quantity update with touch feedback
  const updateQty = (id: string, delta: number) => {
    // Add haptic feedback on mobile if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
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

  // Mobile-optimized file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      setFile(selectedFile);
      showToast('File selected successfully!', 'success');
    }
  };

  // Mobile-optimized validation
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (cart.length === 0) {
          showToast('Please select at least one item', 'warning');
          return false;
        }
        return true;
      
      case 2:
        if (!customer.name.trim()) {
          showToast('Please enter your name', 'warning');
          return false;
        }
        if (!customer.phone.trim()) {
          showToast('Please enter your phone number', 'warning');
          return false;
        }
        
        // Mobile-optimized phone validation
        const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
        if (!phoneRegex.test(customer.phone.replace(/\s/g, ''))) {
          showToast('Please enter a valid phone number', 'warning');
          return false;
        }
        
        if (!customer.deliveryDate) {
          showToast('Please select a delivery date', 'warning');
          return false;
        }
        return true;
      
      case 4:
        if (!file) {
          showToast('Please upload payment screenshot', 'warning');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Mobile-optimized form submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);

    try {
      const orderData = {
        items: cart.map(c => ({ id: c.itemId, quantity: c.qty })),
        customer,
        paymentMethod: 'bank_transfer',
        total: calculateTotal()
      };

      console.log('📦 Submitting order:', orderData);

      let response;
      let result;

      if (file) {
        // If there's a file, use the upload endpoint
        const formData = new FormData();
        formData.append('screenshot', file);
        formData.append('orderData', JSON.stringify(orderData));

        response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        // If no file, use the order endpoint directly
        response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
      }

      result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit order');
      }

      if (result.success) {
        console.log('✅ Order submitted successfully!');
        showToast('Order submitted successfully! Munira will contact you soon.', 'success');
        setStep(5);
      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (err) {
      console.error('Order submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit order. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile-optimized navigation
  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      
      // Scroll to top on step change for mobile
      if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBackStep = () => {
    setStep(s => s - 1);
    
    // Scroll to top on step change for mobile
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Mobile-optimized file upload trigger
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        ref={formRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col"
        style={{ 
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          touchAction: 'pan-y' // Better touch handling
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-script text-accent">Order Process</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 font-bold text-xl rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close order form"
          >
            &times;
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <motion.div 
            className="bg-secondary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-6 flex-1">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Select Items - Mobile Optimized */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-accent">{t.order_step_1}</h3>
                <div className="space-y-3">
                  {MENU_ITEMS.map(item => {
                    const inCart = cart.find(c => c.itemId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors bg-white">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img 
                            src={item.image} 
                            alt={item.name[lang]} 
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm sm:text-base truncate">{item.name[lang]}</p>
                            <p className="text-sm text-gray-500">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button 
                            onClick={() => updateQty(item.id, -1)} 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-colors touch-manipulation select-none text-lg font-bold"
                            aria-label={`Decrease ${item.name[lang]} quantity`}
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center text-sm sm:text-base">{inCart?.qty || 0}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)} 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-accent hover:bg-opacity-80 active:bg-opacity-70 flex items-center justify-center transition-colors touch-manipulation select-none text-lg font-bold"
                            aria-label={`Increase ${item.name[lang]} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-right">
                  <p className="text-lg sm:text-xl font-bold">Total: ${calculateTotal()}</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Details - Mobile Optimized */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-accent">{t.order_step_2}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.label_name}</label>
                    <input 
                      type="text" 
                      className="w-full p-3 sm:p-4 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors text-base"
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.label_phone}</label>
                    <input 
                      type="tel" 
                      className="w-full p-3 sm:p-4 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors text-base"
                      value={customer.phone}
                      onChange={e => setCustomer({...customer, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.label_address}</label>
                    <textarea 
                      className="w-full p-3 sm:p-4 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors text-base resize-none"
                      value={customer.address}
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                      placeholder="Enter delivery address"
                      rows={3}
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.label_date}</label>
                    <input 
                      type="date" 
                      className="w-full p-3 sm:p-4 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors text-base"
                      value={customer.deliveryDate}
                      onChange={e => setCustomer({...customer, deliveryDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
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
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-accent">{t.order_step_3}</h3>
                <div className="bg-background p-4 sm:p-6 rounded-xl border border-secondary text-center">
                  <p className="text-base sm:text-lg mb-4">{t.bank_instruction}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-accent mb-2">${calculateTotal()}</p>
                  <p className="text-sm text-gray-500">Bank of Abyssinia / Commercial Bank of Ethiopia</p>
                  <div className="mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      💡 <strong>Important:</strong> Please upload the payment screenshot in the next step
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Upload - Mobile Optimized */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-accent">{t.order_step_4}</h3>
                
                {/* Hidden file input */}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  capture="environment" // Mobile camera support
                />
                
                {/* Custom upload area */}
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-primary rounded-xl p-6 sm:p-8 text-center bg-gray-50 hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer touch-manipulation"
                >
                  <div className="flex flex-col items-center">
                    <Upload size={40} className="text-accent mb-3" />
                    <span className="font-semibold text-accent text-base sm:text-lg">
                      {file ? file.name : t.btn_upload}
                    </span>
                    {file ? (
                      <p className="text-green-600 mt-2 text-sm flex items-center gap-1">
                        <Check size={16} className="inline"/> Ready to submit
                      </p>
                    ) : (
                      <p className="text-gray-500 mt-2 text-sm">Tap to upload payment screenshot</p>
                    )}
                  </div>
                </div>
                
                {file && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 text-sm flex items-center gap-2">
                      <Check size={16} /> File selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <button 
                      onClick={() => setFile(null)}
                      className="mt-2 text-red-600 text-sm flex items-center gap-1 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={14} /> Remove file
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 sm:py-8"
              >
                {/* Simple Confetti Particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 300, 
                      y: (Math.random() - 0.5) * 300,
                      opacity: 0 
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ left: '50%', top: '50%', backgroundColor: ['#F7CAC9', '#FFD700', '#6B4226'][i % 3] }}
                  />
                ))}

                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-accent mb-2">{t.success_title}</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{t.success_message}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                  Munira has received your order and will contact you shortly at {customer.phone}
                </p>
                <button 
                  onClick={onClose}
                  className="bg-accent text-white px-6 py-3 rounded-full font-bold hover:bg-opacity-90 active:bg-opacity-80 transition-colors text-base"
                >
                  Close Window
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation - Mobile Optimized */}
        {step < 5 && (
          <div className="p-4 sm:p-6 border-t flex justify-between items-center bg-gray-50 gap-3">
            {step > 1 && (
              <button 
                onClick={handleBackStep}
                disabled={isLoading}
                className="px-4 sm:px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-1 justify-center text-sm sm:text-base"
              >
                {lang === 'ar' ? <ArrowRight size={18}/> : <ArrowLeft size={18}/>} {t.btn_back}
              </button>
            )}
            
            <button 
              onClick={step === 4 ? handleSubmit : handleNextStep}
              disabled={isLoading}
              className="px-6 sm:px-8 py-3 bg-accent text-white rounded-xl hover:bg-opacity-90 active:bg-opacity-80 flex items-center gap-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-1 justify-center text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {step === 4 ? 'Submitting...' : 'Loading...'}
                </>
              ) : (
                <>
                  {step === 4 ? t.btn_submit : t.btn_next} 
                  {lang === 'ar' ? <ArrowLeft size={18}/> : <ArrowRight size={18}/>}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderForm;