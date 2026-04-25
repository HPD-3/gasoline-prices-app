
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

        const demoData = getDemoData();
        return res.status(200).json({
            success: true,
            count: demoData.length,
            data: demoData,
            source: "demo",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("API error:", err.message);
        const demoData = getDemoData();
        return res.status(200).json({
            success: true,
            count: demoData.length,
            data: demoData,
            source: "demo",
            timestamp: new Date().toISOString(),
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
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        const $ = cheerio.load(data);
        const results = [];

        $("table tbody tr").each((i, el) => {
            const cells = $(el).find("td");
            if (cells.length >= 2) {
                const country = $(cells[0]).text().trim();
                const priceText = $(cells[1]).text().trim();
                const priceMatch = priceText.match(/[\\d.]+/);

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

function getDemoData() {
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