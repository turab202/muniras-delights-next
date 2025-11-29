export type Language = 'en' | 'am' | 'ar';

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: 'cakes' | 'pastries' | 'catering' | 'icecream';
  image: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  deliveryDate: string;
}

export interface OrderData {
  items: OrderItem[];
  customer: CustomerInfo;
  paymentMethod: string;
  screenshot?: File | null;
}

export interface Testimonial {
  id: number;
  name: Record<Language, string>;
  text: Record<Language, string>;
  rating: number;
}

export type TranslationKey = 
  | 'nav_home' | 'nav_menu' | 'nav_about' | 'nav_contact'
  | 'hero_title' | 'hero_subtitle' | 'hero_cta_order' | 'hero_cta_explore' | 'hero_est'
  | 'typing_phrase_1' | 'typing_phrase_2' | 'typing_phrase_3' | 'typing_phrase_4' | 'typing_phrase_5' | 'typing_phrase_6' | 'typing_phrase_7'
  | 'menu_title' | 'menu_subtitle' | 'menu_selection' | 'menu_no_items'
  | 'menu_filter_all' | 'menu_filter_cakes' | 'menu_filter_pastries' | 'menu_filter_catering' | 'menu_filter_icecream'
  | 'order_step_1' | 'order_step_2' | 'order_step_3' | 'order_step_4' | 'order_step_5'
  | 'btn_next' | 'btn_back' | 'btn_submit' | 'btn_upload'
  | 'label_name' | 'label_phone' | 'label_address' | 'label_date'
  | 'bank_instruction' | 'success_title' | 'success_message' | 'telegram_btn'
  | 'about_title' | 'about_story' | 'about_signature'
  | 'testimonials_title'
  | 'contact_title' | 'contact_subtitle' | 'contact_visit' | 'contact_call' | 'contact_hours'
  | 'footer_desc' | 'footer_rights' | 'footer_made_with' | 'footer_by';

export type Translations = Record<Language, Record<TranslationKey, string>>;