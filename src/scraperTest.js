/**
 * Scraper Test & Examples
 * Run this to verify the scraper pipeline works
 * Usage: node src/scraperTest.js
 */

import { scrapeFuelPrices, scrapeFuelPricesFallback } from "./scraper.js";
import { normalizeFuelData, validateFuelData } from "./normalize.js";
import { processFuelPrices } from "./fuelPipeline.js";

async function testFallbackData() {
  console.log("\n========== TEST 1: Fallback Data ==========");
  try {
    const raw = await scrapeFuelPricesFallback();
    console.log(`✓ Scraped ${raw.length} records (fallback)`);
    console.log("Sample raw data:", raw[0]);

    const normalized = normalizeFuelData(raw);
    console.log(`✓ Normalized ${normalized.length} records`);
    console.log("Sample normalized data:", normalized[0]);

    const validation = validateFuelData(normalized);
    console.log(
      `✓ Validation: ${validation.valid ? "PASSED" : "FAILED"}`,
      validation.errors.length > 0 ? validation.errors : ""
    );
  } catch (error) {
    console.error("✗ Test failed:", error.message);
  }
}

async function testPipeline() {
  console.log("\n========== TEST 2: Full Pipeline (Fallback) ==========");
  try {
    const result = await processFuelPrices(true);
    console.log("Pipeline result:", result);

    if (result.success) {
      console.log(`✓ Processed ${result.count} records`);
      console.log("Ready for Firebase storage:", result.data.length);
    } else {
      console.error("✗ Pipeline failed:", result.error);
    }
  } catch (error) {
    console.error("✗ Test failed:", error.message);
  }
}

async function testLiveData() {
  console.log("\n========== TEST 3: Live Data (May Fail) ==========");
  console.log("Note: This may fail if GlobalPrices.info structure changed");
  try {
    const result = await processFuelPrices(false);
    if (result.success) {
      console.log(`✓ Live scrape successful! ${result.count} records`);
      if (result.data.length > 0) {
        console.log("Sample:", result.data[0]);
      }
    } else {
      console.warn("⚠ Live scrape fallback used (expected if site changed)");
      console.warn("Error:", result.error);
    }
  } catch (error) {
    console.error("Live scrape error (expected):", error.message);
  }
}

async function runAllTests() {
  console.log("🚀 Fuel Scraper Pipeline Tests");
  console.log("================================");

  await testFallbackData();
  await testPipeline();
  await testLiveData();

  console.log("\n================================");
  console.log("✅ Tests completed!");
  console.log("\nNext steps:");
  console.log("1. Integrate with Firebase (firestore.js)");
  console.log("2. Create Vercel API endpoint (/api/cron/fuel.js)");
  console.log("3. Build frontend to display prices");
}

// Run tests if this file is executed directly
runAllTests().catch(console.error);

export { testFallbackData, testPipeline, testLiveData };
