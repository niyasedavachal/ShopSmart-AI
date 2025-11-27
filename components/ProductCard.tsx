import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, ExternalLink, TrendingDown, TrendingUp, CheckCircle, ShoppingCart, Award, ShieldCheck, Share2, Copy, ArrowRightLeft, Sparkles, Heart, CreditCard, Coins, Tag, Clock, SlidersHorizontal, X, RotateCcw, ThumbsUp, ThumbsDown, Leaf, MessageCircle, Send, Calculator, Info, Youtube, MapPin, Briefcase, Bell, PlusCircle, MonitorPlay, Zap, Flag, AlertTriangle, Crown } from 'lucide-react';
import { ProductDetails, StoreOffer, ChatMessage, FeedbackReason } from '../types';
import PriceChart from './PriceChart';
import { chatWithProduct } from '../services/geminiService';

// --- ROBUST PLACEHOLDER IMAGE (Data URI) ---
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2364748b'%3EProduct Image%3C/text%3E%3C/svg%3E";

interface ProductCardProps {
  product: ProductDetails;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isPremium?: boolean;
  theme?: 'dark' | 'light';
  performSearch?: (query: string) => void;
}

// --- Authentic Store Branding Configuration ---
const getStoreTheme = (storeName: string) => {
  const name = storeName.toLowerCase();
  
  if (name.includes('amazon')) {
    return {
      // Amazon Yellow Button with Dark Blue Text
      btnStyle: { backgroundColor: '#FFD814', color: '#0F1111', borderRadius: '20px', fontWeight: '500', boxShadow: '0 2px 5px rgba(213, 217, 217, 0.5)' },
      btnText: 'View on Amazon',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      logoBg: 'bg-white', // Amazon logo needs white bg
      borderColor: 'border-[#FFD814]',
      label: 'Amazon'
    };
  }
  if (name.includes('flipkart')) {
    return {
      // Flipkart Orange/Yellow CTA with White Text
      btnStyle: { backgroundColor: '#fb641b', color: '#ffffff', borderRadius: '2px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },
      btnText: 'Check on Flipkart',
      logoUrl: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fk-header-mobile-logo-bafb3a.svg',
      logoBg: 'bg-[#2874f0]', // Flipkart Blue bg for logo container
      borderColor: 'border-[#2874f0]',
      label: 'Flipkart'
    };
  }
  if (name.includes('croma')) {
    return {
      // Croma Teal
      btnStyle: { backgroundColor: '#00E9BF', color: '#121212', borderRadius: '8px', fontWeight: '600' },
      btnText: 'View Price',
      logoUrl: 'https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1637759004/Croma%20Assets/CMS/Category%20icon/Croma_Logo_acr5n6.svg',
      logoBg: 'bg-black',
      borderColor: 'border-[#00E9BF]',
      label: 'Croma'
    };
  }
  if (name.includes('reliance') || name.includes('digital')) {
    return {
      // Reliance Red
      btnStyle: { backgroundColor: '#E42529', color: '#ffffff', borderRadius: '4px', fontWeight: '700' },
      btnText: 'View Offer',
      logoUrl: 'https://www.reliancedigital.in/build/client/images/loaders/rd_logo.svg',
      logoBg: 'bg-[#003380]', // Reliance Digital Header Blue
      borderColor: 'border-[#E42529]',
      label: 'Reliance Digital'
    };
  }
  if (name.includes('myntra')) {
    return {
      // Myntra Pink
      btnStyle: { backgroundColor: '#ff3f6c', color: '#ffffff', borderRadius: '4px', fontWeight: '700' },
      btnText: 'View on Myntra',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
      logoBg: 'bg-white',
      borderColor: 'border-[#ff3f6c]',
      label: 'Myntra'
    };
  }
  if (name.includes('ajio')) {
    return {
      // Ajio Black
      btnStyle: { backgroundColor: '#2C4152', color: '#ffffff', borderRadius: '0px', fontWeight: '600' },
      btnText: 'View on Ajio',
      logoUrl: 'https://assets.ajio.com/static/img/Ajio-Logo.svg',
      logoBg: 'bg-white',
      borderColor: 'border-[#2C4152]',
      label: 'Ajio'
    };
  }

  // Default Fallback
  return {
    btnStyle: { backgroundColor: '#334155', color: '#ffffff', borderRadius: '8px', fontWeight: '600' },
    btnText: 'Visit Store',
    logoUrl: null,
    logoBg: 'bg-slate-700',
    borderColor: 'border-slate-600',
    label: storeName
  };
};

const StoreRow: React.FC<{ offer: StoreOffer; bestPrice: number; index: number; isPremium?: boolean; theme?: 'dark' | 'light' }> = ({ offer, bestPrice, index, isPremium, theme }) => {
  const price = offer.price || 0;
  const effectivePrice = offer.effectivePrice || price;
  const isBestPrice = effectivePrice <= bestPrice;
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  // Track if logo failed to load
  const [logoError, setLogoError] = useState(false);
  
  const storeTheme = getStoreTheme(offer.storeName);
  const fmt = (val: number | undefined) => (val || 0).toLocaleString('en-IN');

  useEffect(() => {
    if (!offer.offerExpiry) return;
    const calculateTimeLeft = () => {
      const difference = +new Date(offer.offerExpiry!) - +new Date();
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      return null;
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => { setTimeLeft(calculateTimeLeft()); }, 1000); 
    return () => clearInterval(timer);
  }, [offer.offerExpiry]);

  // Theme Styling Logic
  const isLight = theme === 'light';
  
  const containerClass = isLight 
    ? `bg-white border-slate-200 shadow-md ${isBestPrice ? 'border-emerald-300 ring-1 ring-emerald-100' : ''}`
    : `bg-slate-800/40 border-slate-700/50 ${isBestPrice ? 'bg-emerald-950/30 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`;

  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textSecondary = isLight ? 'text-slate-500' : 'text-slate-400';
  const innerCardBg = isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5';
  const dividerColor = isLight ? 'bg-slate-200' : 'bg-white/10';

  return (
    <div 
      className={`relative flex flex-col p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border opacity-0 animate-fade-in-up h-full ${containerClass}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {isBestPrice && (
        <div className="absolute -top-2.5 left-4 bg-emerald-500 text-black text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-lg shadow-emerald-500/20 z-10 flex items-center gap-1">
          <Award size={10} /> Best Deal
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 mt-2 gap-3">
         <div className="flex items-center gap-3">
            {/* Store Logo Section */}
            <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm ${storeTheme.logoBg} ${isLight ? 'border border-slate-100' : ''}`}>
                {storeTheme.logoUrl && !logoError ? (
                   <img 
                    src={storeTheme.logoUrl} 
                    alt={offer.storeName} 
                    className="w-full h-full object-contain p-2" 
                    onError={() => setLogoError(true)}
                   />
                ) : (
                  <div className="text-white font-bold text-xs">{offer.storeName.substring(0, 3).toUpperCase()}</div>
                )}
            </div>
            
            {/* Store Name & Stock */}
            <div>
              <div className={`font-bold text-base leading-tight ${textPrimary}`}>{storeTheme.label}</div>
              <div className="flex items-center text-[10px] text-slate-400 gap-2 mt-0.5">
                 <span className={offer.inStock ? "text-emerald-500 font-bold" : "text-red-500"}>{offer.inStock ? 'In Stock' : 'No Stock'}</span>
              </div>
            </div>
         </div>
         
         <div className="flex items-center gap-1 text-[11px] font-bold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg">
            {offer.rating} <Star size={10} className="fill-yellow-500 stroke-yellow-500" />
         </div>
      </div>
      
      <div className={`rounded-xl p-4 border flex-1 flex flex-col ${innerCardBg}`}>
          <div className="flex justify-between items-center mb-1">
             <span className={`text-xs ${textSecondary}`}>Listed Price</span>
             <span className={`text-sm font-semibold strike-through decoration-slate-400 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(price)}</span>
          </div>
          
          <div className="space-y-1.5 mb-3 flex-1">
              {offer.offers && offer.offers.length > 0 ? offer.offers.map((off, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px] text-emerald-500 font-medium">
                    <span className="flex items-center gap-1.5 leading-tight"><Tag size={12} className="shrink-0" /> {off}</span>
                </div>
              )) : (
                 <div className={`text-[11px] italic ${textSecondary}`}>No extra offers</div>
              )}
          </div>
          
          {timeLeft && (
              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1.5 rounded-lg w-full justify-center mb-3 border ${isLight ? 'bg-orange-50 text-orange-600 border-orange-200' : 'text-orange-400 bg-orange-950/30 border-orange-500/20'}`}>
                <Clock size={12} /> Deal ends in {timeLeft}
              </div>
          )}

          <div className={`h-px mb-3 ${dividerColor}`}></div>
          
          <div className="flex justify-between items-end mb-4">
             <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isBestPrice ? 'text-emerald-500' : textSecondary}`}>Effective Price</span>
                <span className={`text-2xl font-black ${isBestPrice ? 'text-emerald-500' : textPrimary}`}>
                  ₹{fmt(effectivePrice)}
                </span>
             </div>
          </div>

           {/* Authentic Buy Button - Full Width */}
           <a 
             href={offer.link} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
             style={storeTheme.btnStyle}
             onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50); }}
           >
              {storeTheme.btnText} <ExternalLink size={14} className="opacity-70"/>
            </a>
      </div>
    </div>
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
       <div className="rounded-3xl overflow-hidden mb-8 h-[400px] bg-slate-200 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
       </div>
       <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-800/50 rounded-full"></div>)}
       </div>
       <div className="grid md:grid-cols-12 gap-8">
           <div className="md:col-span-8 space-y-6">
               <div className="h-40 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
               <div className="h-24 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
               <div className="h-24 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
           </div>
           <div className="md:col-span-4 space-y-6">
               <div className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
           </div>
       </div>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite, onToggleFavorite, isPremium, theme = 'dark', performSearch }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'specs' | 'finance'>('overview');
  const [copied, setCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  
  // Compare Modal State
  const [showCompare, setShowCompare] = useState(false);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason>('wrong_price');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { allStores, minPrice, maxPrice, bestGlobalPrice, isPriceDropping } = useMemo(() => {
     const prices = product.offers.map(o => o.effectivePrice || o.price || 0);
     const currentAvg = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
     const lastHistoryPrice = product.priceHistory[product.priceHistory.length - 1]?.price || currentAvg;
     return {
         allStores: Array.from(new Set(product.offers.map(o => o.storeName))),
         minPrice: Math.min(...prices),
         maxPrice: Math.max(...prices),
         bestGlobalPrice: Math.min(...prices),
         isPriceDropping: currentAvg <= lastHistoryPrice
     };
  }, [product]);

  useEffect(() => {
    setSelectedStores(allStores);
    setPriceLimit(maxPrice);
    if (isPriceDropping) setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [product, allStores, maxPrice, isPriceDropping]);

  const handleShare = async () => {
    const validUrl = window.location.href.startsWith('http') ? window.location.href : 'https://shopsmart.ai';
    const text = `Found this effective price for ${product.name}: ₹${bestGlobalPrice.toLocaleString('en-IN')} on ShopSmart!`;
    
    try {
      if (navigator.share) {
        await navigator.share({ title: `Best Deal: ${product.name}`, text: text, url: validUrl });
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      navigator.clipboard.writeText(`${text} ${validUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAlert = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setAlertSet(!alertSet);
  };

  const submitFeedback = () => {
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSubmitted(false);
    }, 2000);
  };

  const handleChat = async (manualMsg?: string) => {
    const msgText = manualMsg || chatInput;
    if (!msgText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: msgText };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);
    
    const response = await chatWithProduct(product, chatHistory, msgText);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsChatting(false);
  };
  
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatting]);

  const filteredOffers = product.offers.filter(offer => {
    const p = offer.effectivePrice || offer.price || 0;
    if (selectedStores.length > 0 && !selectedStores.includes(offer.storeName)) return false;
    if (p > priceLimit) return false;
    return true;
  }).sort((a,b) => (a.effectivePrice || a.price) - (b.effectivePrice || b.price));

  // --- Theme Variables ---
  const isLight = theme === 'light';
  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textSecondary = isLight ? 'text-slate-500' : 'text-slate-400';
  const panelBg = isLight ? 'bg-white border-slate-200 shadow-xl' : 'glass-panel shadow-2xl shadow-black/50';
  const heroBg = isLight ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-900 to-slate-800';
  const tabActive = isLight ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-black shadow-lg shadow-white/10';
  const tabInactive = isLight ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white';
  const sectionBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/5';
  const badgeBg = isLight ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-violet-500/20 text-violet-300 border-violet-500/30';

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-fade-in-up relative">
      {/* Confetti */}
      {showConfetti && (
         <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
             {[...Array(20)].map((_, i) => (
                 <div key={i} className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-float" style={{ left: `${Math.random()*100}%`, top: '-10px', animationDuration: `${Math.random()*2+1}s` }}></div>
             ))}
         </div>
      )}

      {/* Hero */}
      <div className={`rounded-3xl overflow-hidden mb-8 ${panelBg}`}>
        <div className="md:flex">
          <div className={`md:w-5/12 relative p-8 flex items-center justify-center overflow-hidden ${heroBg}`}>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <div className={`absolute w-64 h-64 rounded-full blur-[100px] animate-pulse ${isLight ? 'bg-violet-400/30' : 'bg-violet-500/20'}`}></div>
             <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="relative w-full max-h-[350px] object-contain drop-shadow-2xl z-10 animate-float" 
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} 
             />
             <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button onClick={() => { if(navigator.vibrate) navigator.vibrate(50); onToggleFavorite && onToggleFavorite(); }} className="bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-all border border-white/10 group active:scale-90">
                  <Heart size={20} className={`transition-colors ${isFavorite ? "fill-pink-500 text-pink-500" : "text-white group-hover:text-pink-500"}`} />
                </button>
                <button onClick={handleShare} className="bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-all border border-white/10 text-white hover:text-cyan-400 active:scale-90">
                  {copied ? <CheckCircle size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                </button>
                <button onClick={handleAlert} className={`bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-all border border-white/10 text-white active:scale-90 ${alertSet ? 'text-yellow-400' : ''}`}>
                   <Bell size={20} className={alertSet ? 'fill-yellow-400' : ''}/>
                </button>
             </div>
             
             {/* 3D / Compare / Unboxing Actions */}
             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
                {product.unboxingLink && (
                  <a href={product.unboxingLink} target="_blank" rel="noopener noreferrer" className="bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-lg transition-transform hover:scale-105">
                     <Youtube size={12} /> Unboxing
                  </a>
                )}
                <button onClick={() => setShowCompare(true)} className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm border border-white/10 transition-transform hover:scale-105">
                   <ArrowRightLeft size={12} /> Compare
                </button>
             </div>
          </div>
          
          <div className="p-6 md:p-8 md:w-7/12 flex flex-col relative overflow-hidden">
            <div className="flex flex-col gap-1 mb-4 z-10">
               <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border ${badgeBg}`}>AI Verified</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${textSecondary}`}>
                     <Star size={14} className="text-yellow-500 fill-yellow-500" /> <span>{product.overallRating}</span>
                  </div>
                  {isPremium && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-full animate-pulse ${isLight ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border-yellow-500/20'}`}>
                        <Crown size={10} /> Pro Member
                     </span>
                  )}
                  {product.sustainabilityScore && (
                     <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-full ${isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20'}`}>
                        <Leaf size={10} /> Eco-Score: {product.sustainabilityScore}/10
                     </span>
                  )}
                  {product.isGstInvoiceAvailable && (
                     <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-full ${isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-500/20'}`}>
                        <Briefcase size={10} /> GST Invoice
                     </span>
                  )}
               </div>
               <h1 className={`text-2xl md:text-3xl font-black mb-2 leading-tight ${textPrimary}`}>{product.name}</h1>
               <p className={`text-xs md:text-sm line-clamp-3 ${textSecondary}`}>{product.description}</p>
            </div>

            <div className={`mt-auto pt-4 border-t flex flex-wrap items-center justify-between gap-4 z-10 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
               <div>
                  <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${textSecondary}`}>Market Best</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">₹{bestGlobalPrice.toLocaleString('en-IN')}</span>
                  </div>
               </div>
               {isPriceDropping ? (
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 backdrop-blur-sm ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'}`}>
                      <TrendingDown size={16} className="text-emerald-500"/>
                      <div><span className="text-xs font-bold uppercase block">Price Drop</span></div>
                  </div>
               ) : (
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 backdrop-blur-sm ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-950/40 border-orange-500/30 text-orange-400'}`}>
                       <TrendingUp size={16} className="text-orange-500"/>
                       <div><span className="text-xs font-bold uppercase block">High Demand</span></div>
                  </div>
               )}
            </div>
            {/* Feedback Widget Trigger */}
            <button 
              onClick={() => setShowFeedback(true)}
              className={`absolute top-4 right-4 p-2 transition-colors rounded-full z-30 ${isLight ? 'text-slate-400 hover:text-slate-900 bg-white/50 hover:bg-white' : 'text-slate-600 hover:text-orange-400 bg-white/5'}`}
              title="Report Issue"
            >
              <Flag size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
         {['overview', 'insights', 'specs', 'finance'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab ? tabActive : tabInactive}`}
           >
             {tab === 'insights' ? 'AI Insights' : tab}
           </button>
         ))}
      </div>

      {/* Content Areas */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column (Dynamic based on Tab) */}
        <div className="md:col-span-8 space-y-6">
           
           {activeTab === 'overview' && (
             <div className="space-y-4 animate-fade-in">
               <div className="flex items-center justify-between px-1">
                 <h3 className={`font-bold text-lg flex items-center gap-2 ${textPrimary}`}><ShoppingCart className="text-violet-500" size={20} /> Live Offers</h3>
                 <button onClick={() => setShowFilters(!showFilters)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 ${isLight ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}><SlidersHorizontal size={12} /> Filters</button>
               </div>
               
               {showFilters && (
                  <div className={`p-4 rounded-xl space-y-3 text-sm ${panelBg}`}>
                      <div className={`flex justify-between font-semibold ${textSecondary}`}><span>Max Price: ₹{priceLimit.toLocaleString()}</span></div>
                      <input type="range" min={minPrice} max={maxPrice} value={priceLimit} onChange={(e) => setPriceLimit(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none accent-cyan-500"/>
                  </div>
               )}

               {/* -- PARALLEL GRID LAYOUT FOR OFFERS -- */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredOffers.map((offer, idx) => (
                    <StoreRow key={idx} offer={offer} bestPrice={bestGlobalPrice} index={idx} isPremium={isPremium} theme={theme} />
                  ))}
               </div>
             
               {product.accessories && (
                  <div className={`p-5 rounded-2xl mt-6 ${panelBg}`}>
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}><PlusCircle size={18} className="text-cyan-500"/> Compatible Accessories</h3>
                      <div className="grid grid-cols-2 gap-3">
                         {product.accessories.map((acc, i) => (
                            <div key={i} className={`p-3 rounded-xl border flex justify-between items-center group cursor-pointer transition-colors ${sectionBg} ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                               <div>
                                  <div className={`text-sm font-semibold transition-colors ${textPrimary} group-hover:text-cyan-500`}>{acc.name}</div>
                                  <div className={`text-[10px] uppercase font-bold ${textSecondary}`}>{acc.type}</div>
                               </div>
                               <div className="text-xs font-bold text-emerald-500">~₹{acc.estimatedPrice}</div>
                            </div>
                         ))}
                      </div>
                  </div>
               )}
             </div>
           )}

           {activeTab === 'insights' && (
             <div className="space-y-6 animate-fade-in">
                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-4">
                   <div className={`border p-5 rounded-2xl ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
                      <h4 className="flex items-center gap-2 font-bold text-emerald-500 mb-4"><ThumbsUp size={18} /> Pros</h4>
                      <ul className="space-y-2">
                         {product.pros?.map((pro, i) => <li key={i} className={`text-sm flex gap-2 ${textSecondary}`}><CheckCircle size={14} className="mt-0.5 text-emerald-500 shrink-0"/> {pro}</li>) || <li className="text-slate-500 text-sm italic">Analyzing reviews...</li>}
                      </ul>
                   </div>
                   <div className={`border p-5 rounded-2xl ${isLight ? 'bg-red-50 border-red-100' : 'bg-red-950/20 border-red-500/20'}`}>
                      <h4 className="flex items-center gap-2 font-bold text-red-500 mb-4"><ThumbsDown size={18} /> Cons</h4>
                      <ul className="space-y-2">
                         {product.cons?.map((con, i) => <li key={i} className={`text-sm flex gap-2 ${textSecondary}`}><X size={14} className="mt-0.5 text-red-500 shrink-0"/> {con}</li>) || <li className="text-slate-500 text-sm italic">Analyzing reviews...</li>}
                      </ul>
                   </div>
                </div>
                
                {/* Price Prediction */}
                <div className={`p-6 rounded-2xl flex items-center gap-6 ${panelBg}`}>
                    <div className={`p-4 rounded-full ${isLight ? 'bg-violet-100 text-violet-600' : 'bg-violet-500/20 text-violet-400'}`}>
                       <Sparkles size={32} />
                    </div>
                    <div>
                       <h4 className={`font-bold text-lg ${textPrimary}`}>AI Price Prediction</h4>
                       <p className={`text-sm mb-2 ${textSecondary}`}>Based on product lifecycle and historical trends.</p>
                       <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${product.pricePrediction?.advice === 'BUY_NOW' ? 'bg-emerald-500 text-black' : 'bg-orange-500 text-black'}`}>
                             {product.pricePrediction?.advice?.replace('_', ' ') || 'HOLD'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Confidence: {product.pricePrediction?.confidence || 85}%</span>
                       </div>
                    </div>
                </div>
             </div>
           )}

           {activeTab === 'specs' && (
              <div className={`p-6 rounded-2xl animate-fade-in ${panelBg}`}>
                 <h3 className={`font-bold mb-4 ${textPrimary}`}>Technical Specifications</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specs || { "Status": "Specs unavailable" }).map(([key, val], i) => (
                       <div key={i} className={`p-3 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{key}</span>
                          <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{val}</span>
                       </div>
                    ))}
                 </div>
                 {product.returnPolicy && (
                    <div className={`mt-6 p-4 rounded-xl border flex gap-3 items-start ${sectionBg}`}>
                       <RotateCcw className="text-orange-400 shrink-0" size={20} />
                       <div>
                          <h5 className={`font-bold text-sm ${textPrimary}`}>Return Policy</h5>
                          <p className={`text-xs ${textSecondary}`}>{product.returnPolicy}</p>
                       </div>
                    </div>
                 )}
                 {product.offlineAvailability && (
                    <div className={`mt-3 p-4 rounded-xl border flex gap-3 items-start ${sectionBg}`}>
                       <MapPin className="text-blue-400 shrink-0" size={20} />
                       <div>
                          <h5 className={`font-bold text-sm ${textPrimary}`}>Available Offline</h5>
                          <p className={`text-xs ${textSecondary}`}>Likely available at: {product.offlineAvailability.join(', ')}</p>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {activeTab === 'finance' && (
              <div className="space-y-6 animate-fade-in">
                 {/* Coupons */}
                 <div className={`p-5 rounded-2xl ${panelBg}`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}><Tag className="text-pink-500" /> Available Coupons</h3>
                    <div className="grid gap-3">
                       {product.coupons?.map((c, i) => (
                          <div key={i} className={`flex justify-between items-center border p-3 rounded-xl border-dashed ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-white/5 border-white/10'}`}>
                             <div>
                                <div className="text-pink-500 font-mono font-bold text-lg">{c.code}</div>
                                <div className={`text-xs ${textSecondary}`}>{c.description}</div>
                             </div>
                             <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">Copy</button>
                          </div>
                       )) || <p className="text-sm text-slate-500">No specific coupons found.</p>}
                    </div>
                 </div>

                 {/* EMI Calculator */}
                 <div className={`p-6 rounded-2xl ${panelBg}`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}><Calculator className="text-cyan-500" /> EMI Estimator</h3>
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${sectionBg}`}>
                        <div>
                           <div className="text-xs text-slate-500 mb-1">Estimated Monthly Pay</div>
                           <div className="text-2xl font-bold text-cyan-500">₹{Math.round(bestGlobalPrice / 6).toLocaleString()}</div>
                           <div className="text-[10px] text-slate-500">for 6 months @ 15% p.a</div>
                        </div>
                        <button className={`text-xs font-bold underline ${textSecondary}`}>View Plans</button>
                    </div>
                 </div>
              </div>
           )}

        </div>

        {/* Right Column (Always Visible) */}
        <div className="md:col-span-4 space-y-6">
            <div className={`p-1 rounded-2xl ${panelBg}`}><PriceChart data={product.priceHistory} theme={theme} /></div>
            
            {/* Chat Floating Button & Modal */}
            <div className="fixed bottom-6 right-6 z-50">
               {!showChat ? (
                  <button onClick={() => setShowChat(true)} className="bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-full shadow-2xl shadow-violet-600/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 font-bold">
                     <MessageCircle /> Ask AI
                  </button>
               ) : (
                  <div className={`border rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden animate-scale-in ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                     <div className="bg-violet-600 p-4 flex justify-between items-center">
                        <h4 className="font-bold text-white flex items-center gap-2"><Sparkles size={16}/> ShopSmart AI</h4>
                        <button onClick={() => setShowChat(false)}><X size={18} className="text-white/70 hover:text-white"/></button>
                     </div>
                     <div className={`h-64 overflow-y-auto p-4 space-y-3 ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
                        {chatHistory.length === 0 && (
                            <div className="px-4 pb-2 mt-4">
                                <p className={`text-xs text-center mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Quick questions:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {["Is this good for gaming?", "How is the camera?", "Battery life?", "Is it worth the price?"].map((q) => (
                                        <button 
                                            key={q} 
                                            onClick={() => { setChatInput(q); handleChat(q); }}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isLight ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' : 'bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20'}`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {chatHistory.map((msg, i) => (
                           <div key={i} className={`text-sm p-3 rounded-xl max-w-[85%] ${msg.role === 'user' ? (isLight ? 'bg-slate-200 text-slate-800 ml-auto' : 'bg-slate-800 text-white ml-auto') : (isLight ? 'bg-violet-50 text-violet-800 border border-violet-100 mr-auto' : 'bg-violet-900/20 text-violet-200 border border-violet-500/20 mr-auto')}`}>
                              {msg.text}
                           </div>
                        ))}
                        {isChatting && <div className="text-xs text-slate-500 animate-pulse ml-2">AI is typing...</div>}
                        <div ref={chatEndRef} />
                     </div>
                     <div className={`p-3 border-t flex gap-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/5'}`}>
                        <input 
                           type="text" 
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                           placeholder="Is it good for gaming?"
                           className={`flex-1 border-none rounded-lg text-sm px-3 focus:ring-1 focus:ring-violet-500 ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-white'}`}
                        />
                        <button onClick={() => handleChat()} disabled={!chatInput.trim() || isChatting} className="bg-violet-600 p-2 rounded-lg text-white disabled:opacity-50"><Send size={16}/></button>
                     </div>
                  </div>
               )}
            </div>
        </div>
      </div>
      
      {/* Compare Modal */}
      {showCompare && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className={`border w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col animate-scale-in ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                  {/* Header */}
                  <div className={`p-6 border-b flex justify-between items-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/5'}`}>
                      <div>
                          <h2 className={`text-2xl font-black ${textPrimary}`}>Compare Products</h2>
                          <p className={`text-sm ${textSecondary}`}>See how it stacks up against the best alternatives.</p>
                      </div>
                      <button onClick={() => setShowCompare(false)} className={`p-2 rounded-full ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}><X size={24}/></button>
                  </div>
                  
                  {/* Comparison Grid */}
                  <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Current Product */}
                      <div className={`p-6 rounded-2xl border-2 border-violet-500/50 relative ${isLight ? 'bg-white shadow-xl' : 'bg-slate-800/50'}`}>
                          <div className="absolute top-4 right-4 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">CURRENT</div>
                          <img src={product.imageUrl} className="h-40 w-full object-contain mb-4" />
                          <h3 className={`font-bold text-lg mb-2 leading-tight ${textPrimary}`}>{product.name}</h3>
                          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 mb-6">₹{bestGlobalPrice.toLocaleString()}</div>
                          
                          <div className="space-y-4">
                              <div><div className={`text-xs font-bold uppercase ${textSecondary} mb-1`}>Rating</div><div className={`font-medium ${textPrimary}`}>{product.overallRating}/5</div></div>
                              <div><div className={`text-xs font-bold uppercase ${textSecondary} mb-1`}>Key Feature</div><div className={`font-medium ${textPrimary}`}>{product.features[0]}</div></div>
                              <div><div className={`text-xs font-bold uppercase ${textSecondary} mb-1`}>Processor/Type</div><div className={`font-medium ${textPrimary}`}>{product.specs?.['Processor'] || 'Standard'}</div></div>
                          </div>
                      </div>

                      {/* Alternatives */}
                      {product.alternatives?.map((alt, i) => (
                          <div key={i} className={`p-6 rounded-2xl border flex flex-col ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-white/5'}`}>
                              <div className={`h-40 w-full rounded-xl mb-4 flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                                  <span className="text-slate-500 text-xs">Image unavailable</span>
                              </div>
                              <h3 className={`font-bold text-lg mb-2 leading-tight ${textPrimary}`}>{alt.name}</h3>
                              <div className={`text-2xl font-black mb-2 ${textPrimary}`}>₹{alt.price.toLocaleString()}</div>
                              <p className={`text-sm mb-6 ${textSecondary}`}>{alt.reason}</p>
                              
                              <div className="mt-auto">
                                  <button 
                                    onClick={() => { setShowCompare(false); performSearch && performSearch(alt.name); }}
                                    className={`w-full py-3 rounded-xl font-bold border transition-colors ${isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-white hover:bg-white/5'}`}
                                  >
                                      Switch to this
                                  </button>
                              </div>
                          </div>
                      ))}
                      
                      {(!product.alternatives || product.alternatives.length === 0) && (
                          <div className={`col-span-1 flex flex-col items-center justify-center p-8 text-center border-dashed border-2 rounded-2xl ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                              <Sparkles className="text-slate-500 mb-4" size={32}/>
                              <p className={textSecondary}>AI is analyzing more competitors...</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className={`border p-6 rounded-2xl w-full max-w-sm relative animate-scale-in ${isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900 border-white/10'}`}>
              <button onClick={() => setShowFeedback(false)} className={`absolute top-4 right-4 ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}><X size={20}/></button>
              
              {!feedbackSubmitted ? (
                <>
                  <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${textPrimary}`}><AlertTriangle className="text-orange-500"/> Report Issue</h3>
                  <p className={`text-sm mb-6 ${textSecondary}`}>Help us improve the accuracy for {product.name}.</p>
                  <div className="space-y-3 mb-6">
                     <button onClick={() => setFeedbackReason('wrong_price')} className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${feedbackReason === 'wrong_price' ? 'bg-violet-600/20 border-violet-500 text-violet-500' : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')}`}>Price is incorrect</button>
                     <button onClick={() => setFeedbackReason('out_of_stock')} className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${feedbackReason === 'out_of_stock' ? 'bg-violet-600/20 border-violet-500 text-violet-500' : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')}`}>Item is out of stock</button>
                     <button onClick={() => setFeedbackReason('better_price_found')} className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${feedbackReason === 'better_price_found' ? 'bg-violet-600/20 border-violet-500 text-violet-500' : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')}`}>I found a lower price</button>
                  </div>
                  <button onClick={submitFeedback} className={`w-full font-bold py-3 rounded-xl transition-colors ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-slate-200'}`}>Submit Report</button>
                </>
              ) : (
                <div className="text-center py-8">
                   <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                      <CheckCircle size={32} className="text-emerald-500"/>
                   </div>
                   <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Thanks for your help!</h3>
                   <p className={`text-sm ${textSecondary}`}>We will verify this shortly.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;