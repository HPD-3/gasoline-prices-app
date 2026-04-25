/**
 * Vercel Serverless Function - Fuel Prices API
 * Scrapes Indonesian fuel prices from MyPertamina
 * URL: https://mypertamina.id/about/product-price
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

    // Parse the table rows - looking for Province/Location | Pertalite price (first fuel type)
    $("table tbody tr").each((i, el) => {
      const cells = $(el).find("td");
      
      if (cells.length >= 2) {
        const location = $(cells[0]).text().trim();
        const priceText = $(cells[1]).text().trim();
        
        // Extract price in Rupiah (e.g., "Rp 10.000" -> 10000)
        const priceMatch = priceText.match(/Rp\s*([\d.]+)/);
        
        if (location && priceMatch && location.length > 3) {
          // Convert Rp to numeric value (remove dots used as thousand separators)
          let priceIDR = priceMatch[1].replace(/\./g, "");
          let priceUSD = parseInt(priceIDR) / 16000; // Approximate exchange rate
          
          // Clean up location name
          let cleanLocation = location
            .replace(/^Prov\.\s*/, "")
            .replace(/^Free Trade Zone \(FTZ\)\s*/, "");
          
          results.push({
            location: cleanLocation,
            price_per_liter: parseFloat(priceUSD.toFixed(2)),
            currency: "USD",
            currency_local: "IDR",
            price_idr: parseInt(priceIDR),
            updated_at: new Date().toISOString(),
          });
        }
      }
    });

    return results.slice(0, 100);
  } catch (error) {
    console.error("Scraping error:", error.message);
    throw error;
  }
}

function getFallbackData() {
  return [
    { location: "DKI Jakarta", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Jawa Barat", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Jawa Tengah", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "DI Yogyakarta", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Jawa Timur", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Bali", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Aceh", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Sumatera Utara", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Sumatera Barat", price_per_liter: 0.656, currency: "USD", currency_local: "IDR", price_idr: 10500, updated_at: new Date().toISOString() },
    { location: "Riau", price_per_liter: 0.656, currency: "USD", currency_local: "IDR", price_idr: 10500, updated_at: new Date().toISOString() },
    { location: "Kepulauan Riau", price_per_liter: 0.656, currency: "USD", currency_local: "IDR", price_idr: 10500, updated_at: new Date().toISOString() },
    { location: "Jambi", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Bengkulu", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Sumatera Selatan", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Lampung", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Banten", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Kalimantan Barat", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Kalimantan Tengah", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
    { location: "Kalimantan Selatan", price_per_liter: 0.656, currency: "USD", currency_local: "IDR", price_idr: 10500, updated_at: new Date().toISOString() },
    { location: "Sulawesi Utara", price_per_liter: 0.625, currency: "USD", currency_local: "IDR", price_idr: 10000, updated_at: new Date().toISOString() },
  ];
}




