import { getDemoData } from './apiService.js';
import axios from 'axios';
import { load } from 'cheerio';

/**
 * Mock API handler for local development
 * On Vercel, the real /api/fuel endpoint handles this
 */

async function scrapeFuelPrices() {
  try {
    const url = "https://www.globalpetrolprices.com/gasoline_prices/";

    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = load(data);
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

export async function getFuelPrices() {
  try {
    const results = await scrapeFuelPrices();

    if (results.length > 0) {
      return {
        success: true,
        count: results.length,
        data: results,
        source: "live",
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error("No data scraped");
  } catch (err) {
    console.error("API error:", err.message);
    throw err;
  }
}
