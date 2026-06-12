import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import brandLogos from "./brand-logos-metadata.json";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export default function BrandLogo({ brand, className = "w-6 h-6" }: BrandLogoProps) {
  const norm = brand.trim().toLowerCase();

  // SERVICE / УСЛУГИ
  if (norm.includes("услуг") || norm.includes("service")) {
    return (
      <div className={`shrink-0 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-md ${className}`}>
        <Wrench className="w-3.5 h-3.5 text-[#FAEC00] stroke-[2.5]" />
      </div>
    );
  }

  // Let's find a matching logo from our downloaded metadata map
  let matchedLogoUrl = "";
  
  // Try exact slug lookup or sub-slug checks
  const entry = Object.entries(brandLogos as Record<string, string>).find(([slug]) => {
    return norm.includes(slug) || slug.includes(norm);
  });

  if (entry) {
    matchedLogoUrl = entry[1];
  }

  // Manual fallback overrides for Russian names/synonyms
  if (!matchedLogoUrl) {
    if (norm.includes("лукойл")) {
      matchedLogoUrl = brandLogos["lukoil"];
    } else if (norm.includes("вмпавто")) {
      matchedLogoUrl = brandLogos["vmpauto"];
    } else if (norm.includes("volkswagen")) {
      matchedLogoUrl = brandLogos["vag"];
    } else if (norm.includes("genergy")) {
      matchedLogoUrl = brandLogos["g-energy"];
    }
  }

  const base = import.meta.env.BASE_URL || "/";
  const initialRelativeSrc = matchedLogoUrl
    ? (matchedLogoUrl.startsWith("/")
        ? (base.endsWith("/") ? `${base}${matchedLogoUrl.slice(1)}` : `${base}${matchedLogoUrl}`)
        : (base.endsWith("/") ? `${base}${matchedLogoUrl}` : `${base}/${matchedLogoUrl}`))
    : "";

  const [src, setSrc] = useState(initialRelativeSrc);
  const [loadFailed, setLoadFailed] = useState(false);

  // Sync state if brand or matched logo changes
  useEffect(() => {
    setSrc(initialRelativeSrc);
    setLoadFailed(false);
  }, [initialRelativeSrc]);

  if (matchedLogoUrl && !loadFailed) {
    const handleError = () => {
      // If the loader fails with the BASE_URL-prefixed path, try root-relative fallback
      if (src !== matchedLogoUrl) {
        setSrc(matchedLogoUrl);
      } else {
        // If even the root-relative fails, fall back to styled letters
        setLoadFailed(true);
      }
    };

    return (
      <div className={`relative shrink-0 flex items-center justify-center bg-white rounded-md overflow-hidden ${className} shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-slate-200/50 p-1`}>
        <img
          src={src}
          alt={brand}
          className="w-full h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      </div>
    );
  }

  // Fallback to stylized text badge
  const initial = brand.trim().charAt(0).toUpperCase();
  return (
    <div className={`shrink-0 flex items-center justify-center bg-slate-900 text-[#FAEC00] select-none font-display font-black text-[13px] border border-slate-700/60 rounded-md shadow-inner ${className}`}>
      {initial}
    </div>
  );
}
