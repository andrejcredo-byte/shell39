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
  AlertTriangle,
  Search,
  Send,
  Instagram,
  MessageCircle,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CONTACTS } from "./data";
import BrandLogo from "./components/BrandLogo";

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
  brand: string;
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
 * группирует товары по брендам из файла prices.csv и генерирует переключатели и карточки.
 *
 * КАК ДОБАВИТЬ НОВЫЙ ТОВАР:
 * Чтобы добавить новый товар, откройте файл 'prices.csv' в текстовом редакторе или в Excel
 * и просто вставьте новую строчку снизу с указанием всех колонок. Например:
 * "Shell,Shell Helix Ultra 5W-30 4л,5200"
 *
 * КАК ИЗМЕНИТЬ ЦЕНУ ТОВАРА:
 * Найдите нужный товар по названию в файле 'prices.csv', измените числовые значения цен
 * и сохраните файл.
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

  const idxBrand = findIndex(["бренд", "brand", "производитель", "марка"]);
  const idxCategory = findIndex(["категория", "category", "тип"]);
  const idxName = findIndex(["наименование", "название", "name", "товар"]);
  const idxSinglePrice = findIndex(["цена", "price", "стоимость"]);
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

    // Получаем базовые значения
    const brandFromCol = idxBrand !== -1 ? (values[idxBrand] || "") : "";
    const category = idxCategory !== -1 ? (values[idxCategory] || "") : "";
    const name = idxName !== -1 ? (values[idxName] || "") : "";

    // Обязательная базовая валидация записи
    if (!name) {
      continue;
    }

    const nameLower = name.toLowerCase();
    if (nameLower.includes("антифриз") || nameLower.includes("antifreeze")) {
      continue;
    }

    // Восстанавливаем бренд из названия или категории, если колонка "Бренд" пустая или отсутствует
    let brand = brandFromCol.trim();
    if (!brand) {
      const knownBrands = [
        "ADDINOL", "ARAL", "AUTOBACS", "Bardahl", "Castrol", "Elf", "G-Energy", "GM",
        "Idemitsu", "Kixx", "LIQUI MOLY", "Mobil", "Motul", "NGN", "REPSOL", "ROLF",
        "ROWE", "S-OIL", "Shell", "Sintec", "TOYOTA", "Teboil", "Total", "VAG",
        "Valvoline", "ZIC", "ВМПАВТО", "Лукойл"
      ];
      const nameUpper = name.toUpperCase();
      const matchedBrand = knownBrands.find(b => {
        const bUpper = b.toUpperCase();
        return nameUpper.startsWith(bUpper) || nameUpper.includes(` ${bUpper} `) || nameUpper.includes(`${bUpper} `) || nameUpper.includes(` ${bUpper}`);
      });
      if (matchedBrand) {
        brand = matchedBrand;
      } else if (category && (category.toLowerCase().includes("услуг") || category.toLowerCase().includes("сервис"))) {
        brand = "Услуги";
      } else if (name.toLowerCase().includes("замен") || name.toLowerCase().includes("услуг")) {
        brand = "Услуги";
      } else {
        brand = category || name.split(" ")[0] || "Другие";
      }
    }

    // Расширенная чистка цен
    const parsePriceValue = (val: string | undefined): number | undefined => {
      if (!val) return undefined;
      const digits = val.replace(/\s/g, '').replace(/[^\d]/g, '');
      const num = parseInt(digits, 10);
      return isNaN(num) ? undefined : num;
    };

    const pricePour = idxPricePour !== -1 ? parsePriceValue(values[idxPricePour]) : undefined;
    const priceL1 = idxPrice1l !== -1 ? parsePriceValue(values[idxPrice1l]) : undefined;
    const priceL4 = idxPrice4l !== -1 ? parsePriceValue(values[idxPrice4l]) : undefined;
    const singlePriceRaw = idxSinglePrice !== -1 ? parsePriceValue(values[idxSinglePrice]) : undefined;

    let viscosity = idxViscosity !== -1 ? (values[idxViscosity] || "") : "";
    if (!viscosity) {
      const vMatch = name.match(/\b\d+W-\d+\b/i);
      if (vMatch) {
        viscosity = vMatch[0];
      } else if (nameLower.includes("atf")) {
        viscosity = "ATF";
      } else if (nameLower.includes("lhm")) {
        viscosity = "LHM";
      } else if (nameLower.includes("lds")) {
        viscosity = "LDS";
      } else if (nameLower.includes("da")) {
        viscosity = "DA";
      }
    }

    const checkBool = (val: string | undefined): boolean => {
      if (!val) return false;
      const term = val.toLowerCase().trim();
      return ["да", "yes", "true", "1", "д"].includes(term);
    };

    const isSynthetic = idxSynthetic !== -1 ? checkBool(values[idxSynthetic]) : (nameLower.includes("synthetic") || nameLower.includes("ultra") || nameLower.includes("armortech") || nameLower.includes("platinum") || nameLower.includes("synpower"));
    const isSemiSynthetic = idxSemiSynthetic !== -1 ? checkBool(values[idxSemiSynthetic]) : (nameLower.includes("semi") || nameLower.includes("полусинтет") || nameLower.includes("super 3000") || nameLower.includes("universal") || nameLower.includes("hightec"));
    const isUltra = idxUltra !== -1 ? checkBool(values[idxUltra]) : nameLower.includes("ultra");
    const isDiesel = idxDiesel !== -1 ? checkBool(values[idxDiesel]) : (nameLower.includes("diesel") || nameLower.includes("дизель"));

    // Автоматическое определение цены
    const isService = brand.toLowerCase().includes("услуг") || category.toLowerCase().includes("услуг") || viscosity.toLowerCase().includes("услуг");
    let singlePrice = singlePriceRaw;
    if (singlePrice === undefined && (isService || (!pricePour && !priceL1 && !priceL4))) {
      singlePrice = priceL4 || priceL1 || pricePour;
    }

    // Автоматическое назначение путей к локальным картинкам:
    // Чтобы не ломать картинки, сопоставляем от 1 до 12, а услуги на service.jpg
    let image = "";
    if (idxImage !== -1 && values[idxImage]) {
      image = values[idxImage];
    } else {
      image = isService ? "service.jpg" : `${(i % 12) + 1}.jpg`;
    }

    result.push({
      id: `csv-${i}-${encodeURIComponent(name.slice(0, 12))}`,
      brand,
      category: category || brand,
      name,
      prices: {
        pour: pricePour,
        l1: priceL1,
        l4: priceL4
      },
      singlePrice,
      viscosity: viscosity || (isService ? "Услуги" : (category || brand)),
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

function extractVolumeAndBaseName(fullName: string) {
  let name = fullName.trim();
  // Clean raw trailing quotes
  name = name.replace(/^["']|["']$/g, '').trim();

  // Try to find volume patterns:
  // e.g. "4л металл", "1л розлив", "1л", "4л", "5л", "208л", "4 л", "4l", "5l.", "1 л.", "5л." etc.
  const regexVolume = /(\d+(?:\+\d+)?)\s*(?:л\.|л|l\.|l|литров|литра|литр)\s*(розлив|металл|жесть)?/i;
  const regexPourOnly = /\bрозлив\b/i;
  const regexCombo = /\b4\+1\b/i;

  let volume = "";
  let matchedStr = "";

  if (regexVolume.test(name)) {
    const match = name.match(regexVolume);
    if (match) {
      matchedStr = match[0];
      volume = match[0];
    }
  } else if (regexPourOnly.test(name)) {
    const match = name.match(regexPourOnly);
    if (match) {
      matchedStr = match[0];
      volume = "розлив";
    }
  } else if (regexCombo.test(name)) {
    const match = name.match(regexCombo);
    if (match) {
      matchedStr = match[0];
      volume = "4+1";
    }
  }

  let baseName = name;
  if (matchedStr) {
    const index = name.lastIndexOf(matchedStr);
    if (index !== -1) {
      baseName = name.substring(0, index) + name.substring(index + matchedStr.length);
    }
  }

  // Clean the baseName
  baseName = baseName
    .replace(/\b(?:масло моторное|моторное масло)\b/i, '')
    .replace(/[,.;\s]+$/, '') // remove trailing punctuation and spaces
    .replace(/^[,.;\s]+/, '') // remove leading punctuation and spaces
    .replace(/\s+/g, ' ')     // collapse extra spaces
    .trim();

  // Normalize volume for consistent, beautiful display
  if (!volume) {
    if (name.toLowerCase().includes("розлив")) {
      volume = "розлив";
    } else {
      volume = "пакет";
    }
  } else {
    volume = volume.toLowerCase().trim();
    volume = volume
      .replace(/литр(?:ов|а)?/g, 'л')
      .replace(/l/g, 'л')
      .replace(/\./g, '')
      .replace(/\s+/g, ' ');

    const numberAndUnitMatch = volume.match(/^(\d+(?:\+\d+)?)\s*л(.*)$/);
    if (numberAndUnitMatch) {
      const num = numberAndUnitMatch[1];
      const rest = numberAndUnitMatch[2].trim();
      volume = num + "л" + (rest ? " " + rest : "");
    }
  }

  return { baseName, volume };
}

export default function App() {
  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Close brand dropdown on click outside or when selecting
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // States для динамической загрузки цен из CSV
  const [products, setProducts] = useState<CSVProduct[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Каждое открытие страницы загружает актуальные цены из prices.csv в корне
  useEffect(() => {
    async function loadPrices() {
      try {
        setIsLoading(true);
        setCsvError(null);
        
        const base = import.meta.env.BASE_URL || "/";
        const csvUrl = base.endsWith("/") ? `${base}prices.csv` : `${base}/prices.csv`;
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`Не удалось найти файл цен (prices.csv) по адресу ${csvUrl}. Статус: ${response.status}`);
        }
        
        const text = await response.text();
        const parsed = parsePricesCSV(text);
        
        setProducts(parsed);
        
        // Динамически получаем все уникальные бренды из CSV (чтобы исключить дубли)
        const uniqueBrands = Array.from(new Set(parsed.map(p => p.brand))).filter(Boolean);
        
        // Сортируем по алфавиту, но услуги помещаем в конец
        const sorted = uniqueBrands.sort((a, b) => {
          if (a === "Услуги") return 1;
          if (b === "Услуги") return -1;
          return a.localeCompare(b, "ru");
        });
        
        setBrands(sorted);
        
      } catch (err: any) {
        console.error("Ошибка при разборе prices.csv:", err);
        setCsvError(err.message || "Неизвестная ошибка загрузки цен.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPrices();
  }, []);
  
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

  const selectOilForBooking = (oilName: string) => {
    // Scrolling immediately to the Yandex Booking iframe
    handleScrollTo(bookingRef);
  };

  
    return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 antialiased selection:bg-slate-950 selection:text-white relative">
      {/* Viewport-fixed background gradient that stays dynamic as the user scrolls */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#FFF5D1] via-[#FFD25A] via-[#FFAE00] to-[#E28500] pointer-events-none" />
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-amber-500/30 shadow-xs relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ProMasloLogo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => handleScrollTo(catalogRef)}
              className="text-slate-700 hover:text-amber-950 hover:bg-amber-500/10 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Каталог масел
            </button>
            <button 
              onClick={() => handleScrollTo(bookingRef)}
              className="text-slate-700 hover:text-amber-950 hover:bg-amber-500/10 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Запись на замену
            </button>
            <button 
              onClick={() => handleScrollTo(contactsRef)}
              className="text-slate-700 hover:text-amber-950 hover:bg-amber-500/10 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Контакты
            </button>
          </nav>

          {/* Desktop Call to Actions & Contact */}
          <div className="hidden md:flex items-center gap-5">
            <div className="text-right flex flex-col items-end">
              <a 
                href={`tel:${CONTACTS.phones[0].value}`}
                className="group flex items-center gap-1.5 text-base font-black text-slate-950 hover:text-[#E28500] transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#E28500] fill-[#E28500] shrink-0 group-hover:scale-110 transition-transform" />
                <span>+7 (4012) 900-079</span>
              </a>
              <div className="flex items-center gap-2.5 text-[11px] text-amber-950/60 mt-1 justify-end flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-900/40 shrink-0" />
                  <span>{CONTACTS.address}</span>
                </div>
                <span className="text-amber-300">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-900/40 shrink-0" />
                  <span>Ежедневно: 9:00 – 19:00</span>
                </div>
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
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 border border-amber-500/30 active:bg-amber-500/30 rounded-xl text-sm font-black text-amber-955 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />
              <span className="font-mono tracking-tight text-amber-950 leading-none">900-079</span>
            </a>

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-amber-950 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
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
              className="absolute left-0 right-0 top-full z-45 md:hidden bg-[#FFF9E6] border-b border-amber-500/30 px-4 pt-2 pb-6 space-y-4 shadow-xl"
            >
              <div className="space-y-1">
                <button 
                  onClick={() => handleScrollTo(catalogRef)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-amber-955 hover:text-slate-950 hover:bg-amber-500/15 active:bg-amber-500/20 transition-all text-base font-extrabold"
                >
                  Каталог масел
                </button>
                <button 
                  onClick={() => handleScrollTo(bookingRef)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-amber-955 hover:text-slate-950 hover:bg-amber-500/15 active:bg-amber-500/20 transition-all text-base font-extrabold"
                >
                  Запись на замену
                </button>
                <button 
                  onClick={() => handleScrollTo(contactsRef)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-amber-955 hover:text-slate-950 hover:bg-amber-500/15 active:bg-amber-500/20 transition-all text-base font-extrabold"
                >
                  Контакты
                </button>
              </div>

              <div className="border-t border-amber-500/15 pt-4 px-4 space-y-3">
                <div className="space-y-1">
                  {CONTACTS.phones.map((phone, idx) => (
                    <a 
                      key={idx}
                      href={`tel:${phone.value}`}
                      className="block text-base font-bold text-slate-950 font-display hover:text-amber-600 transition-colors"
                    >
                      {phone.display}
                    </a>
                  ))}
                  <div className="flex items-center gap-1.5 text-xs text-amber-900/60 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-800/40 shrink-0" />
                    <span>Ежедневно 9:00 – 19:00</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-amber-900/60 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-800/40 shrink-0 mt-0.5" />
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
      <section className="relative overflow-hidden py-8 md:py-14 bg-transparent">
        {/* Clean Background with Subtle Ambient Soft Radial Highlight */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,transparent_75%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Core Message Area */}
            <div className="space-y-5 flex flex-col items-center">
              {/* Yandex & 2GIS Rating Badges */}
              <div className="flex flex-row items-center justify-center gap-3">
                {/* Yandex Rating Award Link Badge */}
                <a 
                  href="https://yandex.ru/maps/org/promaslo/25579278228/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[160px] min-w-[160px] max-w-[160px] h-[50px] shrink-0 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/50 p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-white hover:border-amber-400 active:scale-95 duration-150 relative"
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
                  className="w-[160px] min-w-[160px] max-w-[160px] h-[50px] shrink-0 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/50 p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all hover:bg-white hover:border-amber-400 active:scale-95 duration-150 relative"
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

              {/* Elegant Frosted Glass Container to emphasize text readability over the golden background */}
              <div className="relative w-full py-8 px-6 sm:px-12 md:py-12 rounded-3xl bg-white/45 backdrop-blur-md shadow-lg border border-white/60 flex flex-col items-center space-y-5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none" />

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display leading-tight text-slate-950 tracking-tight relative z-10">
                  Замена моторного масла <br className="hidden sm:inline" />
                  в Калининграде
                </h1>

                <p className="text-slate-955 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-semibold relative z-10">
                  Быстро, надежно и по честным ценам. Наша основная миссия – продлить жизнь вашему двигателю с помощью оригинальных масел от известных и надёжных брендов.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => handleScrollTo(bookingRef)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-base transition-all duration-300 hover:shadow-md hover:shadow-slate-950/15 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer relative z-10"
                >
                  Записаться онлайн
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleScrollTo(catalogRef)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/80 backdrop-blur-xs hover:bg-white text-slate-900 border border-amber-300/40 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
                >
                  Открыть каталог
                </button>
              </div>

              {/* Fast Statistics Labeling */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-5 border-t border-b border-slate-950 w-full max-w-md mx-auto">
                <div>
                  <div className="text-2xl font-black font-display text-slate-950">20 мин</div>
                  <div className="text-xs font-semibold text-slate-800">Среднее время замены</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-display text-slate-950">100%</div>
                  <div className="text-xs font-semibold text-slate-800">Оригинальное масло</div>
                </div>
                <div className="col-span-2 md:col-span-1 border-t border-slate-950/10 md:border-t-0 pt-2 md:pt-0">
                  <div className="text-2xl font-black font-display text-slate-950">30%</div>
                  <div className="text-xs font-semibold text-slate-800">Экономия на розливе</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Catalog Section - Integrated smoothly with the gold background */}
      <section ref={catalogRef} id="catalog" className="py-12 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Catalog Headers */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">Каталог Масел</h2>
          </div>

          {isLoading ? (
            /* Состояние загрузки - красивый анимированный скелетон */
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Загрузка каталога...</p>
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
              {/* Custom Modern Brand Select Dropdown */}
              <div className="max-w-md mx-auto mb-6 text-center relative z-20" ref={brandDropdownRef}>
                {/* Dropdown Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBrandDropdownOpen(!isBrandDropdownOpen);
                    setBrandSearchQuery(""); // Clear search filter on open
                  }}
                  className={`w-full min-h-[50px] px-4.5 py-3 rounded-xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                    selectedBrand 
                      ? "bg-white/95 border-amber-505 text-slate-950 shadow-md font-extrabold" 
                      : "bg-[#FFF9E6]/95 border-amber-300/80 text-slate-900 hover:bg-white hover:border-amber-500 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedBrand ? (
                      <div className="flex items-center gap-2">
                        <BrandLogo brand={selectedBrand} className="w-10 h-5 border border-amber-200 bg-white shrink-0 object-contain rounded" />
                        <span className="text-amber-900 text-xs font-mono select-none">Бренд:</span>
                      </div>
                    ) : (
                      <div className="w-7 h-5 rounded bg-amber-500/20 flex items-center justify-center text-amber-955 shrink-0">
                        <Search className="w-3 h-3 text-amber-955" />
                      </div>
                    )}
                    <span className="font-extrabold text-xs tracking-wide uppercase font-display select-none">
                      {selectedBrand || "Другие бренды масел из списка"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isBrandDropdownOpen ? "rotate-180 text-slate-950" : "text-amber-900/60"}`} />
                </button>

                {/* Dropdown Options Popup */}
                <AnimatePresence>
                  {isBrandDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute z-30 left-0 right-0 mt-2 bg-[#FFF9E6] border border-amber-500/30 rounded-xl shadow-xl overflow-hidden text-left"
                    >
                      {/* Search Input Box */}
                      <div className="p-3 border-b border-amber-500/15 bg-amber-500/5 flex items-center gap-2">
                        <Search className="w-4 h-4 text-amber-900 shrink-0" />
                        <input
                          type="text"
                          placeholder="Поиск бренда..."
                          value={brandSearchQuery}
                          onChange={(e) => setBrandSearchQuery(e.target.value)}
                          className="w-full bg-transparent border-none text-slate-900 text-xs font-black leading-none placeholder-amber-900/40 focus:outline-none py-1.5 font-mono"
                          autoFocus
                          onClick={(e) => e.stopPropagation()} // Prevent close
                        />
                        {brandSearchQuery && (
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBrandSearchQuery("");
                            }}
                            className="text-amber-905 hover:text-red-600 font-bold text-xs px-1"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Brands Option List */}
                      <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-amber-300">
                        {(() => {
                           const filtered = brands.filter(b => 
                            b.toLowerCase().includes(brandSearchQuery.toLowerCase())
                           );

                           if (filtered.length === 0) {
                             return (
                               <div className="px-4 py-6 text-center text-xs text-amber-950/70 font-bold">
                                 Брендов не найдено
                               </div>
                             );
                           }

                           return filtered.map((brandName) => {
                             const isChosen = selectedBrand === brandName;
                             const count = products.filter(p => p.brand === brandName).length;

                             return (
                               <button
                                 key={brandName}
                                 type="button"
                                 onClick={() => {
                                   setSelectedBrand(brandName);
                                   setIsBrandDropdownOpen(false);
                                   setBrandSearchQuery("");
                                   // Smooth scroll down to products listing anchor or slightly below
                                   setTimeout(() => {
                                     const element = document.getElementById("brand-results-anchor");
                                     if (element) {
                                       element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                     }
                                   }, 100);
                                 }}
                                 className={`w-full px-4 py-2.5 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-between border-b border-amber-500/5 last:border-0 transition-all ${
                                   isChosen 
                                     ? "bg-slate-950 text-white shadow-xs" 
                                     : "text-slate-800 hover:bg-amber-400/25 hover:text-slate-955"
                                 }`}
                               >
                                 <span className="flex items-center gap-3 select-none text-left">
                                   <BrandLogo brand={brandName} className="w-10 h-5 border border-amber-200 bg-white rounded object-contain" />
                                   <span>{brandName}</span>
                                 </span>
                                 <span className={`text-[10px] font-mono font-extrabold ${isChosen ? "text-amber-400" : "text-amber-900/60"}`}>
                                   {count} шт.
                                 </span>
                               </button>
                             );
                           });
                         })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Popular Brands Selection */}
              <div className="max-w-2xl mx-auto mb-10 text-center">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-950 uppercase tracking-widest block mb-3.5 select-none text-center">
                  Популярные бренды для быстрой замены:
                </span>
                <div className="flex flex-wrap justify-center items-center gap-2 px-2">
                  {["Shell", "Лукойл", "Mobil", "ZIC"].map((brandName) => {
                    const isSelected = selectedBrand === brandName;
                    return (
                      <button
                        key={brandName}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brandName);
                          setIsBrandDropdownOpen(false);
                          setBrandSearchQuery("");
                          // Smooth scroll down to products listing anchor or slightly below
                          setTimeout(() => {
                            const element = document.getElementById("brand-results-anchor");
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                          }, 100);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold font-display uppercase tracking-wider transition-all duration-250 cursor-pointer ${
                          isSelected
                            ? "bg-slate-950 border-slate-950 text-white shadow-md scale-102"
                            : "bg-white/70 backdrop-blur-xs border-amber-300/60 text-slate-800 hover:bg-white hover:border-amber-500 hover:text-slate-950"
                        }`}
                      >
                        <BrandLogo brand={brandName} className="w-8 h-4 rounded-sm bg-white shrink-0 object-contain" />
                        <span>{brandName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anchor for results */}
              <div id="brand-results-anchor" className="scroll-mt-24" />

              {/* Products Area */}
              <AnimatePresence mode="wait">
                {selectedBrand !== "" ? (
                  /* Products Present State - Framed inside an elegant luxury white frosted tile card */
                  <motion.div
                    key={selectedBrand}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/80 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-8 shadow-lg space-y-4"
                  >
                    {/* Header showing active brand */}
                    {(() => {
                      const brandProducts = products.filter(p => p.brand === selectedBrand);

                      const groupedMap: { [key: string]: {
                        baseName: string;
                        viscosity: string;
                        attributes: {
                          isSynthetic?: boolean;
                          isSemiSynthetic?: boolean;
                          isUltra?: boolean;
                          isDiesel?: boolean;
                        };
                        volumes: { volume: string; price: number }[];
                      } } = {};

                      brandProducts.forEach(p => {
                        const { baseName, volume } = extractVolumeAndBaseName(p.name);
                        const key = baseName.toLowerCase().replace(/\s+/g, ' ').trim();
                        const actualPrice = p.singlePrice !== undefined ? p.singlePrice : (p.prices.pour || p.prices.l1 || p.prices.l4 || 0);

                        if (!groupedMap[key]) {
                          groupedMap[key] = {
                            baseName,
                            viscosity: p.viscosity === p.brand ? "" : p.viscosity,
                            attributes: {
                              isSynthetic: p.attributes.isSynthetic,
                              isSemiSynthetic: p.attributes.isSemiSynthetic,
                              isUltra: p.attributes.isUltra,
                              isDiesel: p.attributes.isDiesel
                            },
                            volumes: []
                          };
                        }

                        if (!groupedMap[key].volumes.some(v => v.volume === volume)) {
                          groupedMap[key].volumes.push({ volume, price: actualPrice });
                        }
                      });

                      const volumeOrder: { [key: string]: number } = {
                        "1л": 1,
                        "1л розлив": 2,
                        "розлив": 3,
                        "4л": 4,
                        "4+1": 5,
                        "5л": 6,
                        "20л": 7,
                        "60л": 8,
                        "208л": 9
                      };

                      const getVolumeOrderScore = (vol: string) => {
                        const vLower = vol.toLowerCase();
                        if (volumeOrder[vLower] !== undefined) {
                          return volumeOrder[vLower];
                        }
                        const matchNum = vLower.match(/^(\d+)/);
                        if (matchNum) {
                          return parseInt(matchNum[1], 10) * 10 + (vLower.includes("розлив") ? 0.5 : 0);
                        }
                        return 999;
                      };

                      const groupedList = Object.values(groupedMap).map(g => {
                        g.volumes.sort((a, b) => getVolumeOrderScore(a.volume) - getVolumeOrderScore(b.volume));
                        return g;
                      }).sort((a, b) => a.baseName.localeCompare(b.baseName, "ru"));

                      return (
                        <>
                          {/* Ultra Clean Info Row instead of heavy banners */}
                          <div className="flex items-center justify-between border-b border-amber-950/10 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
                                {selectedBrand === "Услуги" ? "Наши Услуги и Сервис" : selectedBrand}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
                                {groupedList.length} позиций
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedBrand("")}
                              className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Сбросить ×
                            </button>
                          </div>

                          {/* List of Grouped Products - Ultra compact table format */}
                          <div className="divide-y divide-slate-100">
                            {groupedList.map((group, idx) => (
                              <div 
                                key={idx}
                                className="py-2.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 transition-colors hover:bg-slate-100/30 px-1 rounded"
                              >
                                {/* Left side: Name + tags */}
                                <div className="space-y-0.5 sm:max-w-[70%]">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                                      {group.baseName}
                                    </h4>
                                    
                                    {/* Small modern metadata badges */}
                                    <div className="flex gap-1 flex-wrap shrink-0">
                                      {group.attributes.isUltra && (
                                        <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-[#FAEC00] text-slate-950 px-1.5 py-0.5 rounded leading-none">
                                          Ultra
                                        </span>
                                      )}
                                      {group.attributes.isSemiSynthetic && (
                                        <span className="text-[9px] font-mono font-semibold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-none">
                                          Полусинтетика
                                        </span>
                                      )}
                                      {group.attributes.isSynthetic && !group.attributes.isUltra && (
                                        <span className="text-[9px] font-mono font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded leading-none">
                                          Синтетика
                                        </span>
                                      )}
                                      {group.attributes.isDiesel && (
                                        <span className="text-[9px] font-mono font-semibold uppercase bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded leading-none">
                                          Дизель
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right side: Compact inline options list with bullet points */}
                                <div className="flex flex-wrap gap-x-3.5 gap-y-1 sm:justify-end shrink-0">
                                  {group.volumes.map((v, vIdx) => (
                                    <div key={vIdx} className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                                      <span className="text-[#FAEC00] font-bold select-none text-[12px]">•</span>
                                      <span className="text-slate-500 capitalize-first text-[11px] sm:text-xs">{v.volume}</span>
                                      <span className="text-slate-300">—</span>
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{v.price.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                ) : (
                  /* Clean subtle placeholder when no brand is selected */
                  <motion.div
                    key="empty-brand-placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-center py-12 px-4 max-w-md mx-auto border border-dashed border-amber-955/20 rounded-2xl bg-white/45 backdrop-blur-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-955/5 flex items-center justify-center mx-auto mb-3 text-amber-900 border border-amber-955/10">
                      <Droplet className="w-4.5 h-4.5 animate-pulse text-amber-600" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1 font-display">Каталог не выбран</h3>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Выберите один из популярных брендов выше или найдите нужного производителя через поиск в выпадающем меню.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

        </div>
      </section>

      {/* Booking Form (Запись на замену масла) */}
      <section ref={bookingRef} id="booking" className="py-14 bg-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display uppercase tracking-wider">
              Онлайн-запись на замену масла
            </h2>
          </div>

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
      <section ref={contactsRef} id="contacts" className="py-14 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Contacts details column */}
            <div className="lg:col-span-10 xl:col-span-5 space-y-4 flex flex-col justify-between">
              
              {/* Icon cards blocks */}
              <div className="space-y-4">
                
                {/* ContactItem 1: Address */}
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/40 flex items-start gap-4 transition-all hover:bg-white hover:border-amber-400 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-950 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-800 uppercase tracking-widest font-mono font-bold">Адрес</div>
                    <div className="text-sm font-black text-slate-900 mt-1">{CONTACTS.address}</div>
                  </div>
                </div>

                {/* ContactItem 2: Working Hours */}
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/40 flex items-start gap-4 transition-all hover:bg-white hover:border-amber-400 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-950 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-800 uppercase tracking-widest font-mono font-bold">Режим работы</div>
                    <div className="text-sm font-black text-slate-900 mt-1 font-display">Ежедневно: 9:00 – 19:00</div>
                  </div>
                </div>

                {/* ContactItem 3: Phones */}
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/40 flex items-start gap-4 transition-all hover:bg-white hover:border-amber-400 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-950 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-800 uppercase tracking-widest font-mono font-bold">Телефоны для связи</div>
                    <div className="mt-1.5 space-y-1">
                      {CONTACTS.phones.map((phone, idx) => (
                        <a 
                          key={idx}
                          href={`tel:${phone.value}`}
                          className="block text-sm font-black text-slate-900 hover:text-amber-850 transition-colors font-display"
                        >
                          {phone.display}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ContactItem 4: Socials & Navigation */}
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/40 flex flex-col gap-3 transition-all hover:bg-white hover:border-amber-400 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-950 shrink-0">
                      <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5 fill-amber-950/20" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-800 uppercase tracking-widest font-mono font-bold">Социальные сети и навигация</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Свяжитесь с нами удобным способом или постройте маршрут на карте</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-1">
                    {/* Yandex Maps / "Макс" */}
                    <a
                      href="https://yandex.ru/maps/org/promaslo/25579278228/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 hover:bg-amber-100 transition-all shadow-xs"
                    >
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Яндекс.Карты (Макс)</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/79527982234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 hover:bg-emerald-100 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/10 shrink-0" />
                      <span>WhatsApp</span>
                    </a>

                    {/* VK */}
                    <a
                      href="https://vk.com/promaslo39"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0077FF]/5 border border-[#0077FF]/20 text-xs font-bold text-[#0044AA] hover:bg-[#0077FF]/10 transition-all shadow-xs"
                    >
                      <Share2 className="w-4 h-4 text-[#0077FF] shrink-0" />
                      <span>ВКонтакте</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://instagram.com/promaslo39"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs font-bold text-rose-955 hover:bg-rose-100/80 transition-all shadow-xs"
                    >
                      <Instagram className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>

            {/* High-fidelity interactive embedded Yandex Maps Widget with fallback */}
            <div className="lg:col-span-12 xl:col-span-7 min-h-[380px] lg:min-h-[440px] rounded-3xl overflow-hidden relative border border-[#E28500]/20 shadow-xl bg-slate-50 flex flex-col">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=25579278228" 
                className="w-full flex-1 min-h-[280px] border-0"
                allowFullScreen={true}
                loading="lazy"
                title="Адрес автосервиса ПроМасло"
              />
              <div className="p-4 bg-white/90 border-t border-amber-250/20 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shrink-0">
                <div className="space-y-1">
                  <div className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">Интерактивная карта</div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Адрес СТО: {CONTACTS.address}</span>
                  </div>
                </div>

                {/* Fallback Action Links for resilience */}
                <div className="flex gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                  <a 
                    href="https://yandex.ru/maps/org/promaslo/25579278228/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>Яндекс.Карты ↗</span>
                  </a>
                  <a 
                    href="https://2gis.ru/kaliningrad/firm/70000001043806096"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>2ГИС ↗</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer block - Clean minimal copyright line */}
      <footer className="bg-amber-950/90 text-amber-100/70 py-7 border-t border-amber-900/40 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-amber-200/50">
            <div>
              © {new Date().getFullYear()} ПроМасло Калининград. Все права защищены. {CONTACTS.owner}
            </div>
            <div>
              Разработано в соответствии с высокими стандартами качества обслуживания автотранспорта
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons Dock */}
      <div className="fixed bottom-16 sm:bottom-12 right-6 sm:right-8 z-[9999] flex flex-col items-center gap-3">
        <AnimatePresence>
          {/* Telegram Button (Official Black Style) */}
          <motion.a
            href="https://t.me/+79527982234"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/40 transition-all cursor-pointer border border-slate-900"
            title="Написать в Telegram"
          >
            <Send className="h-5 w-5 -translate-x-0.5 translate-y-0.5 fill-white text-white" />
            <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-slate-900 text-white text-xs font-black py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap leading-none select-none">
              Telegram
            </span>
          </motion.a>
        </AnimatePresence>
      </div>

    </div>
  );
}
