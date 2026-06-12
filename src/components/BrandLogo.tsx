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

  // Prepare standard base-prefixed path
  const base = import.meta.env.BASE_URL || "/";
  const initialRelativeSrc = matchedLogoUrl
    ? (matchedLogoUrl.startsWith("/")
        ? (base.endsWith("/") ? `${base}${matchedLogoUrl.slice(1)}` : `${base}${matchedLogoUrl}`)
        : (base.endsWith("/") ? `${base}${matchedLogoUrl}` : `${base}/${matchedLogoUrl}`))
    : "";

  const [src, setSrc] = useState(initialRelativeSrc);
  const [loadFailed, setLoadFailed] = useState(false);

  // Sync state if brand or slug changes
  useEffect(() => {
    setSrc(initialRelativeSrc);
    setLoadFailed(false);
  }, [initialRelativeSrc]);

  if (matchedLogoUrl && !loadFailed) {
    const handleError = () => {
      // If base-prefixed fails, try fallback direct path
      if (src !== matchedLogoUrl) {
        setSrc(matchedLogoUrl);
      } else {
        // Only set loadFailed if the image is truly missing, which should not happen for public files
        setLoadFailed(true);
      }
    };

    return (
      <div className={`relative shrink-0 flex items-center justify-center bg-white rounded-lg overflow-hidden ${className} shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-slate-200/60 p-1`}>
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
