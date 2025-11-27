
export interface PricePoint {
  date: string;
  price: number;
}

export interface StoreOffer {
  storeName: string;
  price: number; // The listed price
  effectivePrice?: number; // Price after applying bank offers/coins
  originalPrice?: number; // The MRP or strike-through price
  currency: string;
  link: string;
  inStock: boolean;
  rating: number; // 0-5
  offers?: string[]; // Array of strings like "5% Axis Cashback", "Use 200 SuperCoins"
  offerExpiry?: string; // ISO Date string for when the deal ends
}

export interface AlternativeProduct {
  name: string;
  price: number;
  reason: string;
}

export interface Accessory {
  name: string;
  type: string;
  estimatedPrice: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountAmount?: number;
}

export interface EMIPlan {
  bank: string;
  months: number;
  rate: number;
  monthlyAmount: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  refinedQuery?: string;
  description: string;
  imageUrl: string;
  offers: StoreOffer[];
  priceHistory: PricePoint[];
  overallRating: number;
  reviewCount: number;
  features: string[];
  alternatives?: AlternativeProduct[];
  
  // New AI Features
  pros?: string[];
  cons?: string[];
  sustainabilityScore?: number; // 1-10
  sustainabilityReason?: string;
  pricePrediction?: {
    trend: 'UP' | 'DOWN' | 'STABLE';
    advice: 'BUY_NOW' | 'WAIT';
    confidence: number; // 0-100
  };
  coupons?: Coupon[];
  specs?: Record<string, string>; // Key-value pairs like "RAM": "8GB"
  returnPolicy?: string;
  
  // Mega Update Features
  accessories?: Accessory[];
  unboxingLink?: string; // YouTube search URL
  isGstInvoiceAvailable?: boolean;
  offlineAvailability?: string[]; // e.g., ["Croma", "Reliance Digital"]
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserStats {
  totalSaved: number;
  dealsFound: number;
  level: string;
  isPremium: boolean;
  referrals: number;
}

export interface CommunityDeal {
  id: string;
  user: string;
  productName: string;
  price: string;
  store: string;
  votes: number;
  timeAgo: string;
  imageUrl: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: ProductDetails | null;
}

export enum InputMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE'
}

export type FeedbackReason = 'wrong_price' | 'out_of_stock' | 'better_price_found' | 'other';

// Global definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
