import { useState, useRef, RefObject, useEffect } from "react";
import { 
  Droplet, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CONTACTS } from "./data";

function ProMasloLogo({ showText = true, dark = false }: { showText?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none text-left">
      <svg viewBox="0 0 1184 1184" className="w-14 h-14 shrink-0 transition-transform duration-300 hover:scale-105">
        <circle cx="592" cy="592" r="592" fill="#000"/>
        <circle cx="592" cy="330" r="255" fill="#efefef" stroke="#fff200" strokeWidth="12"/>

        {/* Канистра поднята выше и отцентрирована */}
        <g transform="translate(0,-65)">
          <rect x="455" y="190" width="62" height="28" rx="6" fill="#000"/>
          <path fill="#000" d="
            M455 230 C455 210 470 195 490 195
            L585 195
            C610 195 630 205 650 220
            L735 285
            C760 304 775 332 775 365
            L775 510
            C775 550 745 580 705 580
            L500 580
            C460 580 430 550 430 510
            L430 250
            C430 238 440 230 455 230 Z"/>
          <path fill="#efefef" d="M600 235 L720 320 L720 385 L545 265 Z"/>
          <path fill="#fff200" d="
            M592 348
            C560 390 540 425 540 455
            C540 500 570 530 592 530
            C614 530 644 500 644 455
            C644 425 624 390 592 348 Z"/>
          <path fill="#000" d="
            M592 372
            C573 400 565 425 565 455
            L565 512
            C579 521 585 523 592 524 Z"/>
        </g>

        <text x="592" y="840"
              textAnchor="middle"
              fontFamily="Arial Black, Arial, sans-serif"
              fontSize="165"
              fontWeight="900"
              fill="#efefef">ПроМасло</text>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-base font-black tracking-tight leading-none font-display ${dark ? 'text-white' : 'text-slate-950'}`}>
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

interface CSVProduct {
  id: string;
  category: string;
  name: string;
  prices: {
    pour?: number;
    l1?: number;
    l4?: number;
  };
  singlePrice?: number;
  viscosity: string;
  image: string;
  attributes: {
    isSynthetic?: boolean;
    isSemiSynthetic?: boolean;
    isUltra?: boolean;
    isDiesel?: boolean;
  };
}

/**
 * Высокоустойчивый компонент для отображения изображений товаров.
 * Если локальная картинка (например, "1.jpg" в корне) еще не загружена пользователем на хостинг Beget,
 * компонент автоматически и плавно заменяет её на премиальную интерактивную SVG заглушку.
 * Это предотвращает отображение "битых" картинок браузера.
 */
function InteractiveProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-slate-55/60 text-slate-400 p-3 select-none rounded-xl border border-slate-100">
        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-450 mb-2 border border-slate-200 shadow-xs">
          <Droplet className="w-5 h-5 text-[#FAEC00] stroke-slate-900 fill-[#FAEC00]/40 animate-pulse" />
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center leading-normal">
          Shell Helix
        </span>
        <span className="text-[9px] text-slate-400 text-center mt-0.5">
          Оригинал на розлив & в канистрах
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}

/**
 * ============================================================================
 * ПАРСЕР И ОПИСАНИЕ РАБОТЫ С PRICES.CSV (ДЛЯ ВЛАДЕЛЬЦА)
 * ============================================================================
 * ГДЕ ЗАГРУЖАЕТСЯ CSV:
 * Загрузка файла prices.csv происходит в главном компоненте App внутри хука useEffect
 * при открытии страницы через стандартный браузерный запрос API fetch('/prices.csv').
 * Это позволяет каталогу оставаться динамическим и обновляться без перезаписи кода.
 *
 * ГДЕ СТРОИТСЯ КАТАЛОГ:
 * Каталог строится динамически в JSX-разметке компонента App (в секции #catalog). Он
 * группирует товары по категориям из файла prices.csv и генерирует аккордеоны и карточки.
 *
 * КАК ДОБАВИТЬ НОВЫЙ ТОВАР:
 * Чтобы добавить новый товар, откройте файл 'prices.csv' в текстовом редакторе или в Excel
 * и просто вставьте новую строчку снизу с указанием всех колонок. Например:
 * "5W-40,Shell Helix HX8 5W-40,1300,1500,5500,5W-40,Да"
 *
 * КАК ИЗМЕНИТЬ ЦЕНУ ТОВАРА:
 * Найдите нужный товар по названию в файле 'prices.csv', измените числовые значения цен
 * (розлив, 1л, 4л или общую цену в зависимости от категории) и сохраните файл.
 *
 * КАК РАБОТАЮТ ИЗОБРАЖЕНИЯ:
 * Ссылки на тяжелые внешние картинки полностью удалены из CSV!
 * База подготовлена для локального хостинга: масла ссылаются на "1.jpg", "2.jpg" и т.д.
 * по порядковому номеру масел, а услуги на "service.jpg".
 * Вы можете просто загрузить файлы картинок "1.jpg", "2.jpg" ... в корень сайта на Beget.
 * ============================================================================
 */
function parsePricesCSV(text: string): CSVProduct[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("Файл баз данных цен prices.csv пуст или содержит некорректную структуру заголовков.");
  }

  // Интеллектуальное определение разделителя по частоте вхождения (запятая или точка с запятой)
  const firstLine = lines[0];
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const separator = semicolons > commas ? ";" : ",";

  // Разбор заголовков с полной чисткой кавычек и пробельных краев
  const rawHeaders = firstLine.split(separator).map(h => h.replace(/^["']|["']$/g, '').trim());

  // Отказоустойчивый поиск колонок по ключевым семантическим алиасам
  const findIndex = (aliases: string[]) => {
    return rawHeaders.findIndex(header => {
      const hNorm = header.toLowerCase();
      return aliases.some(alias => hNorm.includes(alias.toLowerCase()));
    });
  };

  const idxCategory = findIndex(["категория", "category", "тип"]);
  const idxName = findIndex(["наименование", "название", "name", "товар"]);
  const idxPricePour = findIndex(["розлив", "из бочки", "pour", "бочк"]);
  const idxPrice1l = findIndex(["цена 1л", "1 литр", "1л", "1l", "цена 1 л"]);
  const idxPrice4l = findIndex(["цена 4л", "4 литра", "4л", "4l", "цена 4 л"]);
  const idxViscosity = findIndex(["вязкость", "viscosity", "sae"]);
  const idxImage = findIndex(["изображение", "картинка", "фото", "image", "photo"]);
  const idxSynthetic = findIndex(["синтетика", "synthetic"]);
  const idxSemiSynthetic = findIndex(["полусинтетика", "semi-synthetic", "semisynthetic"]);
  const idxUltra = findIndex(["ультра", "ultra"]);
  const idxDiesel = findIndex(["дизель", "diesel"]);

  const result: CSVProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Безопасный разбор строки CSV с экранированием двойных кавычек
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        values.push(current.replace(/^["']|["']$/g, '').trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.replace(/^["']|["']$/g, '').trim());

    // Получаем значение категории и названия по сопоставленным индексам
    const category = idxCategory !== -1 ? (values[idxCategory] || "") : "";
    const name = idxName !== -1 ? (values[idxName] || "") : "";

    // Обязательная базовая валидация записи
    if (!category || !name) {
      continue;
    }

    // Очистка числовых значений цен от пробелов, знаков ₽, букв руб и приведение в тип number
    const parsePriceValue = (val: string | undefined): number | undefined => {
      if (!val) return undefined;
      const digits = val.replace(/\s/g, '').replace(/[^\d]/g, '');
      const num = parseInt(digits, 10);
      return isNaN(num) ? undefined : num;
    };

    const pricePour = idxPricePour !== -1 ? parsePriceValue(values[idxPricePour]) : undefined;
    const priceL1 = idxPrice1l !== -1 ? parsePriceValue(values[idxPrice1l]) : undefined;
    const priceL4 = idxPrice4l !== -1 ? parsePriceValue(values[idxPrice4l]) : undefined;

    const viscosity = idxViscosity !== -1 ? (values[idxViscosity] || "") : "";

    const checkBool = (val: string | undefined): boolean => {
      if (!val) return false;
      const term = val.toLowerCase().trim();
      return ["да", "yes", "true", "1", "д"].includes(term);
    };

    const isSynthetic = idxSynthetic !== -1 ? checkBool(values[idxSynthetic]) : false;
    const isSemiSynthetic = idxSemiSynthetic !== -1 ? checkBool(values[idxSemiSynthetic]) : false;
    const isUltra = idxUltra !== -1 ? checkBool(values[idxUltra]) : false;
    const isDiesel = idxDiesel !== -1 ? checkBool(values[idxDiesel]) : false;

    // Автоматическое определение единой цены для разделов Услуги
    const isService = category.toLowerCase().includes("услуг") || viscosity.toLowerCase().includes("услуг");
    let singlePrice: number | undefined = undefined;
    if (isService) {
      singlePrice = priceL4 || priceL1 || pricePour;
    }

    // Автоматическое назначение путей к локальным картинкам:
    // Первые 12 позиций масел получат 1.jpg, 2.jpg... по порядку строк масел, а услуги - service.jpg
    let image = "";
    if (idxImage !== -1 && values[idxImage]) {
      image = values[idxImage];
    } else {
      image = isService ? "service.jpg" : `${i}.jpg`;
    }

    result.push({
      id: `csv-${i}-${encodeURIComponent(name.slice(0, 12))}`,
      category,
      name,
      prices: {
        pour: pricePour,
        l1: priceL1,
        l4: priceL4
      },
      singlePrice,
      viscosity: viscosity || (isService ? "Услуги" : category),
      image,
      attributes: {
        isSynthetic,
        isSemiSynthetic,
        isUltra,
        isDiesel
      }
    });
  }

  if (result.length === 0) {
    throw new Error("В файле prices.csv не найдено ни одного валидного товара.");
  }

  return result;
}

export default function App() {
  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedViscosityFilter, setSelectedViscosityFilter] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // States для динамической загрузки цен из CSV
  const [products, setProducts] = useState<CSVProduct[]>([]);
  const [viscosities, setViscosities] = useState<string[]>(["all"]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Каждое открытие страницы загружает актуальные цены из prices.csv в корне
  useEffect(() => {
    async function loadPrices() {
      try {
        setIsLoading(true);
        setCsvError(null);
        
        const response = await fetch("/prices.csv");
        if (!response.ok) {
          throw new Error(`Не удалось найти файл цен (prices.csv) по адресу /prices.csv. Статус: ${response.status}`);
        }
        
        const text = await response.text();
        const parsed = parsePricesCSV(text);
        
        setProducts(parsed);
        
        // Динамически получаем все уникальные категории из CSV (чтобы исключить дубли)
        const categories = Array.from(new Set(parsed.map(p => p.category)))
          .filter(Boolean);
        
        setViscosities(["all", ...categories]);
        
        // По умолчанию первая категория открыта для привлечения внимания владельца машины, остальные свернуты
        const initialExpanded: Record<string, boolean> = {};
        categories.forEach((cat, idx) => {
          initialExpanded[cat] = idx === 0;
        });
        setExpandedCategories(initialExpanded);
        
      } catch (err: any) {
        console.error("Ошибка при разборе prices.csv:", err);
        setCsvError(err.message || "Неизвестная ошибка загрузки цен.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPrices();
  }, []);
  
  // Custom interactive dropdown state for catalog
  const [isViscosityDropdownOpen, setIsViscosityDropdownOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = (elementRef: RefObject<HTMLDivElement | null>) => {
    const element = elementRef.current;
    if (element) {
      // Вычисляем координату скролла ПРЯМО сейчас, до закрытия мобильного меню,
      // чтобы избежать искажений координат при анимациях закрытия на мобильных устройствах.
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 95; // 80px (sticky хедер) + 15px (эстетический зазор)
      
      setIsMobileMenuOpen(false);
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectOilForBooking = (oilName: string) => {
    // Scrolling immediately to the Yandex Booking iframe
    handleScrollTo(bookingRef);
  };

  
    return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs relative">
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
                className="group flex items-center gap-1.5 text-base font-black text-slate-950 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>+7 (4012) 900-079</span>
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

          {/* Mobile elements (Phone & Hamburger Menu) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Clickable phone number for mobile */}
            <a 
              href="tel:+74012900079"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/80 active:bg-slate-100 rounded-xl text-sm font-black text-slate-950 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
              <span className="font-mono tracking-tight text-slate-900 leading-none">900-079</span>
            </a>

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
              aria-label="Иконка меню"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer - Rendered as absolute overlay underneath the sticky header */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-40 md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-xl"
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
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{CONTACTS.address}</span>
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
                  className="w-[160px] min-w-[160px] max-w-[160px] h-[50px] shrink-0 rounded-xl bg-[#F5F5F5] p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-neutral-200/60 active:scale-95 duration-150 relative border border-transparent"
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
                  className="w-[160px] min-w-[160px] max-w-[160px] h-[50px] shrink-0 rounded-xl bg-[#F5F5F5] p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-neutral-200/60 active:scale-95 duration-150 relative border border-transparent"
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
      {/* ГДЕ СТРОИТСЯ КАТАЛОГ: Разметка ниже динамически строит каталог на основе загруженных из CSV данных */}
      <section ref={catalogRef} id="catalog" className="py-10 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Catalog Headers */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">Каталог и Стоимость Услуг</h2>
          </div>

          {isLoading ? (
            /* Состояние загрузки - красивый анимированный скелетон */
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm font-mono uppercase tracking-wider">Загрузка каталога товаров и цен из prices.csv...</p>
            </div>
          ) : csvError ? (
            /* Состояние ошибки: нет CSV-файла, поврежден или пуст */
            <div className="p-8 text-center max-w-xl mx-auto my-10 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
              <h4 className="text-lg font-bold text-red-900 mb-2 font-display">Ошибка работы с базой данных цен</h4>
              <p className="text-sm text-red-600 mb-4">{csvError}</p>
              <div className="text-xs text-slate-600 text-left bg-white p-4 rounded-xl border border-red-100 space-y-2 leading-relaxed">
                <p className="font-bold text-slate-800">Инструкция по исправлению:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Проверьте, загружен ли файл <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs font-semibold">prices.csv</code> на сервер.</li>
                  <li>Убедитесь, что он лежит в корневом каталоге сайта (рядом с файлом <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs font-semibold">index.html</code>).</li>
                  <li>Проверьте структуру файла: первая строка должна содержать правильные заголовки через запятую.</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              {/* modern Dropdown Menu (Выплывающее меню) AND Filter Pill bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                
                {/* Visual selector label */}
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-slate-900" />
                  <span className="text-sm font-semibold text-slate-700">Быстрый поиск по категориям:</span>
                </div>

                {/* Interactive Dropdown Button (выплывающее меню) */}
                <div className="relative">
                  <button
                    onClick={() => setIsViscosityDropdownOpen(!isViscosityDropdownOpen)}
                    className="w-64 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-sm font-bold flex items-center justify-between transition-all shadow-sm cursor-pointer"
                  >
                    <span>
                      {selectedViscosityFilter === "all" 
                        ? "Все категории (Показать все)" 
                        : /W-\d+|0W|5W|10W|15W|20W/.test(selectedViscosityFilter) 
                          ? `Вязкость: ${selectedViscosityFilter}` 
                          : selectedViscosityFilter}
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
                              {visc === "all" 
                                ? "🌐 Все категории" 
                                : /W-\d+|0W|5W|10W|15W|20W/.test(visc) 
                                  ? `🛢️ Shell Helix ${visc}` 
                                  : `🔧 ${visc}`}
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
                  // Filter products matching current CSV category
                  const categoryProducts = products.filter(p => p.category === category);
                  
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
                              {/W-\d+|0W|5W|10W|15W|20W/.test(category) ? `Масла ${category}` : category}
                            </h3>
                            <p className="text-xs text-slate-550 mt-1">
                              {category.toLowerCase().includes("услуг") 
                                ? `Доступно: ${categoryProducts.length} видов услуг` 
                                : `В наличии: ${categoryProducts.length} наименований`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:inline-block text-xs text-slate-555 font-mono font-medium">
                            {isOpen ? "Свернуть блок" : "Развернуть блок"}
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
                                      {product.image && (
                                        <div className="relative aspect-square w-full max-w-[170px] mx-auto mb-6 bg-slate-50 rounded-xl flex items-center justify-center p-4 group-hover:scale-[1.03] transition-transform duration-300">
                                          <InteractiveProductImage 
                                            src={product.image} 
                                            alt={product.name}
                                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.11)]"
                                          />
                                          {/* Glass reflection effect */}
                                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
                                        </div>
                                      )}

                                      {/* Title name */}
                                      <h4 className="text-base font-bold text-slate-800 mb-4 line-clamp-2 min-h-[3rem] font-display">
                                        {product.name}
                                      </h4>

                                      {/* Pricing Information breakdown */}
                                      <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                                        <div className="text-xs font-mono tracking-wide uppercase text-slate-400 mb-2 font-semibold">Варианты и цены:</div>

                                        {product.singlePrice !== undefined ? (
                                          /* Если указана фиксированная одиночная цена */
                                          <div className="flex justify-between items-center py-1">
                                            <span className="text-xs text-slate-600 flex items-center gap-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                                              Стоимость услуги:
                                            </span>
                                            <span className="text-sm font-bold text-slate-950 font-mono">
                                              {product.singlePrice.toLocaleString('ru-RU')} ₽
                                            </span>
                                          </div>
                                        ) : (product.prices.pour || product.prices.l1 || product.prices.l4) ? (
                                          /* Если указаны стандартные масляные фасовки */
                                          <>
                                            {/* Pour price if exists */}
                                            {product.prices.pour && (
                                              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-105">
                                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FAEC00]" />
                                                  На розлив (из бочки / 1л):
                                                </span>
                                                <span className="text-sm font-bold text-slate-950 font-mono">
                                                  {product.prices.pour.toLocaleString('ru-RU')} ₽
                                                </span>
                                              </div>
                                            )}

                                            {/* 1L price */}
                                            {product.prices.l1 && (
                                              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-105">
                                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                  Канистра 1 литр:
                                                </span>
                                                <span className="text-sm font-bold text-slate-800 font-mono font-medium">
                                                  {product.prices.l1.toLocaleString('ru-RU')} ₽
                                                </span>
                                              </div>
                                            )}

                                            {/* 4L price */}
                                            {product.prices.l4 && (
                                              <div className="flex justify-between items-center py-1">
                                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                  Канистра 4 литра:
                                                </span>
                                                <span className="text-sm font-bold text-slate-800 font-mono font-medium">
                                                  {product.prices.l4.toLocaleString('ru-RU')} ₽
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          /* Обработка ошибок: если цены отсутствуют */
                                          <div className="flex justify-between items-center py-1">
                                            <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                              Цена не указана:
                                            </span>
                                            <span className="text-sm font-bold text-red-600 font-mono animate-pulse">
                                              Цена по запросу
                                            </span>
                                          </div>
                                        )}
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
            </>
          )}

        </div>
      </section>

      {/* Booking Form (Запись на замену масла) */}
      <section ref={bookingRef} id="booking" className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="p-1 sm:p-2 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-150/50 relative overflow-hidden h-[710px] flex flex-col">
            <iframe 
              src="https://yandex.ru/business/widget/request/company/25579278228" 
              className="w-full flex-1 h-full border-0 rounded-2xl"
              title="Онлайн запись на замену масла ПроМасло"
              allowFullScreen
            />
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
                src="https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=25579278228" 
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
                <span className="text-slate-900 font-extrabold text-base font-display">ПроМасло</span>
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
