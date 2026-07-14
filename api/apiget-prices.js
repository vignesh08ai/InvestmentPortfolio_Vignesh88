// api/get-prices.js

export default async function handler(req, res) {
  // 1. Enable CORS so your GitHub Pages (or local server) can read the data
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Get the stock symbols from the query string (e.g., ?symbols=RELIANCE.NS,TCS.NS)
  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Please provide stock symbols.' });
  }

  try {
    // 3. Fetch data directly from Yahoo Finance (Servers don't have CORS restrictions!)
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // 4. Extract and simplify the response to only return what your frontend needs
    const results = data.quoteResponse.result.map(stock => ({
      symbol: stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      changePercent: stock.regularMarketChangePercent,
      name: stock.shortName,
      currency: stock.currency
    }));

    return res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error('Serverless Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}