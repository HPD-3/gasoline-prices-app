/**
 * Vercel Serverless Function - Fuel Prices API
 * Scrapes Indonesian fuel prices from MyPertamina
 * Returns all fuel types: Pertalite, Pertamax, Pertamax Turbo, etc.
 */

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const results = await scrapeFuelPrices();

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
        source: "live",
        timestamp: new Date().toISOString(),
      });
    }

    // Return fallback data if scraping fails
    const fallbackData = getFallbackData();
    return res.status(200).json({
      success: true,
      count: fallbackData.length,
      data: fallbackData,
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API error:", err.message);
    const fallbackData = getFallbackData();
    return res.status(200).json({
      success: true,
      count: fallbackData.length,
      data: fallbackData,
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
}

async function scrapeFuelPrices() {
  try {
    const axios = await import("axios");
    const cheerio = await import("cheerio");

    const url = "https://mypertamina.id/about/product-price";

    const { data } = await axios.default.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    const results = [];

    // Try multiple selectors to find the table
    let tableRows = $("table tbody tr");
    
    if (tableRows.length === 0) {
      // Try alternate selector
      tableRows = $("tbody tr");
    }
    
    if (tableRows.length === 0) {
      // Try to find all tr elements in any table
      tableRows = $("tr").filter((i, el) => {
        const cells = $(el).find("td");
        return cells.length >= 2;
      });
    }

    console.log(`Found ${tableRows.length} table rows`);

    // Parse the table rows - extract all fuel types
    tableRows.each((i, el) => {
      const cells = $(el).find("td");
      
      if (cells.length >= 2) {
        const location = $(cells[0]).text().trim();
        
        // Extract all fuel prices
        const pertalite = extractPrice($(cells[1]).text());
        const pertamax = cells.length > 2 ? extractPrice($(cells[2]).text()) : null;
        const pertamaxTurbo = cells.length > 3 ? extractPrice($(cells[3]).text()) : null;
        const pertamaxGreen95 = cells.length > 4 ? extractPrice($(cells[4]).text()) : null;
        const biosolarSubsidi = cells.length > 5 ? extractPrice($(cells[5]).text()) : null;
        const dexlite = cells.length > 6 ? extractPrice($(cells[6]).text()) : null;
        const pertaminaDex = cells.length > 7 ? extractPrice($(cells[7]).text()) : null;
        const biosolarNonSubsidi = cells.length > 8 ? extractPrice($(cells[8]).text()) : null;
        const pertamaxPertashop = cells.length > 9 ? extractPrice($(cells[9]).text()) : null;
        
        if (location && location.length > 3 && pertalite) {
          // Clean up location name
          let cleanLocation = location
            .replace(/^Prov\.\s*/, "")
            .replace(/^Free Trade Zone \(FTZ\)\s*/, "");
          
          results.push({
            location: cleanLocation,
            pertalite: pertalite,
            pertamax: pertamax,
            pertamax_turbo: pertamaxTurbo,
            pertamax_green_95: pertamaxGreen95,
            biosolar_subsidi: biosolarSubsidi,
            dexlite: dexlite,
            pertamina_dex: pertaminaDex,
            biosolar_non_subsidi: biosolarNonSubsidi,
            pertamax_pertashop: pertamaxPertashop,
            updated_at: new Date().toISOString(),
          });
        }
      }
    });

    console.log(`Scraped ${results.length} locations from MyPertamina`);
    return results;
  } catch (error) {
    console.error("Scraping error:", error.message);
    throw error;
  }
}

function extractPrice(text) {
  const priceMatch = text.match(/Rp\s*([\d.]+)/);
  if (priceMatch) {
    let priceIDR = priceMatch[1].replace(/\./g, "");
    return parseInt(priceIDR);
  }
  return null;
}

function getFallbackData() {
  return [
    { location: "Aceh", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sumatera Utara", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sumatera Barat", pertalite: 10000, pertamax: 12900, pertamax_turbo: 20250, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24650, pertamina_dex: 24950, biosolar_non_subsidi: null, pertamax_pertashop: 12800, updated_at: new Date().toISOString() },
    { location: "Riau", pertalite: 10000, pertamax: 12900, pertamax_turbo: 20250, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24650, pertamina_dex: 24950, biosolar_non_subsidi: null, pertamax_pertashop: 12800, updated_at: new Date().toISOString() },
    { location: "Kepulauan Riau", pertalite: 10000, pertamax: 12900, pertamax_turbo: 20250, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24650, pertamina_dex: 24950, biosolar_non_subsidi: null, pertamax_pertashop: 12800, updated_at: new Date().toISOString() },
    { location: "Jambi", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Bengkulu", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sumatera Selatan", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Bangka-Belitung", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Lampung", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "DKI Jakarta", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Banten", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Jawa Barat", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Jawa Tengah", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "DI Yogyakarta", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Jawa Timur", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: 12900, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Bali", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Nusa Tenggara Barat", pertalite: 10000, pertamax: 12300, pertamax_turbo: 19400, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 23600, pertamina_dex: 23900, biosolar_non_subsidi: null, pertamax_pertashop: 12200, updated_at: new Date().toISOString() },
    { location: "Nusa Tenggara Timur", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: 24050, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Kalimantan Barat", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Kalimantan Tengah", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Kalimantan Selatan", pertalite: 10000, pertamax: 12900, pertamax_turbo: 20250, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24650, pertamina_dex: 24950, biosolar_non_subsidi: null, pertamax_pertashop: 12800, updated_at: new Date().toISOString() },
    { location: "Kalimantan Timur", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Kalimantan Utara", pertalite: 10000, pertamax: 12900, pertamax_turbo: 20250, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24650, pertamina_dex: 24950, biosolar_non_subsidi: null, pertamax_pertashop: 12800, updated_at: new Date().toISOString() },
    { location: "Sulawesi Utara", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Gorontalo", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sulawesi Tengah", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sulawesi Tenggara", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sulawesi Selatan", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Sulawesi Barat", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Maluku", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Maluku Utara", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua", pertalite: 10000, pertamax: 12600, pertamax_turbo: 19850, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua Barat", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua Selatan", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua Pegunungan", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua Tengah", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: null, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
    { location: "Papua Barat Daya", pertalite: 10000, pertamax: 12600, pertamax_turbo: null, pertamax_green_95: null, biosolar_subsidi: 6800, dexlite: 24150, pertamina_dex: 24450, biosolar_non_subsidi: null, pertamax_pertashop: 12500, updated_at: new Date().toISOString() },
  ];
}





