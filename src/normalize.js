/**
 * Normalizer Layer
 * Cleans and standardizes fuel price data from various sources
 */

export function normalizeFuelData(data) {
  return data
    .map((item) => {
      try {
        // Extract numeric price value
        const priceString = String(item.price).replace(/[^0-9.]/g, "");
        const pricePerLiter = parseFloat(priceString);

        if (isNaN(pricePerLiter)) {
          console.warn(`Invalid price for ${item.country}: ${item.price}`);
          return null;
        }

        return {
          country: item.country.trim(),
          price_per_liter: pricePerLiter,
          currency: "USD",
          updated_at: new Date().toISOString(),
          source: item.source || "global-prices",
        };
      } catch (error) {
        console.error(`Error normalizing data for ${item.country}:`, error);
        return null;
      }
    })
    .filter((item) => item !== null);
}

/**
 * Validates normalized data before storage
 */
export function validateFuelData(data) {
  const errors = [];

  if (!Array.isArray(data)) {
    errors.push("Data must be an array");
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item.country || typeof item.country !== "string") {
      errors.push(`Item ${index}: Missing or invalid country`);
    }
    if (typeof item.price_per_liter !== "number") {
      errors.push(`Item ${index}: Invalid price_per_liter`);
    }
    if (item.price_per_liter < 0) {
      errors.push(`Item ${index}: Price cannot be negative`);
    }
    if (!item.updated_at || !isValidDate(item.updated_at)) {
      errors.push(`Item ${index}: Invalid or missing updated_at`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
