/**
 * Scraper Example & Test
 * Demonstrates how to use the scraper and normalizer
 */

import { scrapeFuelPrices, scrapeFuelPricesFallback } from "./scraper.js";
import { normalizeFuelData, validateFuelData } from "./normalize.js";

/**
 * Main pipeline function
 * Can be used in Vercel cron or other backend environments
 */
export async function processFuelPrices(useFallback = false) {
  try {
    console.log("Starting fuel price processing pipeline...");

    // Step 1: Scrape data
    let rawData;
    if (useFallback) {
      console.log("Using fallback data source...");
      rawData = await scrapeFuelPricesFallback();
    } else {
      console.log("Scraping from primary source...");
      rawData = await scrapeFuelPrices();
    }

    console.log(`✓ Scraped ${rawData.length} records`);

    // Step 2: Normalize data
    const normalizedData = normalizeFuelData(rawData);
    console.log(`✓ Normalized ${normalizedData.length} records`);

    // Step 3: Validate data
    const validation = validateFuelData(normalizedData);
    if (!validation.valid) {
      console.warn("Validation errors:", validation.errors);
      return { success: false, errors: validation.errors };
    }

    console.log("✓ Data validation passed");

    // Step 4: Return ready-to-store data
    return {
      success: true,
      count: normalizedData.length,
      data: normalizedData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Pipeline error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// For testing in Node environment
if (typeof module !== "undefined" && module.hot) {
  console.log("Running in development mode - test with processFuelPrices()");
}
