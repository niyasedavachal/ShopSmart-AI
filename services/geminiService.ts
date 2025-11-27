import { GoogleGenAI } from "@google/genai";
import { ProductDetails, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONFIGURATION: STEP 1 - ENTER YOUR AFFILIATE IDS HERE ---
// 1. Amazon Associates Tag (e.g., 'yourname-21')
const AMAZON_TAG = 'shopsmart-21'; 

// 2. Flipkart Affiliate ID (Leave empty if using Cuelinks/Aggregator)
const FLIPKART_ID = 'shopsmart_aff'; 

// 3. AGGREGATOR SETTINGS (For Croma, Ajio, Myntra, Reliance, etc.)
// If you use Cuelinks, EarnKaro, or vCommission, put their "Deep Link" prefix here.
// Example for Cuelinks: "https://linksredirect.com/?pub_id=YOUR_ID&url="
// Example for EarnKaro: "https://earnkaro.com/r?r=YOUR_ID&url="
// Leave as '' (empty string) if you don't have one yet.
const AGGREGATOR_PREFIX = ''; 

// --- PRELOADED DATA CACHE (Simulates Backend Preloading) ---
// This data is instantly available without API calls
const PRELOADED_CACHE: Record<string, ProductDetails> = {
  "iPhone 15 Pro": {
    id: "preload_iphone15pro",
    name: "Apple iPhone 15 Pro (Black Titanium, 128 GB)",
    description: "iPhone 15 Pro. Forged in titanium. Featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.",
    imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.8,
    reviewCount: 12500,
    features: ["A17 Pro Chip", "Titanium Design", "Action Button", "USB-C", "48MP Main Camera"],
    pros: ["Incredibly lightweight Titanium build", "A17 Pro is a beast for gaming", "USB-C finally!", "Action button is handy"],
    cons: ["Battery life could be better", "Charging speed still limited to 20W-27W", "Expensive compared to US pricing"],
    sustainabilityScore: 8,
    sustainabilityReason: "Made with 100% recycled aluminum in internal frame and 100% recycled cobalt in the battery.",
    pricePrediction: { trend: "DOWN", advice: "BUY_NOW", confidence: 92 },
    offers: [
      { storeName: "Flipkart", price: 119900, originalPrice: 134900, effectivePrice: 114900, offers: ["₹5000 HDFC Bank Off"], currency: "INR", link: "https://www.flipkart.com/apple-iphone-15-pro-black-titanium-128-gb/p/itm", inStock: true, rating: 4.8, offerExpiry: new Date(Date.now() + 86400000).toISOString() },
      { storeName: "Amazon", price: 121900, originalPrice: 134900, effectivePrice: 116900, offers: ["Flat ₹3000 Instant Discount"], currency: "INR", link: "https://www.amazon.in/dp/B0CHX1", inStock: true, rating: 4.7 },
      { storeName: "Croma", price: 119900, originalPrice: 134900, effectivePrice: 119900, offers: [], currency: "INR", link: "https://www.croma.com", inStock: true, rating: 4.8 },
      { storeName: "JioMart", price: 124900, originalPrice: 134900, effectivePrice: 124900, offers: [], currency: "INR", link: "https://www.jiomart.com", inStock: true, rating: 4.5 }
    ],
    priceHistory: [
      { date: "Oct", price: 134900 }, { date: "Nov", price: 129900 }, { date: "Dec", price: 124900 }, { date: "Jan", price: 122900 }, { date: "Feb", price: 119900 }, { date: "Today", price: 114900 }
    ],
    specs: { "Display": "6.1-inch Super Retina XDR", "Processor": "A17 Pro", "Camera": "48MP + 12MP + 12MP", "Battery": "Up to 23 hrs playback" },
    returnPolicy: "10 Days Replacement Policy",
    accessories: [{ name: "20W USB-C Power Adapter", type: "Charger", estimatedPrice: 1900 }, { name: "MagSafe Clear Case", type: "Case", estimatedPrice: 4900 }],
    unboxingLink: "https://www.youtube.com/results?search_query=iphone+15+pro+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Imagine Stores", "Croma", "Reliance Digital"]
  },
  "Samsung S24 Ultra": {
    id: "preload_s24ultra",
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)",
    description: "Galaxy AI is here. Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.",
    imageUrl: "https://images.unsplash.com/photo-1706698889851-409641772651?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.7,
    reviewCount: 8900,
    features: ["Galaxy AI", "Snapdragon 8 Gen 3", "200MP Camera", "Titanium Frame", "S-Pen Included"],
    pros: ["Best display on any smartphone", "Galaxy AI features are useful", "Incredible Zoom capability", "7 Years of OS updates"],
    cons: ["Very large and boxy design", "Shutter lag in moving subjects", "Expensive"],
    sustainabilityScore: 7,
    sustainabilityReason: "Uses recycled cobalt and rare earth elements in speakers.",
    pricePrediction: { trend: "STABLE", advice: "BUY_NOW", confidence: 85 },
    offers: [
      { storeName: "Amazon", price: 129999, originalPrice: 134999, effectivePrice: 121999, offers: ["₹8000 HDFC Bank Off"], currency: "INR", link: "https://www.amazon.in/dp/B0", inStock: true, rating: 4.7 },
      { storeName: "Samsung Shop", price: 129999, originalPrice: 134999, effectivePrice: 119999, offers: ["₹10000 Exchange Bonus"], currency: "INR", link: "https://www.samsung.com", inStock: true, rating: 4.9 },
      { storeName: "Flipkart", price: 131999, originalPrice: 134999, effectivePrice: 131999, offers: [], currency: "INR", link: "https://www.flipkart.com", inStock: true, rating: 4.6 }
    ],
    priceHistory: [
      { date: "Launch", price: 134999 }, { date: "Feb", price: 129999 }, { date: "Today", price: 121999 }
    ],
    specs: { "Display": "6.8-inch QHD+ Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3", "Camera": "200MP Quad Cam", "Battery": "5000mAh" },
    returnPolicy: "7 Days Replacement",
    accessories: [{ name: "45W Travel Adapter", type: "Charger", estimatedPrice: 3499 }, { name: "Galaxy Watch 6", type: "Wearable", estimatedPrice: 24999 }],
    unboxingLink: "https://www.youtube.com/results?search_query=samsung+s24+ultra+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Samsung Smart Cafe", "Croma", "Vijay Sales"]
  },
  "Sony WH-1000XM5": {
    id: "preload_xm5",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "The best noise cancelling headphones from Sony. Industry-leading noise cancellation, exceptional sound quality, and crystal-clear calls.",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.6,
    reviewCount: 4500,
    features: ["Industry-leading ANC", "30H Battery", "Multipoint Connection", "Speak-to-Chat"],
    pros: ["Top-tier Noise Cancellation", "Very comfortable/lightweight", "Great microphone quality"],
    cons: ["Does not fold up (bulky case)", "ANC cannot be turned off fully", "Pricey"],
    sustainabilityScore: 9,
    sustainabilityReason: "Packaging is plastic-free and uses recycled materials.",
    pricePrediction: { trend: "DOWN", advice: "BUY_NOW", confidence: 95 },
    offers: [
      { storeName: "Amazon", price: 24990, originalPrice: 34990, effectivePrice: 22990, offers: ["₹2000 ICICI Bank Off"], currency: "INR", link: "https://www.amazon.in", inStock: true, rating: 4.7 },
      { storeName: "HeadphoneZone", price: 24990, originalPrice: 34990, effectivePrice: 24990, offers: [], currency: "INR", link: "https://www.headphonezone.in", inStock: true, rating: 5.0 },
      { storeName: "Flipkart", price: 25990, originalPrice: 34990, effectivePrice: 25990, offers: [], currency: "INR", link: "https://www.flipkart.com", inStock: true, rating: 4.5 }
    ],
    priceHistory: [
       { date: "Oct", price: 29990 }, { date: "Dec", price: 26990 }, { date: "Today", price: 22990 }
    ],
    specs: { "Driver": "30mm", "Battery": "30 Hours (NC On)", "Weight": "250g", "Charging": "3 min charge = 3 hrs" },
    returnPolicy: "No Returns (Hygiene)",
    unboxingLink: "https://www.youtube.com/results?search_query=sony+xm5+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Sony Center", "Croma"]
  },
  "MacBook Air M2": {
    id: "preload_macbookm2",
    name: "Apple MacBook Air M2 (13.6-inch, 8GB RAM, 256GB SSD, Midnight)",
    description: "Supercharged by M2. Strikingly thin design. Go all day with up to 18 hours of battery life. The big, beautiful Liquid Retina display makes everything look brilliant.",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.8,
    reviewCount: 3200,
    features: ["M2 Chip", "13.6\" Liquid Retina", "1080p Webcam", "MagSafe Charging"],
    pros: ["Insane battery life (15-18 hours)", "Silent (No fan)", "Premium build quality", "Great performance for daily tasks"],
    cons: ["Base model SSD is slower", "Not suitable for heavy 3D rendering", "Only supports 1 external display"],
    sustainabilityScore: 8,
    sustainabilityReason: "Enclosure made with 100% recycled aluminum.",
    pricePrediction: { trend: "STABLE", advice: "BUY_NOW", confidence: 80 },
    offers: [
      { storeName: "Amazon", price: 89900, originalPrice: 99900, effectivePrice: 84900, offers: ["₹5000 SBI Card Off"], currency: "INR", link: "https://www.amazon.in", inStock: true, rating: 4.8 },
      { storeName: "Croma", price: 89900, originalPrice: 99900, effectivePrice: 89900, offers: [], currency: "INR", link: "https://www.croma.com", inStock: true, rating: 4.7 },
      { storeName: "Reliance Digital", price: 92900, originalPrice: 99900, effectivePrice: 92900, offers: [], currency: "INR", link: "https://www.reliancedigital.in", inStock: true, rating: 4.5 }
    ],
    priceHistory: [{ date: "Launch", price: 119900 }, { date: "Jan", price: 99900 }, { date: "Today", price: 84900 }],
    specs: { "Processor": "Apple M2", "RAM": "8GB Unified", "Storage": "256GB SSD", "Display": "13.6-inch Liquid Retina" },
    returnPolicy: "No Return (Service Center Only)",
    accessories: [{ name: "USB-C Hub", type: "Adapter", estimatedPrice: 2500 }, { name: "Laptop Sleeve", type: "Case", estimatedPrice: 1200 }],
    unboxingLink: "https://www.youtube.com/results?search_query=macbook+air+m2+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Imagine", "iWorld", "Croma"]
  },
  "PS5 Slim": {
    id: "preload_ps5slim",
    name: "Sony PlayStation 5 Console (Slim Disc Edition)",
    description: "Play Like Never Before. The PS5 Digital Edition unleashes new gaming possibilities that you never anticipated. Lightning Fast loading with an ultra-high speed SSD.",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.9,
    reviewCount: 15000,
    features: ["4K 120Hz", "Haptic Feedback", "Adaptive Triggers", "1TB SSD"],
    pros: ["Incredible exclusives (Spiderman, GoW)", "DualSense controller is a game changer", "Very fast load times"],
    cons: ["Games are expensive", "Still quite large despite 'Slim' name"],
    sustainabilityScore: 6,
    sustainabilityReason: "Packaging is recyclable, but console uses mixed plastics.",
    pricePrediction: { trend: "DOWN", advice: "BUY_NOW", confidence: 90 },
    offers: [
      { storeName: "Flipkart", price: 44990, originalPrice: 54990, effectivePrice: 42990, offers: ["₹2000 Bank Offer"], currency: "INR", link: "https://www.flipkart.com", inStock: true, rating: 4.9 },
      { storeName: "ShopAtSC", price: 44990, originalPrice: 54990, effectivePrice: 44990, offers: [], currency: "INR", link: "https://shopatsc.com", inStock: true, rating: 5.0 },
      { storeName: "Amazon", price: 45990, originalPrice: 54990, effectivePrice: 45990, offers: [], currency: "INR", link: "https://www.amazon.in", inStock: true, rating: 4.8 }
    ],
    priceHistory: [{ date: "Launch", price: 54990 }, { date: "Sale", price: 49990 }, { date: "Today", price: 42990 }],
    specs: { "Storage": "1TB SSD", "Resolution": "4K TV Gaming", "Frame Rate": "Up to 120fps", "HDR": "Supported" },
    returnPolicy: "No Returns",
    accessories: [{ name: "DualSense Controller", type: "Controller", estimatedPrice: 5500 }, { name: "Pulse 3D Headset", type: "Audio", estimatedPrice: 7500 }],
    unboxingLink: "https://www.youtube.com/results?search_query=ps5+slim+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Sony Center", "Games The Shop"]
  },
  "Nothing Phone (2)": {
    id: "preload_nothing2",
    name: "Nothing Phone (2) (Dark Grey, 12GB RAM, 256GB Storage)",
    description: "Come to the bright side. Meet the new Glyph Interface. Love at first light. 50 MP dual camera with Sony IMX890 sensor.",
    imageUrl: "https://images.unsplash.com/photo-1689246830740-1a773d52367f?auto=format&fit=crop&w=800&q=80",
    overallRating: 4.4,
    reviewCount: 6500,
    features: ["Glyph Interface", "Snapdragon 8+ Gen 1", "Clean Nothing OS", "LTPO OLED"],
    pros: ["Unique Design with Glyph lights", "Cleanest Android software experience", "Smooth performance"],
    cons: ["Cameras are good but not flagship level", "Accessories sold separately"],
    sustainabilityScore: 10,
    sustainabilityReason: "Certified carbon neutral. 100% recycled aluminum frame.",
    pricePrediction: { trend: "DOWN", advice: "BUY_NOW", confidence: 88 },
    offers: [
      { storeName: "Flipkart", price: 36999, originalPrice: 44999, effectivePrice: 33999, offers: ["₹3000 Exchange Bonus"], currency: "INR", link: "https://www.flipkart.com", inStock: true, rating: 4.5 },
      { storeName: "Croma", price: 36999, originalPrice: 44999, effectivePrice: 36999, offers: [], currency: "INR", link: "https://www.croma.com", inStock: true, rating: 4.3 }
    ],
    priceHistory: [{ date: "Launch", price: 44999 }, { date: "Oct", price: 39999 }, { date: "Today", price: 33999 }],
    specs: { "Processor": "Snapdragon 8+ Gen 1", "Display": "6.7” LTPO OLED", "Battery": "4700 mAh", "Charging": "45W Wired" },
    returnPolicy: "7 Days Replacement",
    accessories: [{ name: "Nothing Ear (2)", type: "Audio", estimatedPrice: 9999 }, { name: "45W Power Adapter", type: "Charger", estimatedPrice: 2499 }],
    unboxingLink: "https://www.youtube.com/results?search_query=nothing+phone+2+unboxing",
    isGstInvoiceAvailable: true,
    offlineAvailability: ["Vijay Sales", "Croma"]
  }
};

/**
 * Helper to extract JSON from a markdown code block if present
 */
function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from AI response", e);
    return null;
  }
}

/**
 * Generates an affiliate link or a smart search fallback link
 */
function transformToAffiliateLink(url: string, storeName: string, productName: string): string {
  const cleanStore = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const encodedName = encodeURIComponent(productName);
  
  let finalUrl = url;

  const isValidUrl = url && url.startsWith('http') && !url.includes('example.com') && url.length > 15;

  if (!isValidUrl) {
     if (cleanStore.includes('amazon')) finalUrl = `https://www.amazon.in/s?k=${encodedName}`;
     else if (cleanStore.includes('flipkart')) finalUrl = `https://www.flipkart.com/search?q=${encodedName}`;
     else if (cleanStore.includes('croma')) finalUrl = `https://www.croma.com/search/?text=${encodedName}`;
     else if (cleanStore.includes('reliance')) finalUrl = `https://www.reliancedigital.in/search?q=${encodedName}`;
     else if (cleanStore.includes('jiomart')) finalUrl = `https://www.jiomart.com/search/${encodedName}`;
     else if (cleanStore.includes('ajio')) finalUrl = `https://www.ajio.com/search/?text=${encodedName}`;
     else if (cleanStore.includes('myntra')) finalUrl = `https://www.myntra.com/${encodedName}`;
     else finalUrl = `https://www.google.com/search?q=${encodedName}+${storeName}+buy+online+india`;
  }

  // --- AFFILIATE LOGIC IMPLEMENTATION ---
  
  // 1. AMAZON DIRECT
  if (cleanStore.includes('amazon') && AMAZON_TAG) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    return `${finalUrl}${separator}tag=${AMAZON_TAG}`;
  }

  // 2. FLIPKART DIRECT (If available)
  if (cleanStore.includes('flipkart') && FLIPKART_ID) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    return `${finalUrl}${separator}affid=${FLIPKART_ID}`;
  }

  // 3. AGGREGATOR (Cuelinks/EarnKaro/vCommission) for ALL other stores
  // This is the best way to monetize Croma, Ajio, Reliance, etc.
  if (AGGREGATOR_PREFIX) {
    // Encodes the target URL and appends it to the aggregator's prefix
    return `${AGGREGATOR_PREFIX}${encodeURIComponent(finalUrl)}`;
  }
  
  return finalUrl;
}

/**
 * Analyzes an image to identify the product with high specificity
 */
export async function identifyProductFromImage(base64Image: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image. Identify the exact product name, brand, model number, and specific variant or color. Return a precise search query string optimized for finding this exact item on Indian e-commerce sites."
          }
        ]
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Image identification failed", error);
    throw new Error("Could not identify product from image.");
  }
}

/**
 * Chat with the product to answer user questions
 */
export async function chatWithProduct(product: ProductDetails, history: ChatMessage[], userQuestion: string): Promise<string> {
  const context = `
    You are a helpful shopping assistant expert on Indian e-commerce. 
    The user is asking about this specific product:
    
    Product: ${product.name}
    Description: ${product.description}
    Current Best Price: ₹${Math.min(...product.offers.map(o => o.effectivePrice || o.price)).toLocaleString('en-IN')}
    Overall Rating: ${product.overallRating}/5 (${product.reviewCount} reviews)
    
    Key Specs: ${JSON.stringify(product.specs || {})}
    
    Identified Pros: ${product.pros?.join(', ') || 'Not analyzed yet'}
    Identified Cons: ${product.cons?.join(', ') || 'Not analyzed yet'}
    
    Goal: Answer the user's specific question based on these details. 
    If the question is about "Can it run PUBG/Games", check the processor in specs.
    If the question is about battery, check battery specs and pros/cons.
    Keep answers concise, friendly, and helpful. Use Indian context (Lakhs, Rupees) where appropriate.
  `;

  try {
    // Map internal history format to SDK Content format
    const historySDK = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { 
        systemInstruction: context,
        temperature: 0.7
      },
      history: historySDK
    });
    
    const result = await chat.sendMessage({ message: userQuestion });
    return result.text;
  } catch (e) {
    console.error("Chat Error", e);
    return "I'm having a bit of trouble connecting to the product brain right now. Please try again in a moment.";
  }
}

/**
 * Checks if a query matches any preloaded/cached data
 */
export function checkPreloadedData(query: string): ProductDetails | null {
  const normalizedQuery = query.toLowerCase();
  for (const key in PRELOADED_CACHE) {
    if (normalizedQuery.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedQuery)) {
      return PRELOADED_CACHE[key];
    }
  }
  return null;
}

/**
 * Searches for product details with advanced intent understanding
 */
export async function searchProductDetails(query: string): Promise<ProductDetails> {
  // 1. Check Preloaded Cache First (0ms Latency)
  const cachedData = checkPreloadedData(query);
  if (cachedData) {
    console.log("Serving from Preloaded Cache (0ms)");
    // Return a deep copy to prevent mutation issues
    return JSON.parse(JSON.stringify(cachedData));
  }

  // 2. Fallback to Live AI Search
  const prompt = `
    You are an intelligent shopping assistant for the Indian market.
    
    USER QUERY: "${query}"
    
    Perform a deep market analysis using Google Search Grounding.
    
    TASKS:
    1. **Identify Product**: Fuzzy match query to exact Indian market model.
    2. **Prices**: Find listed prices on Amazon.in, Flipkart, Croma, etc.
    3. **Effective Price**: Calculate prices after bank offers (HDFC/SBI/Axis) and SuperCoins.
    4. **Reviews**: Analyze reviews to generate PROS and CONS.
    5. **Sustainability**: Estimate eco-score (1-10).
    6. **Prediction**: Predict if price will drop (BUY_NOW/WAIT).
    7. **Extras**: Identify compatible accessories, GST invoice availability, and offline store availability.

    OUTPUT FORMAT: SINGLE VALID JSON.
    {
      "refinedQuery": "Corrected Product Name",
      "id": "generate_unique_id",
      "name": "Full Product Title",
      "description": "Short compelling description.",
      "imageUrl": "Product Image URL",
      "overallRating": 4.5,
      "reviewCount": 1200,
      "features": ["Key Feature 1", "Key Feature 2"],
      "pros": ["Great Battery", "Vibrant Display"],
      "cons": ["Slow Charging", "Bloatware"],
      "sustainabilityScore": 7,
      "sustainabilityReason": "Recycled aluminum body.",
      "pricePrediction": { "trend": "DOWN", "advice": "WAIT", "confidence": 80 },
      "offers": [
        { 
          "storeName": "Flipkart", 
          "price": 15000, 
          "originalPrice": 19999,
          "effectivePrice": 13500,
          "offers": ["10% HDFC Bank Off", "Use SuperCoins"],
          "currency": "INR", 
          "link": null, 
          "inStock": true, 
          "rating": 4.5,
          "offerExpiry": "2023-10-27T10:00:00Z" 
        }
      ],
      "priceHistory": [
        { "date": "Month-1", "price": 16000 },
        { "date": "Current", "price": 15000 }
      ],
      "alternatives": [
         { "name": "Competitor Model", "price": 13999, "reason": "Better Value" }
      ],
      "coupons": [ { "code": "NEWUSER", "description": "₹500 off for new users" } ],
      "specs": { "Processor": "Snapdragon...", "Warranty": "1 Year" },
      "returnPolicy": "7 Days Replacement",
      "accessories": [
         { "name": "Back Cover Case", "type": "Case", "estimatedPrice": 499 },
         { "name": "33W Fast Charger", "type": "Charger", "estimatedPrice": 999 }
      ],
      "unboxingLink": "https://www.youtube.com/results?search_query=unboxing+QUERY",
      "isGstInvoiceAvailable": true,
      "offlineAvailability": ["Croma", "Reliance Digital"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const data = extractJson(text);

    if (!data) {
      throw new Error("I found the product, but couldn't organize the price data.");
    }
    
    // --- Data Sanitization & Safety ---
    
    if (!data.id || data.id === 'generate_unique_id') {
      data.id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!data.imageUrl || data.imageUrl.length < 10 || data.imageUrl.includes('placeholder')) {
       // Use preloaded Unsplash image as safer fallback than random placeholder
       data.imageUrl = PRELOADED_CACHE["Samsung S24 Ultra"]?.imageUrl || "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&q=80&w=800";
    }
    
    // Ensure unboxing link is valid search query if generic
    if (!data.unboxingLink || data.unboxingLink.includes('QUERY')) {
        data.unboxingLink = `https://www.youtube.com/results?search_query=unboxing+${encodeURIComponent(data.name)}`;
    }

    if (data.offers && Array.isArray(data.offers)) {
      data.offers = data.offers.map((offer: any) => {
        const price = Number(offer.price) || 0;
        const effectivePrice = Number(offer.effectivePrice) || price;
        
        // --- SIMULATED DATA FOR UI DEMO ---
        let offerExpiry = offer.offerExpiry;
        if (!offerExpiry && (offer.storeName.toLowerCase().includes('flipkart') || offer.storeName.toLowerCase().includes('amazon'))) {
           if (Math.random() > 0.5) {
             const now = new Date();
             const hoursToAdd = Math.floor(Math.random() * 28) + 2; 
             now.setHours(now.getHours() + hoursToAdd);
             offerExpiry = now.toISOString();
           }
        }
        // ----------------------------------

        return {
          ...offer,
          price,
          effectivePrice,
          originalPrice: Number(offer.originalPrice) || (price * 1.2),
          link: transformToAffiliateLink(offer.link, offer.storeName, data.name),
          offers: offer.offers || [],
          offerExpiry
        };
      });
    }

    if (data.alternatives && Array.isArray(data.alternatives)) {
        data.alternatives = data.alternatives.map((alt: any) => ({
            ...alt,
            price: Number(alt.price) || 0
        }));
    }

    return data;

  } catch (error) {
    console.error("Search failed", error);
    throw new Error("Unable to retrieve live prices. Please check your connection.");
  }
}