import fs from "fs";
import path from "path";

interface BrandInfo {
  name: string;
  slug: string;
  domains: string[];
}

const BRANDS: BrandInfo[] = [
  { name: "Shell", slug: "shell", domains: ["shell.com", "shell.ru"] },
  { name: "Mobil", slug: "mobil", domains: ["mobil.com", "mobil.ru"] },
  { name: "Toyota", slug: "toyota", domains: ["toyota.com", "toyota.ru"] },
  { name: "Lukoil", slug: "lukoil", domains: ["lukoil.ru", "lukoil.com"] },
  { name: "Motul", slug: "motul", domains: ["motul.com", "motul.ru"] },
  { name: "Castrol", slug: "castrol", domains: ["castrol.com", "castrol.ru"] },
  { name: "ZIC", slug: "zic", domains: ["skzic.com", "zicoil.ru"] },
  { name: "Liqui Moly", slug: "liqui-moly", domains: ["liqui-moly.com", "liqui-moly.ru"] },
  { name: "VAG", slug: "vag", domains: ["volkswagen.de", "volkswagen.com"] },
  { name: "Valvoline", slug: "valvoline", domains: ["valvoline.com"] },
  { name: "VMPAUTO", slug: "vmpauto", domains: ["smazka.ru", "vmpauto.ru"] },
  { name: "Bardahl", slug: "bardahl", domains: ["bardahl.com", "bardahl-reklam.ru"] },
  { name: "Total", slug: "total", domains: ["totalenergies.com", "total.com"] },
  { name: "G-Energy", slug: "g-energy", domains: ["gazpromneft-oil.ru", "g-energy.ru", "g-energy.org"] },
  { name: "Elf", slug: "elf", domains: ["elf.com", "elf-lub.ru"] },
  { name: "Kixx", slug: "kixx", domains: ["kixxoil.com", "kixxoil.ru"] },
  { name: "Idemitsu", slug: "idemitsu", domains: ["idemitsu.com", "idemitsu.ru"] },
  { name: "GM", slug: "gm", domains: ["gm.com"] },
  { name: "Repsol", slug: "repsol", domains: ["repsol.com", "repsol.ru"] },
  { name: "Sintec", slug: "sintec", domains: ["sinteclubricants.ru", "sintec-oil.ru"] },
  { name: "S-Oil", slug: "s-oil", domains: ["www.s-oil.com", "s-oil7.com", "s-oil.com"] },
  { name: "ROWE", slug: "rowe", domains: ["rowe-oil.com", "rowe-oil.ru"] },
  { name: "ROLF", slug: "rolf", domains: ["rolfoil.ru", "rolf-lubricants.ru"] },
  { name: "Teboil", slug: "teboil", domains: ["teboil.ru", "teboil.fi"] },
  { name: "AUTOBACS", slug: "autobacs", domains: ["autobacs.com", "autobacs.ru"] },
  { name: "ARAL", slug: "aral", domains: ["aral.de"] },
  { name: "ADDINOL", slug: "addinol", domains: ["addinol.de", "addinol.ru"] },
  { name: "NGN", slug: "ngn", domains: ["ngn-oil.com", "ngn-oil.ru"] }
];

async function downloadLogos() {
  const logosDir = path.join(process.cwd(), "public", "logos");
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const metadata: Record<string, string> = {};

  for (const b of BRANDS) {
    console.log(`\n========================================`);
    console.log(`Processing: ${b.name}`);
    console.log(`========================================`);
    let downloaded = false;

    // We try to fetch high-quality logos
    for (const domain of b.domains) {
      if (downloaded) break;
      console.log(`  Trying domain: ${domain}`);

      // High quality sources prioritized
      const providers = [
        { name: "Clearbit", url: `https://logo.clearbit.com/${domain}` },
        { name: "GoogleV2_128", url: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` },
        { name: "GoogleV2_128_HTTP", url: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128` },
        { name: "GoogleS2_128", url: `https://www.google.com/s2/favicons?sz=128&domain=${domain}` },
        { name: "DuckDuckGo", url: `https://icons.duckduckgo.com/ip3/${domain}.ico` }
      ];

      for (const prov of providers) {
        try {
          console.log(`    Fetching from ${prov.name}...`);
          const res = await fetch(prov.url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: AbortSignal.timeout(5000)
          });

          if (!res.ok) {
            console.log(`      Status ${res.status} (Failed)`);
            continue;
          }

          const buf = await res.arrayBuffer();
          const size = buf.byteLength;
          console.log(`      Status ${res.status}, size = ${size} bytes`);

          // 1. Check size: if less than 1500 bytes (1.5KB), it is almost certainly a generic favicon or 16x16 icon
          if (size < 1200) {
            console.log(`      [REJECTED] Too small (${size} bytes) - likely 16x16 placeholder`);
            continue;
          }

          // 2. Check content signature: inspect first 50 bytes to make sure it's not HTML / text
          const header = Buffer.from(buf).slice(0, 100).toString();
          if (header.includes("<!DOCTYPE") || header.includes("<html") || header.includes("<xml") || header.includes("<?xml") || header.includes("<html>")) {
            console.log(`      [REJECTED] Contains HTML - probably redirect or error template page`);
            continue;
          }

          // Determine extension
          const contentType = res.headers.get("content-type") || "";
          let ext = ".png";
          if (contentType.includes("image/svg") || prov.url.endsWith(".svg")) {
            ext = ".svg";
          } else if (contentType.includes("image/x-icon") || prov.url.endsWith(".ico")) {
            ext = ".ico";
          } else if (contentType.includes("image/jpeg") || prov.url.endsWith(".jpg") || prov.url.endsWith(".jpeg")) {
            ext = ".jpg";
          }

          const filename = `${b.slug}${ext}`;
          const savePath = path.join(logosDir, filename);

          fs.writeFileSync(savePath, Buffer.from(buf));
          metadata[b.slug] = `/logos/${filename}`;
          console.log(`      [SUCCESS] Saved as ${filename} (${size} bytes)`);
          downloaded = true;
          break;
        } catch (e: any) {
          console.log(`      [ERROR] fetch crashed: ${e.message || e}`);
        }
      }
    }

    if (!downloaded) {
      console.log(`  [WARN] ${b.name} could not be downloaded with high quality.`);
    }
  }

  // Save metadata
  const metadataPath = path.join(process.cwd(), "src", "components", "brand-logos-metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
  console.log(`\n========================================`);
  console.log(`Done! Metadata written to ${metadataPath}`);
  console.log(`========================================`);
}

downloadLogos().catch(console.error);
