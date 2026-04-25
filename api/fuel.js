/**
 * Vercel Serverless Function - Fuel Prices API
 * Endpoint: GET /api/fuel
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

    return res.status(200).json({
      success: false,
      error: "No data scraped",
      data: [],
    });
  } catch (err) {
    console.error("API error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      data: [],
    });
  }
}

async function scrapeFuelPrices() {
  try {
    const axios = await import("axios");
    const cheerio = await import("cheerio");

    const url = "https://www.globalpetrolprices.com/gasoline_prices/";

    const { data } = await axios.default.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    const results = [];

    $("table tbody tr").each((i, el) => {
      const cells = $(el).find("td");
      if (cells.length >= 2) {
        const country = $(cells[0]).text().trim();
        const priceText = $(cells[1]).text().trim();
        const priceMatch = priceText.match(/[\d.]+/);

        if (country && priceMatch) {
          results.push({
            country,
            price_per_liter: parseFloat(priceMatch[0]),
            currency: "USD",
            updated_at: new Date().toISOString(),
          });
        }
      }
    });

    return results.slice(0, 50);
  } catch (error) {
    console.error("Scraping error:", error.message);
    throw error;
  }
}
