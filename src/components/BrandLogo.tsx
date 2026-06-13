import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import brandLogos from "./brand-logos-metadata.json";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

// Robust mapping of clean alphanumeric names/aliases/translations to official slugs
const BRANDS_ALIAS_MAP: Record<string, string> = {
  "shell": "shell",
  "шелл": "shell",
  "шелы": "shell",
  
  "mobil": "mobil",
  "мобил": "mobil",
  
  "toyota": "toyota",
  "тойота": "toyota",
  
  "lukoil": "lukoil",
  "лукойл": "lukoil",
  
  "motul": "motul",
  "мотуль": "motul",
  
  "castrol": "castrol",
  "кастрол": "castrol",
  
  "zic": "zic",
  "зик": "zic",
  
  "liquimoly": "liqui-moly",
  "ликвимоли": "liqui-moly",
  "liqui": "liqui-moly",
  "moly": "liqui-moly",
  
  "vag": "vag",
  "volkswagen": "vag",
  "volks": "vag",
  "фольксваген": "vag",
  "ауди": "vag",
  
  "valvoline": "valvoline",
  "валволин": "valvoline",
  "валволайн": "valvoline",
  
  "vmpauto": "vmpauto",
  "вмпавто": "vmpauto",
  "вмп": "vmpauto",
  
  "bardahl": "bardahl",
  "бардаль": "bardahl",
  "бардахл": "bardahl",
  
  "total": "total",
  "тотал": "total",
  
  "genergy": "g-energy",
  "джиэнерджи": "g-energy",
  "gazprom": "g-energy",
  "газпром": "g-energy",
  
  "elf": "elf",
  "эльф": "elf",
  
  "kixx": "kixx",
  "кикс": "kixx",
  
  "idemitsu": "idemitsu",
  "идемитсу": "idemitsu",
  
  "gm": "gm",
  "джиэм": "gm",
  
  "repsol": "repsol",
  "репсол": "repsol",
  
  "sintec": "sintec",
  "синтек": "sintec",
  
  "soil": "s-oil",
  "эсойл": "s-oil",
  "сейвен": "s-oil",
  
  "rowe": "rowe",
  "рове": "rowe",
  
  "rolf": "rolf",
  "рольф": "rolf",
  
  "teboil": "teboil",
  "тебоил": "teboil",
  "тебойл": "teboil",
  
  "autobacs": "autobacs",
  "автобакс": "autobacs",
  
  "aral": "aral",
  "арал": "aral",
  
  "addinol": "addinol",
  "аддинол": "addinol",
  
  "ngn": "ngn",
  "нгн": "ngn"
};

const BRANDS_DOMAINS_MAP: Record<string, string> = {
  "shell": "shell.com",
  "mobil": "mobil.com",
  "toyota": "toyota.com",
  "lukoil": "lukoil.com",
  "motul": "motul.com",
  "castrol": "castrol.com",
  "zic": "skzic.com",
  "liqui-moly": "liqui-moly.com",
  "vag": "volkswagen.de",
  "valvoline": "valvoline.com",
  "vmpauto": "smazka.ru",
  "bardahl": "bardahl.com",
  "total": "totalenergies.com",
  "g-energy": "g-energy.org",
  "elf": "elf.com",
  "kixx": "kixxoil.com",
  "idemitsu": "idemitsu.com",
  "gm": "gm.com",
  "repsol": "repsol.com",
  "sintec": "sinteclubricants.ru",
  "s-oil": "s-oil7.com",
  "rowe": "rowe-oil.com",
  "rolf": "rolfoil.ru",
  "teboil": "teboil.fi",
  "autobacs": "autobacs.com",
  "aral": "aral.de",
  "addinol": "addinol.de",
  "ngn": "ngn-oil.com"
};

export default function BrandLogo({ brand, className = "w-12 h-6" }: BrandLogoProps) {
  const norm = brand.trim().toLowerCase();

  // SERVICE / УСЛУГИ
  if (norm.includes("услуг") || norm.includes("service")) {
    return (
      <div className={`shrink-0 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg ${className} shadow-sm`}>
        <Wrench className="w-4 h-4 text-[#FAEC00] stroke-[2.5]" />
      </div>
    );
  }

  // Find matched slug using clean alphanumeric lookup
  const cleanKey = norm.replace(/[^a-z0-9а-яё]/g, "");
  let matchedSlug = "";

  // 1. Direct key match
  if (BRANDS_ALIAS_MAP[cleanKey]) {
    matchedSlug = BRANDS_ALIAS_MAP[cleanKey];
  } else {
    // 2. Fragment matches
    const foundEntry = Object.entries(BRANDS_ALIAS_MAP).find(([alias]) => {
      return cleanKey.includes(alias) || alias.includes(cleanKey);
    });
    if (foundEntry) {
      matchedSlug = foundEntry[1];
    }
  }

  const matchedLogoUrl = matchedSlug ? (brandLogos as Record<string, string>)[matchedSlug] : "";

  // Highly robust path resolver to handle any Vite BASE_URL configuration flawlessly
  const resolveLogoUrl = (url: string): string => {
    if (!url) return "";
    
    // Get clean relative path (strip leading slash, dot-slash, etc.)
    let cleanPath = url;
    if (cleanPath.startsWith("./")) {
      cleanPath = cleanPath.slice(2);
    } else if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.slice(1);
    }

    const base = import.meta.env.BASE_URL || "/";

    if (base === "./") {
      return `./${cleanPath}`;
    }
    if (base.endsWith("/")) {
      return `${base}${cleanPath}`;
    }
    return `${base}/${cleanPath}`;
  };

  const initialRelativeSrc = resolveLogoUrl(matchedLogoUrl);

  const [src, setSrc] = useState(initialRelativeSrc);
  const [fallbackQueue, setFallbackQueue] = useState<string[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  // Generate candidate fallbacks for self-healing loader
  const getFallbackCandidates = (slug: string, originalUrl: string): string[] => {
    if (!slug) return [];
    
    const base = import.meta.env.BASE_URL || "/";
    const formats = [".svg", ".png", ".jpg", ".ico", ".PNG", ".SVG", ".JPG", ".ICO"];
    const casings = [
      slug.toLowerCase(),
      slug.toUpperCase(),
      slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
    ];

    const uniqueCasings = Array.from(new Set(casings));
    const candidates: string[] = [];

    // 1. Try absolute version of the configured URL first
    if (originalUrl && !originalUrl.startsWith("http")) {
      candidates.push(originalUrl);
    }

    // 2. Generate combinations of casings, formats, and folder casing (logos vs Logos)
    for (const folder of ["logos", "Logos"]) {
      for (const casing of uniqueCasings) {
        for (const fmt of formats) {
          const relPath = `${folder}/${casing}${fmt}`;
          
          let relUrl = "";
          if (base === "./") {
            relUrl = `./${relPath}`;
          } else if (base.endsWith("/")) {
            relUrl = `${base}${relPath}`;
          } else {
            relUrl = `${base}/${relPath}`;
          }

          const absUrl = `/${relPath}`;

          if (relUrl) candidates.push(relUrl);
          candidates.push(absUrl);
        }
      }
    }

    // 3. Online ultra-reliable public CDN fallbacks if domain is mapped
    const domain = BRANDS_DOMAINS_MAP[slug];
    if (domain) {
      candidates.push(`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`);
      candidates.push(`https://logo.clearbit.com/${domain}`);
      candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      candidates.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
    }

    // Filter unique values that are different from our starting relative src
    return Array.from(new Set(candidates)).filter(c => c !== initialRelativeSrc);
  };

  // Sync state if brand or slug changes
  useEffect(() => {
    setSrc(initialRelativeSrc);
    setFallbackQueue(getFallbackCandidates(matchedSlug, matchedLogoUrl));
    setLoadFailed(false);
  }, [initialRelativeSrc, matchedSlug, matchedLogoUrl]);

  if (matchedLogoUrl && !loadFailed) {
    const handleError = () => {
      if (fallbackQueue.length > 0) {
        const nextSrc = fallbackQueue[0];
        setFallbackQueue(prev => prev.slice(1));
        setSrc(nextSrc);
      } else {
        setLoadFailed(true);
      }
    };

    return (
      <div className={`relative shrink-0 flex items-center justify-center bg-white rounded-lg overflow-hidden ${className} shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-slate-200/60 p-0.5`}>
        <img
          src={src}
          alt={brand}
          className="w-full h-full object-contain pointer-events-none transition-opacity duration-300"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      </div>
    );
  }

  // Perfect dark/gold styled text badge as fallback
  const initial = brand.trim().charAt(0).toUpperCase();
  return (
    <div className={`shrink-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-[#FAEC00] select-none font-display font-black text-[11px] uppercase border border-slate-800 rounded-lg shadow-sm ${className}`}>
      {brand.trim().slice(0, 3).toUpperCase()}
    </div>
  );
}
