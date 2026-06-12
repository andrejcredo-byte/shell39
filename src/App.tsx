import { useState, useRef, RefObject, FormEvent } from "react";
import { 
  Droplet, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  Check, 
  Send, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OIL_PRODUCTS, CONTACTS } from "./data";

function ProMasloLogo({ showText = true, dark = false }: { showText?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none text-left">
      <svg viewBox="0 0 120 120" className="w-14 h-14 shrink-0 transition-transform duration-300 hover:scale-105">
        {/* Outer Black Circle */}
        <circle cx="60" cy="60" r="58" fill="#121315" />
        
        {/* Inside White Circle with Yellow Border */}
        <circle cx="60" cy="45" r="26" fill="#FFFFFF" stroke="#F3F40C" strokeWidth="2.5" />
        
        {/* Black canister */}
        <g transform="translate(47, 31) scale(0.9)">
          {/* Canister main block */}
          <path d="M 3 8 L 21 8 C 22.5 8, 23.5 9, 23.5 10.5 L 23.5 25.5 C 23.5 27, 22.5 28, 21 28 L 3 28 C 1.5 28, 0.5 27, 0.5 25.5 L 0.5 10.5 C 0.5 9, 1.5 8, 3 8 Z" fill="#121315" />
          {/* Cap neck and lid */}
          <rect x="3.5" y="4.5" width="5" height="1.5" fill="#121315" rx="0.5" />
          <rect x="4.5" y="6" width="3" height="2" fill="#121315" />
          {/* Handle cutout */}
          <path d="M 10.5 12 L 18.5 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          {/* Yellow droplet in canister */}
          <path d="M 12 15.5 C 12 15.5, 15.5 20, 15.5 21.5 A 1.8 1.8 0 0 1 12 23.3 A 1.8 1.8 0 0 1 8.5 21.5 C 8.5 20, 12 15.5, 12 15.5 Z" fill="#F3F40C" />
        </g>
        
        {/* "ПроМасло" Text */}
        <text x="60" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.2">ПроМасло</text>
        
        {/* Subtitle list */}
        <text x="60" y="95" textAnchor="middle" fill="#F3F40C" fontSize="3.3" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.4">МОТОРНЫЕ МАСЛА • АВТОХИМИЯ</text>
        <text x="60" y="100" textAnchor="middle" fill="#F3F40C" fontSize="3.3" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.4">АКСЕССУАРЫ</text>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-base font-black tracking-tight uppercase leading-none font-display ${dark ? 'text-white' : 'text-slate-950'}`}>
            ПроМасло
          </span>
          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase leading-none mt-1">
            Калининград
          </span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedViscosityFilter, setSelectedViscosityFilter] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "5W-40": false,
    "5W-30": false,
    "10W-40": false,
    "0W-30": false,
    "10W-60": false,
  });
  
  // Custom interactive dropdown state for catalog
  const [isViscosityDropdownOpen, setIsViscosityDropdownOpen] = useState(false);

  // Booking Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOil, setSelectedOil] = useState<string>("none");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const catalogRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);

  // Unique viscosity list for filters/dropdown
  const viscosities = ["all", "5W-40", "5W-30", "10W-40", "0W-30", "10W-60"];

  const handleScrollTo = (elementRef: RefObject<HTMLDivElement | null>) => {
    setIsMobileMenuOpen(false);
    elementRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectOilForBooking = (oilName: string) => {
    setSelectedOil(oilName);
    handleScrollTo(bookingRef);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError("Пожалуйста, введите ваше имя");
      return;
    }
    // Simple Russian phone validation (expects digits)
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setFormError("Пожалуйста, введите корректный номер телефона");
      return;
    }
    
    setFormError("");
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setFullName("");
    setPhone("");
    setSelectedOil("none");
    setIsSubmitted(false);
  };

  
    return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ProMasloLogo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleScrollTo(catalogRef)}
              className="text-slate-600 hover:text-slate-950 text-sm font-semibold transition-colors cursor-pointer"
            >
              Каталог масел
            </button>
            <button 
              onClick={() => handleScrollTo(bookingRef)}
              className="text-slate-600 hover:text-slate-950 text-sm font-semibold transition-colors cursor-pointer"
            >
              Запись на замену
            </button>
            <button 
              onClick={() => handleScrollTo(contactsRef)}
              className="text-slate-600 hover:text-slate-950 text-sm font-semibold transition-colors cursor-pointer"
            >
              Контакты
            </button>
          </nav>

          {/* Desktop Call to Actions & Contact */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right flex flex-col items-end">
              <a 
                href={`tel:${CONTACTS.phones[0].value}`}
                className="block text-sm font-extrabold text-slate-950 hover:text-slate-950 transition-colors"
              >
                {CONTACTS.phones[0].display}
              </a>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Ежедневно 9:00 – 19:00</span>
              </div>
            </div>
            <button
              onClick={() => handleScrollTo(bookingRef)}
              className="px-5 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              Записаться
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-550 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Иконка меню"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <button 
                  onClick={() => handleScrollTo(catalogRef)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors text-base font-semibold"
                >
                  Каталог масел
                </button>
                <button 
                  onClick={() => handleScrollTo(bookingRef)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors text-base font-semibold"
                >
                  Запись на замену
                </button>
                <button 
                  onClick={() => handleScrollTo(contactsRef)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors text-base font-semibold"
                >
                  Контакты
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4 px-4 space-y-3">
                <div className="space-y-1">
                  {CONTACTS.phones.map((phone, idx) => (
                    <a 
                      key={idx}
                      href={`tel:${phone.value}`}
                      className="block text-base font-bold text-slate-950 font-display"
                    >
                      {phone.display}
                    </a>
                  ))}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ежедневно 9:00 – 19:00</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleScrollTo(bookingRef)}
                  className="w-full py-3 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold text-center transition-all shadow-md block cursor-pointer"
                >
                  Записаться на замену
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 md:py-14 bg-white">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://static.tildacdn.com/tild3137-3037-4435-b836-396233663736/photo_54430522040313.jpg" 
            alt="Автосервис замена масел в Калининграде"
            className="w-full h-full object-cover object-center opacity-15 scale-105 filter blur-[1px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Core Message Area */}
            <div className="space-y-5 flex flex-col items-center">
              {/* Yandex & 2GIS Rating Badges */}
              <div className="flex flex-row items-center justify-center gap-3">
                {/* Yandex Rating Award Link Badge */}
                <a 
                  href="https://yandex.ru/maps/org/promaslo/178550117070/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[150px] h-[50px] shrink-0 rounded-xl bg-[#F5F5F5] p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-neutral-200/60 active:scale-95 duration-150 relative border border-transparent"
                >
                  {/* First Row */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-[15px] h-[15px] rounded-[3px] overflow-hidden shrink-0 relative flex items-center justify-center bg-gradient-to-tr from-[#FC3F1D] to-[#E62E0E]">
                        {/* Red Yandex map pin */}
                        <svg viewBox="0 0 24 24" className="w-[10px] h-[10px] drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.15)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" />
                          <circle cx="12" cy="9" r="3" fill="#E62E0E" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black text-black leading-none tracking-tight whitespace-nowrap">Хорошее место</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 pl-1">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#F5C200] fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
                      </svg>
                      <span className="text-[10px] font-black text-black font-sans leading-none">4,9</span>
                    </div>
                  </div>
                  
                  {/* Second Row */}
                  <div className="text-[7.5px] text-[#7E7E7E] leading-none font-sans font-normal pl-[21px] whitespace-nowrap">
                    Выбор пользователей Яндекса
                  </div>
                </a>

                {/* 2GIS Rating Award Link Badge */}
                <a 
                  href="https://2gis.ru/kaliningrad/firm/70000001043806096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[150px] h-[50px] shrink-0 rounded-xl bg-[#F5F5F5] p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-neutral-200/60 active:scale-95 duration-150 relative border border-transparent"
                >
                  {/* First Row */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-[15px] h-[15px] rounded-[3px] overflow-hidden shrink-0 relative flex items-center justify-center bg-gradient-to-tr from-[#02be02] via-[#a1db00] to-[#fbc500]">
                        {/* Blue pin with white star */}
                        <svg viewBox="0 0 24 24" className="w-[10px] h-[10px] drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.15)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#1e88e5" />
                          <path d="M12 11.5L9.65 12.74L10.1 10.12L8.19 8.26L10.82 7.88L12 5.5L13.18 7.88L15.81 8.26L13.9 10.12L14.35 12.74L12 11.5Z" fill="white" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black text-black leading-none tracking-tight whitespace-nowrap">Здесь хорошо!</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 pl-1">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#F5C200] fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
                      </svg>
                      <span className="text-[10px] font-black text-black font-sans leading-none">4,9</span>
                    </div>
                  </div>
                  
                  {/* Second Row */}
                  <div className="text-[7.5px] text-[#7E7E7E] leading-none font-sans font-normal pl-[21px] whitespace-nowrap">
                    Выбор пользователей 2ГИС
                  </div>
                </a>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display leading-tight text-slate-950 tracking-tight">
                Замена моторного масла <br className="hidden sm:inline" />
                в Калининграде
              </h1>

              <p className="text-slate-650 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                Быстро, надежно и по честным ценам. Наша основная миссия – продлить жизнь вашему двигателю с помощью оригинальных заграничных масел <strong className="font-bold text-slate-950">Shell Helix</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => handleScrollTo(bookingRef)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-base transition-all duration-300 hover:shadow-md hover:shadow-slate-950/15 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Записаться онлайн
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleScrollTo(catalogRef)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Открыть каталог
                </button>
              </div>

              {/* Fast Statistics Labeling */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-5 border-t border-slate-200 w-full max-w-md mx-auto">
                <div>
                  <div className="text-2xl font-black font-display text-slate-950">20 мин</div>
                  <div className="text-xs text-slate-500">Среднее время замены</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-display text-slate-950">100%</div>
                  <div className="text-xs text-slate-500">Оригинальное масло</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-2xl font-black font-display text-slate-950">30%</div>
                  <div className="text-xs text-slate-500">Экономия на розливе</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Catalog Section - With Dropdown selector and collapsible categories */}
      <section ref={catalogRef} id="catalog" className="py-10 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Catalog Headers */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">Каталог Моторных Масел Shell</h2>
          </div>

          {/* modern Dropdown Menu (Выплывающее меню) AND Filter Pill bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
            
            {/* Visual selector label */}
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-slate-900" />
              <span className="text-sm font-semibold text-slate-700">Быстрый поиск по вязкости:</span>
            </div>

            {/* Interactive Dropdown Button (выплывающее меню) */}
            <div className="relative">
              <button
                onClick={() => setIsViscosityDropdownOpen(!isViscosityDropdownOpen)}
                className="w-64 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-sm font-bold flex items-center justify-between transition-all shadow-sm cursor-pointer"
              >
                <span>
                  {selectedViscosityFilter === "all" ? "Все виды (Показать все)" : `Вязкость: ${selectedViscosityFilter}`}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-950 transition-transform duration-200 ${isViscosityDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isViscosityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden"
                  >
                    <div className="py-1">
                      {viscosities.map((visc) => (
                        <button
                          key={visc}
                          onClick={() => {
                            setSelectedViscosityFilter(visc);
                            setIsViscosityDropdownOpen(false);
                            
                            // Proactively auto-expand that specific grid if select viscosity filter
                            if (visc !== "all") {
                              setExpandedCategories(prev => ({
                                ...prev,
                                [visc]: true
                              }));
                            }
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors block ${
                            selectedViscosityFilter === visc 
                              ? "bg-slate-950 text-white font-extrabold" 
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {visc === "all" ? "🌐 Все вязкости" : `🛢️ Shell Helix ${visc}`}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Inline Filter pills for beautiful clickability */}
            <div className="flex flex-wrap justify-center gap-2">
              {viscosities.map((visc) => (
                <button
                  key={visc}
                  onClick={() => {
                    setSelectedViscosityFilter(visc);
                    if (visc !== "all") {
                      // auto expand inside accordion too
                      setExpandedCategories(prev => ({
                        ...prev,
                        [visc]: true
                      }));
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wide cursor-pointer ${
                    selectedViscosityFilter === visc
                      ? "bg-slate-950 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-955 border border-slate-200"
                  }`}
                >
                  {visc === "all" ? "Показать всё" : visc}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout containing Interactive Viscosity Accordions */}
          <div className="space-y-6">
            {viscosities.filter(v => v !== "all").map((category) => {
              // Filter products matching current viscosity category
              const categoryProducts = OIL_PRODUCTS.filter(p => p.viscosity === category);
              
              // Skip rendering this accordion block if quick filters select something else
              if (selectedViscosityFilter !== "all" && selectedViscosityFilter !== category) {
                return null;
              }

              const isOpen = expandedCategories[category] || false;

              return (
                <div 
                  key={category} 
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-350"
                >
                  {/* Accordion Trigger Headband */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-6 py-5 bg-white hover:bg-slate-50/50 flex items-center justify-between gap-4 transition-all block text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Oil droplet tag with viscosity - corrected fixed width to prevent text overflow */}
                      <div className="px-3 h-11 min-w-[5.25rem] rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-sm font-mono shrink-0">
                        {category}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 font-display flex items-center gap-2">
                          Масла {category}
                        </h3>
                        <p className="text-xs text-slate-550 mt-1">В наличии: {categoryProducts.length} наименований масел Shell</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block text-xs text-slate-555 font-mono font-medium">
                        {isOpen ? "Свернуть каталог" : "Развернуть каталог"}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Collapsible Content wrapper */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-slate-150 bg-slate-50/20">
                          
                          {/* Inner Product Grid cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryProducts.map((product) => (
                              <div 
                                key={product.id}
                                className="group rounded-xl bg-white border border-slate-200 hover:border-slate-350 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 p-5 flex flex-col justify-between shadow-xs relative overflow-hidden"
                              >
                                {/* Top Decorative Glow Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-900/[0.015] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div>
                                  {/* Badges and tags */}
                                  <div className="flex justify-between items-start gap-2 mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
                                      {product.viscosity}
                                    </span>
                                    
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                      {product.attributes.isUltra && (
                                        <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-950 text-white border border-slate-950 px-1.5 py-0.5 rounded">
                                          Ultra
                                        </span>
                                      )}
                                      {product.attributes.isSemiSynthetic && (
                                        <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                                          Полусинтетика
                                        </span>
                                      )}
                                      {product.attributes.isSynthetic && !product.attributes.isUltra && (
                                        <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded">
                                          Синтетика
                                        </span>
                                      )}
                                      {product.attributes.isDiesel && (
                                        <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                          Дизель
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Oil Canister Bottle Photo Container with 100% original fidelity */}
                                  <div className="relative aspect-square w-full max-w-[170px] mx-auto mb-6 bg-slate-50 rounded-xl flex items-center justify-center p-4 group-hover:scale-[1.03] transition-transform duration-300">
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.11)]"
                                      referrerPolicy="no-referrer"
                                    />
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
                                  </div>

                                  {/* Title name */}
                                  <h4 className="text-base font-bold text-slate-800 mb-4 line-clamp-2 min-h-[3rem] font-display">
                                    {product.name}
                                  </h4>

                                  {/* Pricing Information breakdown */}
                                  <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                                    <div className="text-xs font-mono tracking-wide uppercase text-slate-400 mb-2 font-semibold">Варианты и цены:</div>

                                    {/* Pour price if exists */}
                                    {product.prices.pour && (
                                      <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-105">
                                        <span className="text-xs text-slate-600 flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-[#F3F40C]" />
                                          На розлив (из бочки / 1л):
                                        </span>
                                        <span className="text-sm font-bold text-slate-950 font-mono">
                                          {product.prices.pour.toLocaleString('ru-RU')} ₽
                                        </span>
                                      </div>
                                    )}

                                    {/* 1L price */}
                                    <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-105">
                                      <span className="text-xs text-slate-600 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                                        Канистра 1 литр:
                                      </span>
                                      <span className="text-sm font-bold text-slate-800 font-mono font-medium">
                                        {product.prices.l1.toLocaleString('ru-RU')} ₽
                                      </span>
                                    </div>

                                    {/* 4L price */}
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-slate-600 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                                        Канистра 4 литра:
                                      </span>
                                      <span className="text-sm font-bold text-slate-800 font-mono font-medium">
                                        {product.prices.l4.toLocaleString('ru-RU')} ₽
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Custom CTA item button */}
                                <button
                                  onClick={() => selectOilForBooking(product.name)}
                                  className="w-full py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-950 hover:text-white hover:border-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                >
                                  <span>Выбрать для замены</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Booking Form (Запись на замену масла) */}
      <section ref={bookingRef} id="booking" className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-150/50 relative overflow-hidden">
            {/* Background decoration blur glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-950/5 rounded-full filter blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="booking-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 space-y-5"
                >
                  <div className="text-center space-y-3">
                    <div className="inline-flex py-1 px-3 bg-slate-100 text-slate-800 border border-[#EBEBEB] rounded-full text-xs font-semibold mr-auto">
                      📅 Быстрая запись онлайн
                    </div>
                    <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                      Запишитесь на замену масла в Калининграде
                    </h2>
                    <p className="text-slate-650 text-sm max-w-sm mx-auto">
                      Заполните форму, и мы свяжемся с вами в течение 10 минут для подтверждения времени записи.
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    {/* Name input */}
                    <div className="space-y-2">
                      <label htmlFor="name-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Ваше имя *</label>
                      <input 
                        id="name-input"
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Например, Александр"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 placeholder-slate-400 outline-none transition-all text-sm font-semibold"
                      />
                    </div>

                    {/* Phone input */}
                    <div className="space-y-2">
                       <label htmlFor="phone-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Ваш телефон *</label>
                      <input 
                        id="phone-input"
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (999) 999-99-99"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 placeholder-slate-400 outline-none transition-all text-sm font-mono font-semibold"
                      />
                    </div>

                    {/* Selected oil badge (shown if selected from catalog) */}
                    {selectedOil !== "none" && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Выбранное масло для замены</span>
                        <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-sm text-slate-900 font-semibold">
                          <span className="truncate mr-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#F3F40C]" />
                            {selectedOil}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setSelectedOil("none")} 
                            className="text-slate-600 hover:text-slate-950 underline text-xs font-bold cursor-pointer shrink-0"
                          >
                            Сбросить
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Form disclaimer policy */}
                    <p className="text-center text-[10px] text-slate-500 leading-normal">
                      Нажимая кнопку, вы подтверждаете свое согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности.
                    </p>

                    {/* Submit CTA button */}
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-base transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-950/10"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>Отправить заявку</span>
                    </button>

                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 text-center space-y-6 py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-600 mx-auto">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold font-display text-slate-900">Заявка успешно принята!</h2>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto">
                      Спасибо за доверие, <strong className="text-slate-900 font-bold">{fullName}</strong>. Наш менеджер уже обрабатывает ваши контакты.
                    </p>
                  </div>

                  {/* Summary card info */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-sm mx-auto space-y-3 font-mono text-xs text-slate-600">
                    <div className="text-center text-slate-800 border-b border-slate-200 pb-2 mb-2 font-bold font-sans">Детали вашей записи:</div>
                    <div className="flex justify-between">
                      <span>Имя:</span>
                      <span className="text-slate-900 font-semibold">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Телефон:</span>
                      <span className="text-slate-900 font-bold">{phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Выбранное масло:</span>
                      <span className="text-slate-900 font-bold break-all text-right max-w-[200px]">
                        {selectedOil === "none" ? "Подбор на месте" : selectedOil}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3 mt-3">
                      <span>Статус обработки:</span>
                      <span className="text-green-600 font-semibold uppercase tracking-wider animate-pulse">Ожидание звонка</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-550 max-w-sm mx-auto">
                    Мы созвонимся с вами по номеру <strong className="text-slate-700">{phone}</strong> в течение ближайших 10 минут, чтобы согласовать свободное время на замену моторного масла.
                  </p>

                  <button
                    onClick={handleResetForm}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Вернуться к форме
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* Contacts Block (Адрес, часы работы, интерактивное табло, ГИС ссылки) */}
      <section ref={contactsRef} id="contacts" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Contacts details column */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              
              {/* Icon cards blocks */}
              <div className="space-y-4">
                
                {/* ContactItem 1: Address */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Адрес</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">{CONTACTS.address}</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Ориентир — въезд рядом с промышленной зоной.</span>
                  </div>
                </div>

                {/* ContactItem 2: Working Hours */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Режим работы</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">Ежедневно: 9:00 – 19:00</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Мастера работают ежедневно без перерыва на обед.</span>
                  </div>
                </div>

                {/* ContactItem 3: Phones */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Телефоны для связи</div>
                    <div className="mt-1.5 space-y-1">
                      {CONTACTS.phones.map((phone, idx) => (
                        <a 
                          key={idx}
                          href={`tel:${phone.value}`}
                          className="block text-sm font-bold text-slate-800 hover:text-amber-600 transition-colors"
                        >
                          {phone.display}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* High-fidelity interactive embedded Yandex Maps Widget */}
            <div className="lg:col-span-7 min-h-[380px] lg:min-h-[400px] rounded-3xl overflow-hidden relative border border-slate-200 shadow-xl bg-slate-100 flex flex-col">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?ll=20.46917%2C54.69229&z=17&pt=20.46917%2C54.69229%2Cpm2aml&oid=178550117070" 
                className="w-full flex-1 h-0 border-0"
                allowFullScreen={true}
                loading="lazy"
                title="Адрес автосервиса ПроМасло"
              />
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shrink-0">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Адрес СТО: {CONTACTS.address}</span>
                  </div>
                  <p className="text-slate-500 leading-normal text-[11px]">
                    Калининград, ул. Суворова, 54У. Ориентир — въезд рядом с промышленной зоной.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a 
                    href="https://yandex.ru/maps/org/promaslo/178550117070/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all text-xs tracking-wide flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    🚀 Маршрут
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer block - No credit line, pure ownership, clean columns */}
      <footer className="bg-slate-50 text-slate-600 py-6 border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
            
            {/* Logo frame */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500">
                <Droplet className="w-5 h-5 text-slate-950 fill-current" />
              </div>
              <div>
                <span className="text-slate-900 font-extrabold text-base font-display">ПРОМАСЛО</span>
                <span className="text-[10px] text-slate-500 ml-2 tracking-wider font-mono">Калининград</span>
              </div>
            </div>

            {/* Nav footer */}
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => handleScrollTo(catalogRef)}
                className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
              >
                Каталог
              </button>
              <button 
                onClick={() => handleScrollTo(bookingRef)}
                className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
              >
                Запись онлайн
              </button>
              <button 
                onClick={() => handleScrollTo(contactsRef)}
                className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
              >
                Контакты
              </button>
            </div>

            {/* Quick call info */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end">
              <a 
                href={`tel:${CONTACTS.phones[0].value}`}
                className="text-slate-900 hover:text-amber-600 font-bold text-sm transition-colors whitespace-nowrap"
              >
                {CONTACTS.phones[0].display}
              </a>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 whitespace-nowrap">
                <Clock className="w-3" />
                <span>Ежедневно: 9:00 – 19:00</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} ПроМасло Калининград. Все права защищены. {CONTACTS.owner}
            </div>
            <div>
              Разработано в соответствии с высокими стандартами качества обслуживания автотранспорта
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
