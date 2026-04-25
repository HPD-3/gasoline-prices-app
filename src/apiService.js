/**
 * Backend API Service
 * This simulates what would run on Vercel /api/fuel.js
 * 
 * For Vercel deployment:
 * 1. Create /api/fuel.js at project root
 * 2. Copy this code there
 * 3. Call from frontend with: fetch('/api/fuel')
 * 
 * For local development:
 * This module can be used directly by frontend with fetch
 */

import axios from "axios";
import { load } from "cheerio";

/**
 * Main handler - what Vercel would execute
 * Call this from /api/fuel.js handler
 */
export async function fuelPricesHandler(req, res) {
  try {
    // Try to scrape real data
    const results = await scrapeFuelPricesBackend();

    if (results.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          count: results.length,
          data: results,
          source: "live",
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // Fall back to demo data
    const demoData = getDemoData();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: demoData.length,
        data: demoData,
        source: "demo",
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error("API error:", err.message);

    // Return demo data on error
    const demoData = getDemoData();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: demoData.length,
        data: demoData,
        source: "demo",
        error: err.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
}

/**
 * Backend scraper - runs server-side (no CORS!)
 * Server can set any headers and fetch any public website
 */
export async function scrapeFuelPricesBackend() {
  try {
    const url = "https://www.globalpetrolprices.com/gasoline_prices/";

    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = load(data);
    const results = [];

    // Parse table rows
    $("table tbody tr").each((i, el) => {
      const cells = $(el).find("td");
      if (cells.length >= 2) {
        const country = $(cells[0]).text().trim();
        const priceText = $(cells[1]).text().trim();

        // Extract numeric price
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

    console.log(`✓ Backend scraped ${results.length} countries`);
    return results.slice(0, 50); // Return top 50
  } catch (error) {
    console.error("Backend scraping error:", error.message);
    throw error;
  }
}

/**
 * Demo data - always available as fallback
 */
export function getDemoData() {
  return [
    { country: "Hong Kong", price_per_liter: 2.41, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Netherlands", price_per_liter: 2.07, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Denmark", price_per_liter: 2.05, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Israel", price_per_liter: 2.01, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Switzerland", price_per_liter: 1.92, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Singapore", price_per_liter: 1.88, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Germany", price_per_liter: 1.88, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Greece", price_per_liter: 1.87, currency: "USD", updated_at: new Date().toISOString() },
    { country: "France", price_per_liter: 1.87, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Italy", price_per_liter: 1.85, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Belgium", price_per_liter: 1.84, currency: "USD", updated_at: new Date().toISOString() },
    { country: "UK", price_per_liter: 1.83, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Portugal", price_per_liter: 1.82, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Norway", price_per_liter: 1.81, currency: "USD", updated_at: new Date().toISOString() },
    { country: "New Zealand", price_per_liter: 1.81, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Ireland", price_per_liter: 1.8, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Luxembourg", price_per_liter: 1.8, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Croatia", price_per_liter: 1.79, currency: "USD", updated_at: new Date().toISOString() },
    { country: "Sweden", price_per_liter: 1.78, currency: "USD", updated_at: new Date().toISOString() },
    { country: "South Korea", price_per_liter: 1.77, currency: "USD", updated_at: new Date().toISOString() },
  ];
}
