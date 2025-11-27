import React, { useState, useRef, useEffect } from 'react';
import { Search, Camera, ArrowRight, X, Sparkles, Clock, ArrowUpRight, Mic, Info, Heart, Zap, ChevronLeft, Sun, Moon, Award, TrendingUp, DollarSign, ScanBarcode, Users, Settings, Grid, Gift, Crown, Share2, Copy, CreditCard, ShieldCheck, ShoppingBag, CheckCircle2, Loader2, Database, SearchCheck, Music, Camera as CameraIcon, Dumbbell, BookOpen, Utensils, Baby, Smartphone, Percent, Calculator } from 'lucide-react';
import { identifyProductFromImage, searchProductDetails, checkPreloadedData } from './services/geminiService';
import { ProductDetails, UserStats, CommunityDeal } from './types';
import ProductCard, { ProductSkeleton } from './components/ProductCard';

// --- ROBUST PLACEHOLDER IMAGE (Data URI for offline support) ---
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2364748b'%3EProduct Image%3C/text%3E%3C/svg%3E";

interface HistoryItem {
  query: string;
  date: string;
}

const FACTS = [
  "Did you know? Amazon started as a simple online bookstore.",
  "Did you know? The first item sold on eBay was a broken laser pointer.",
  "Did you know? Flipkart was founded by two former Amazon employees.",
  "Did you know? 70% of online shopping carts are abandoned before purchase.",
  "Did you know? Cyber Monday is the busiest online shopping day of the year.",
  "Did you know? The most shopped-for category online is fashion.",
  "Did you know? Dynamic pricing means prices change based on demand!",
  "Did you know? India has over 900 million internet users.",
];

const MOCK_DEALS = [
  { name: "iPhone 15 Pro", price: "₹1,14,900", drop: "₹5,000", stores: ["Flipkart", "Amazon", "Croma"], img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=300&q=80" },
  { name: "Sony WH-1000XM5", price: "₹22,990", drop: "₹5,000", stores: ["Amazon", "Croma", "Flipkart"], img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=300&q=80" },
  { name: "Samsung S24 Ultra", price: "₹1,21,999", drop: "₹8,000", stores: ["Amazon", "Flipkart", "Croma"], img: "https://images.unsplash.com/photo-1706698889851-409641772651?auto=format&fit=crop&w=300&q=80" },
  { name: "MacBook Air M2", price: "₹89,900", drop: "₹10,000", stores: ["Croma", "Amazon", "Flipkart"], img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80" },
  { name: "PS5 Slim", price: "₹44,990", drop: "₹4,000", stores: ["Flipkart", "Amazon"], img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=300&q=80" },
  { name: "Nothing Phone (2)", price: "₹36,999", drop: "₹3,000", stores: ["Croma", "Flipkart"], img: "https://images.unsplash.com/photo-1689246830740-1a773d52367f?auto=format&fit=crop&w=300&q=80" },
];

const STORE_CONFIG: Record<string, { logo: string, bg: string }> = {
   'Amazon': { logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', bg: 'bg-white' },
   'Flipkart': { logo: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fk-header-mobile-logo-bafb3a.svg', bg: 'bg-[#2874f0]' },
   'Croma': { logo: 'https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1637759004/Croma%20Assets/CMS/Category%20icon/Croma_Logo_acr5n6.svg', bg: 'bg-black' },
};

const COMMUNITY_DEALS: CommunityDeal[] = [
  { id: '1', user: 'TechGuru', productName: 'Samsung S24 Ultra', price: '₹1,09,999', store: 'Croma', votes: 154, timeAgo: '2h ago', imageUrl: 'https://images.unsplash.com/photo-1706698889851-409641772651?auto=format&fit=crop&w=200&q=80' },
  { id: '2', user: 'DealHunter', productName: 'Nike Air Jordan', price: '₹7,999', store: 'Myntra', votes: 89, timeAgo: '4h ago', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
  { id: '3', user: 'SavvyShopper', productName: 'LG 4K Monitor', price: '₹22,500', store: 'Amazon', votes: 45, timeAgo: '5h ago', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80' }
];

const CATEGORIES = [
  { name: 'Mobiles', icon: <Smartphone size={16}/> },
  { name: 'Laptops', icon: <Settings size={16}/> },
  { name: 'Audio', icon: <Music size={16}/> },
  { name: 'Fashion', icon: <Sparkles size={16}/> },
  { name: 'Cameras', icon: <CameraIcon size={16}/> },
  { name: 'Home', icon: <Grid size={16}/> },
  { name: 'Kitchen', icon: <Utensils size={16}/> },
  { name: 'Gaming', icon: <Award size={16}/> },
  { name: 'Sneakers', icon: <ArrowRight size={16}/> },
  { name: 'Watches', icon: <Clock size={16}/> },
  { name: 'Fitness', icon: <Dumbbell size={16}/> },
  { name: 'Books', icon: <BookOpen size={16}/> },
  { name: 'Kids', icon: <Baby size={16}/> },
];

const LOADING_STEPS_LIST = [
   { id: 1, label: 'Initializing AI Agent...', icon: <Sparkles size={16} /> },
   { id: 2, label: 'Scanning Indian Market...', icon: <SearchCheck size={16} /> },
   { id: 3, label: 'Detecting Bank Offers...', icon: <CreditCard size={16} /> },
   { id: 4, label: 'Calculating Effective Prices...', icon: <Calculator size={16} /> },
];

const SearchOverlay: React.FC<{ query: string; currentStepIndex: number; fact: string; onCancel: () => void; theme: 'dark' | 'light' }> = ({ query, currentStepIndex, fact, onCancel, theme }) => {
   const isLight = theme === 'light';
   return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in w-full min-h-[60vh] relative">
         {/* Central Radar Animation */}
         <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
            {/* Outer Rings */}
            <div className={`absolute inset-0 border rounded-full animate-ping-slow ${isLight ? 'border-violet-300/40' : 'border-violet-500/20'}`}></div>
            <div className={`absolute inset-4 border rounded-full animate-ping-slow ${isLight ? 'border-cyan-300/40' : 'border-cyan-500/20'}`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute inset-0 border rounded-full ${isLight ? 'border-slate-200' : 'border-slate-700'}`}></div>
            
            {/* Rotating Scan Line */}
            <div className="absolute inset-0 rounded-full animate-radar bg-gradient-to-tr from-transparent via-transparent to-violet-500/20"></div>
            
            {/* Center Brain */}
            <div className={`absolute w-32 h-32 rounded-full border flex items-center justify-center z-10 ${isLight ? 'bg-white border-violet-200 shadow-xl shadow-violet-500/10' : 'bg-slate-900 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]'}`}>
               <Sparkles className="text-violet-500 w-12 h-12 animate-pulse" />
            </div>

            {/* Floating Orbit Icons */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 p-2 rounded-full border animate-float ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`} style={{ animationDelay: '0s' }}>
               <ShoppingBag size={16} className="text-cyan-500"/>
            </div>
            <div className={`absolute bottom-4 right-4 p-2 rounded-full border animate-float ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`} style={{ animationDelay: '1.5s' }}>
               <Percent size={16} className="text-emerald-500"/>
            </div>
            <div className={`absolute bottom-4 left-4 p-2 rounded-full border animate-float ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`} style={{ animationDelay: '2.5s' }}>
               <Search size={16} className="text-orange-500"/>
            </div>
         </div>

         {/* Steps Progress */}
         <div className="w-full max-w-sm space-y-3 mb-8 px-4">
            {LOADING_STEPS_LIST.map((step, index) => {
               const isActive = index === currentStepIndex;
               const isCompleted = index < currentStepIndex;
               
               let containerClass = isLight ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-slate-800/30 border-white/5 opacity-30';
               if (isActive) containerClass = isLight ? 'bg-violet-50 border-violet-200 scale-105 opacity-100' : 'bg-violet-500/10 border-violet-500/50 scale-105 opacity-100';
               if (isCompleted) containerClass = isLight ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-emerald-500/10 border-emerald-500/20 opacity-50';

               return (
                  <div key={step.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${containerClass}`}>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-black' : isActive ? 'bg-violet-500 text-white animate-pulse' : (isLight ? 'bg-slate-300 text-slate-500' : 'bg-slate-700 text-slate-400')}`}>
                        {isCompleted ? <CheckCircle2 size={14} /> : isActive ? <Loader2 size={14} className="animate-spin" /> : <span className="text-[10px]">{step.id}</span>}
                     </div>
                     <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through' : isActive ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-400' : 'text-slate-500')}`}>{step.label}</span>
                  </div>
               );
            })}
         </div>

         {/* Cancel Button */}
         <button 
            onClick={onCancel}
            className={`mb-8 px-6 py-2 rounded-full border text-sm font-bold transition-all flex items-center gap-2 group active:scale-95 ${isLight ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'}`}
         >
            <X size={16} className="group-hover:rotate-90 transition-transform"/> Cancel Search
         </button>

         {/* Did You Know Card */}
         <div className="w-full max-w-md px-4">
            <div className={`p-4 rounded-xl border-t-2 border-t-cyan-500/50 relative overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'glass-panel'}`}>
               <div className="absolute -right-4 -top-4 text-cyan-500/10"><Info size={100} /></div>
               <div className="flex items-center gap-2 mb-2 text-cyan-500 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} /> Smart Fact
               </div>
               <p className={`text-sm leading-relaxed relative z-10 animate-fade-in ${isLight ? 'text-slate-600' : 'text-slate-300'}`} key={fact}>
                  "{fact}"
               </p>
            </div>
         </div>
      </div>
   );
};

export function App() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ProductDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0); 
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<ProductDetails[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalSaved: 12500, dealsFound: 42, level: 'Smart Shopper', isPremium: false, referrals: 3 });
  const [isListening, setIsListening] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<'home' | 'feed'>('home');
  const [showScanner, setShowScanner] = useState(false);
  
  // Track current search ID to allow cancellation
  const searchIdRef = useRef<number | null>(null);
  
  // Modal States
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('shopsmart_history');
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    const savedFavorites = localStorage.getItem('shopsmart_favorites');
    if (savedFavorites) try { setFavorites(JSON.parse(savedFavorites)); } catch (e) {}
    
    const savedStats = localStorage.getItem('shopsmart_user_stats');
    if (savedStats) try { setUserStats(JSON.parse(savedStats)); } catch (e) {}

    // Theme logic
    if (theme === 'light') {
       document.documentElement.style.setProperty('--bg-color', '#f8fafc');
       document.documentElement.style.setProperty('--text-color', '#0f172a');
       document.body.classList.remove('dark-theme');
       document.body.classList.add('light-theme');
    } else {
       document.documentElement.style.setProperty('--bg-color', '#020617');
       document.documentElement.style.setProperty('--text-color', '#f8fafc');
       document.body.classList.add('dark-theme');
       document.body.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    let interval: any;
    if (isSearching) {
      interval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % FACTS.length);
      }, 4000); 
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const addToHistory = (q: string) => {
    const newHistory = [{ query: q, date: new Date().toISOString() }, ...history.filter(h => h.query !== q)].slice(0, 8);
    setHistory(newHistory);
    localStorage.setItem('shopsmart_history', JSON.stringify(newHistory));
  };

  const toggleFavorite = (product: ProductDetails) => {
    let newFavs;
    if (favorites.some(f => f.id === product.id)) {
      newFavs = favorites.filter(f => f.id !== product.id);
    } else {
      newFavs = [product, ...favorites];
    }
    setFavorites(newFavs);
    localStorage.setItem('shopsmart_favorites', JSON.stringify(newFavs));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Generate new search ID
    const newSearchId = Date.now();
    searchIdRef.current = newSearchId;

    setIsSearching(true);
    setError(null);
    setResult(null);
    setActiveView('home');
    setLoadingStepIndex(0); 
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Check Preloaded Cache FIRST for instant load
    const cached = checkPreloadedData(searchQuery);
    if (cached) {
       console.log("Instant Load triggered");
       setResult(cached);
       setIsSearching(false);
       addToHistory(searchQuery);
       return;
    }

    try {
      addToHistory(searchQuery);
      
      // Step Animation Sequence (Guarded by searchId)
      setTimeout(() => { if (searchIdRef.current === newSearchId) setLoadingStepIndex(1); }, 1000); 
      setTimeout(() => { if (searchIdRef.current === newSearchId) setLoadingStepIndex(2); }, 2500); 
      setTimeout(() => { if (searchIdRef.current === newSearchId) setLoadingStepIndex(3); }, 4500); 

      const data = await searchProductDetails(searchQuery);
      
      // Only update state if this is still the active search
      if (searchIdRef.current === newSearchId) {
        setResult(data);
        
        const newStats = { ...userStats, dealsFound: userStats.dealsFound + 1 };
        setUserStats(newStats);
        localStorage.setItem('shopsmart_user_stats', JSON.stringify(newStats));
        
        setIsSearching(false);
        setLoadingStepIndex(0);
        setSelectedImage(null);
      }

    } catch (err: any) {
      if (searchIdRef.current === newSearchId) {
        setError(err.message || "Something went wrong.");
        setIsSearching(false);
        setLoadingStepIndex(0);
        setSelectedImage(null);
      }
    }
  };

  const handleCancelSearch = () => {
     searchIdRef.current = null; // Invalidate current search
     setIsSearching(false);
     setLoadingStepIndex(0);
     // Optional: Stay on current view or go home. Currently stays on home view but stops loading.
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setQuery('');
      // Trigger search flow properly
      const newSearchId = Date.now();
      searchIdRef.current = newSearchId;
      setIsSearching(true);
      setError(null);
      setResult(null);
      setLoadingStepIndex(0);

      try {
        const identifiedName = await identifyProductFromImage(base64.split(',')[1]);
        // If cancelled during identification
        if (searchIdRef.current !== newSearchId) return;
        
        setQuery(identifiedName);
        await performSearch(identifiedName);
      } catch (err) {
        if (searchIdRef.current === newSearchId) {
            setError("Could not identify image. Please try again.");
            setIsSearching(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Voice search not supported."); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript);
    };
    recognition.start();
  };

  const toggleScanner = () => {
    setShowScanner(!showScanner);
    if (!showScanner) {
      setTimeout(() => {
        alert("Scanner simulation: Scanning barcode... Found 'OnePlus 12R'");
        setShowScanner(false);
        setQuery("OnePlus 12R");
        performSearch("OnePlus 12R");
      }, 2000);
    }
  };

  const upgradeToPremium = () => {
    const newStats = { ...userStats, isPremium: true };
    setUserStats(newStats);
    localStorage.setItem('shopsmart_user_stats', JSON.stringify(newStats));
    setShowPremiumModal(false);
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-500 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-50'}`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse ${theme === 'light' ? 'bg-violet-300' : 'bg-violet-600/20'}`}></div>
         <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 ${theme === 'light' ? 'bg-cyan-300' : 'bg-cyan-600/20'}`}></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${theme === 'light' ? 'bg-white/70 border-slate-200' : 'bg-slate-950/70 border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setResult(null); setQuery(''); setActiveView('home'); }}>
            <div className="bg-gradient-to-tr from-violet-600 to-cyan-500 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Shop<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Smart</span>
              {userStats.isPremium && <span className="text-xs ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-1.5 py-0.5 rounded font-black align-top shadow-md shadow-yellow-500/20">PRO</span>}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             {!userStats.isPremium ? (
                <button onClick={() => setShowPremiumModal(true)} className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-yellow-500/20 transition-colors">
                   <Crown size={14} /> Go Pro
                </button>
             ) : (
                <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-bold">
                   <ShieldCheck size={14} /> Premium
                </div>
             )}
             <button onClick={() => setActiveView('feed')} className={`p-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-1 ${activeView === 'feed' ? 'bg-violet-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Users size={16} /> <span className="hidden md:inline">Community</span>
             </button>
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-yellow-400'}`}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </nav>

      {/* Barcode Scanner Overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center animate-fade-in">
           <div className="relative w-72 h-48 border-2 border-cyan-500 rounded-2xl overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent animate-shimmer"></div>
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_red]"></div>
           </div>
           <p className="mt-4 text-white font-mono animate-pulse">Scanning...</p>
           <button onClick={() => setShowScanner(false)} className="mt-8 bg-slate-800 text-white px-6 py-2 rounded-full">Cancel</button>
        </div>
      )}

      <main className="relative z-10 pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen flex flex-col">
        
        {/* NEW FUTURISTIC LOADING OVERLAY WITH CANCEL */}
        {isSearching && (
           <SearchOverlay query={query} currentStepIndex={loadingStepIndex} fact={FACTS[currentFact]} onCancel={handleCancelSearch} theme={theme} />
        )}

        {/* Dashboard / Home */}
        {!isSearching && !result && activeView === 'home' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in-up">
             
             <div className="text-center mb-10 mt-6 md:mt-12">
               <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                 Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500">Perfect Deal.</span>
               </h1>
             </div>

             {/* Search */}
             <div className="relative group z-20 mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className={`relative flex items-center border rounded-2xl p-2 shadow-2xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                   <Search className="ml-4 text-slate-400" size={24} />
                   <input 
                     type="text"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                     placeholder="Paste link or type product name..."
                     className={`w-full bg-transparent border-none text-lg placeholder-slate-500 focus:ring-0 px-4 py-3 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}
                   />
                   <div className="flex items-center gap-1 pr-2">
                      <button onClick={toggleScanner} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 rounded-xl transition-all"><ScanBarcode size={20} /></button>
                      <button onClick={handleVoiceSearch} className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400'}`}><Mic size={20} /></button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 rounded-xl transition-all"><Camera size={20} /></button>
                      <button onClick={() => performSearch(query)} disabled={!query.trim()} className="bg-slate-900 dark:bg-white text-white dark:text-black p-3 rounded-xl transition-all transform active:scale-95 font-bold"><ArrowRight size={20} /></button>
                   </div>
                </div>
             </div>

             {/* AD BANNER (Simulated) - Hidden for Premium Users */}
             {!userStats.isPremium && (
               <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 mb-8 flex items-center justify-between shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="flex items-center gap-4 z-10">
                     <div className="bg-white/10 p-2 rounded-lg">
                        <CreditCard className="text-slate-300" size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-600 px-1 rounded bg-black/20">Sponsored</span>
                           <h4 className="font-bold text-white text-sm">HDFC Bank Credit Card</h4>
                        </div>
                        <p className="text-xs text-slate-400">Get 5% Cashback on all electronics purchases.</p>
                     </div>
                  </div>
                  <button onClick={() => setShowPremiumModal(true)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg z-10">Remove Ads</button>
               </div>
             )}

             {/* Category Pills */}
             <div className="flex justify-center gap-3 mb-12 flex-wrap">
                {CATEGORIES.map((cat, i) => (
                   <button key={i} onClick={() => { setQuery(`Best ${cat.name} Deals India`); performSearch(`Best ${cat.name} Deals India`); }} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:scale-105 ${theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:border-violet-500' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-violet-500/50'}`}>
                      {cat.icon} {cat.name}
                   </button>
                ))}
             </div>

             {/* Featured Deals Carousel */}
             <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 bg-orange-500 rounded-lg"><Sparkles size={14} className="text-white"/></div>
                   <h3 className={`font-bold text-lg ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Today's Loot Deals</h3>
                   <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded font-bold uppercase">Trending</span>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                   {MOCK_DEALS.map((deal, i) => (
                      <div key={i} className={`min-w-[160px] md:min-w-[200px] p-3 rounded-xl border relative overflow-hidden group cursor-pointer snap-start transition-all hover:shadow-xl ${theme === 'light' ? 'bg-white border-slate-200 hover:border-violet-500' : 'bg-slate-900/50 border-white/10 hover:border-violet-500/50'}`} onClick={() => { setQuery(deal.name); performSearch(deal.name); }}>
                         <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg">-{deal.drop}</div>
                         
                         {/* Multi-Store Logo Stack */}
                         <div className="absolute top-2 left-2 z-10 flex -space-x-1.5">
                            {deal.stores.map((store, idx) => {
                                const storeConfig = STORE_CONFIG[store] || { logo: '', bg: 'bg-gray-700' };
                                return (
                                    <div key={idx} className={`relative rounded-full p-0.5 shadow-sm border border-white/10 ${storeConfig.bg} h-6 w-6 flex items-center justify-center`} style={{ zIndex: 10 - idx }}>
                                        {storeConfig.logo ? <img src={storeConfig.logo} alt={store} className="h-3.5 w-3.5 object-contain" /> : <span className="text-[6px] text-white font-bold">{store[0]}</span>}
                                    </div>
                                );
                            })}
                         </div>

                         <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                            <img 
                                src={deal.img} 
                                alt={deal.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                            />
                         </div>
                         <h4 className={`font-bold text-sm truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{deal.name}</h4>
                         <div className="flex items-center justify-between mt-1">
                            <p className="text-violet-500 font-black text-sm">{deal.price}</p>
                            <span className="text-[10px] text-slate-500">View All</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* User Stats & Referral */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 ${theme === 'light' ? 'bg-violet-50 border-violet-100' : 'bg-violet-900/10 border-violet-500/20'}`}>
                   <DollarSign className="text-violet-500 mb-1" size={24} />
                   <span className="text-2xl font-black text-violet-500">₹{userStats.totalSaved.toLocaleString()}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Saved</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 ${theme === 'light' ? 'bg-cyan-50 border-cyan-100' : 'bg-cyan-900/10 border-cyan-500/20'}`}>
                   <Award className="text-cyan-500 mb-1" size={24} />
                   <span className="text-2xl font-black text-cyan-500">{userStats.dealsFound}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Deals Found</span>
                </div>
                <div onClick={() => setShowReferralModal(true)} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 transition-transform ${theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-900/10 border-emerald-500/20'}`}>
                   <Gift className="text-emerald-500 mb-1" size={24} />
                   <span className="text-2xl font-black text-emerald-500">{userStats.referrals}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Referrals</span>
                </div>
                <div onClick={() => !userStats.isPremium && setShowPremiumModal(true)} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 transition-transform ${theme === 'light' ? 'bg-yellow-50 border-yellow-100' : 'bg-yellow-900/10 border-yellow-500/20'} ${userStats.isPremium ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : ''}`}>
                   <Crown className="text-yellow-500 mb-1" size={24} />
                   <span className="text-xl font-black text-yellow-500">{userStats.isPremium ? 'PRO' : 'FREE'}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{userStats.isPremium ? 'Active' : 'Upgrade'}</span>
                </div>
             </div>
          </div>
        )}

        {/* Community Feed View */}
        {!isSearching && activeView === 'feed' && (
           <div className="flex-1 max-w-2xl mx-auto w-full animate-fade-in-up">
              <h2 className="text-2xl font-black mb-6">Community Deals</h2>
              <div className="space-y-4">
                 {COMMUNITY_DEALS.map((deal) => (
                    <div key={deal.id} className={`p-4 rounded-2xl border flex gap-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-white/10'}`}>
                       <img 
                            src={deal.imageUrl} 
                            className="w-20 h-20 rounded-lg object-cover bg-slate-800" 
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                       />
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-lg">{deal.productName}</h4>
                             <span className="text-violet-500 font-black">{deal.price}</span>
                          </div>
                          <div className="text-sm text-slate-500 mb-2">at {deal.store} • Posted by {deal.user}</div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                             <button className="flex items-center gap-1 hover:text-emerald-500"><ArrowUpRight size={14}/> {deal.votes} Upvotes</button>
                             <span>{deal.timeAgo}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Results View */}
        {!isSearching && result && (
           <div className="animate-fade-in">
              <button onClick={() => setResult(null)} className={`mb-4 flex items-center gap-2 transition-colors group ${theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                 <div className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-slate-200 group-hover:bg-slate-300' : 'bg-white/5 group-hover:bg-white/10'}`}><ChevronLeft size={20} /></div>
                 <span className="font-semibold text-sm">Back to Search</span>
              </button>
              <ProductCard product={result} isFavorite={favorites.some(f => f.id === result.id)} onToggleFavorite={() => toggleFavorite(result)} isPremium={userStats.isPremium} theme={theme} performSearch={performSearch} />
           </div>
        )}

        {/* Error Notification */}
        {error && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3 animate-fade-in-up z-50 max-w-sm w-full">
              <div className="bg-red-500/20 p-2 rounded-full shrink-0"><Info size={20} className="text-red-400" /></div>
              <div><h4 className="font-bold text-sm">Search Failed</h4><p className="text-xs text-red-300/80">{error}</p></div>
              <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-500/20 rounded-lg"><X size={16} /></button>
           </div>
        )}
      </main>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-black border border-yellow-500/30 p-8 rounded-3xl w-full max-w-md relative animate-scale-in text-center shadow-2xl shadow-yellow-500/10">
              <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
              
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Crown size={32} className="text-yellow-400" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2">ShopSmart <span className="text-yellow-400">PRO</span></h2>
              <p className="text-slate-400 mb-8">Unlock the ultimate shopping power.</p>
              
              <div className="space-y-4 mb-8 text-left">
                 <div className="flex items-center gap-3 text-slate-200"><div className="p-1 bg-yellow-500/20 rounded"><Zap size={14} className="text-yellow-400"/></div> <span className="font-bold">Ad-free experience</span></div>
                 <div className="flex items-center gap-3 text-slate-200"><div className="p-1 bg-yellow-500/20 rounded"><Clock size={14} className="text-yellow-400"/></div> Early access to Loot Deals</div>
                 <div className="flex items-center gap-3 text-slate-200"><div className="p-1 bg-yellow-500/20 rounded"><Sparkles size={14} className="text-yellow-400"/></div> Unlimited AI Chat queries</div>
                 <div className="flex items-center gap-3 text-slate-200"><div className="p-1 bg-yellow-500/20 rounded"><ShieldCheck size={14} className="text-yellow-400"/></div> Direct Links (No Redirects)</div>
              </div>
              
              <button onClick={upgradeToPremium} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3.5 rounded-xl hover:scale-105 transition-transform" id="premium-confetti-btn">
                 Upgrade for ₹99/mo
              </button>
              <p className="mt-4 text-[10px] text-slate-500">Cancel anytime. Terms apply.</p>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm relative animate-scale-in text-center">
              <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
              
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Gift size={32} className="text-emerald-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Invite Friends</h2>
              <p className="text-slate-400 mb-6 text-sm">Earn 50 coins for every friend who joins.</p>
              
              <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between mb-6 border border-white/5">
                 <span className="text-slate-300 font-mono text-sm ml-2">shop.ai/ref/u/alex</span>
                 <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Copy size={16}/></button>
              </div>
              
              <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                 <Share2 size={18}/> Share Invite
              </button>
           </div>
        </div>
      )}

    </div>
  );
}