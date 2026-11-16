export default async function handler(request, response) {
  const watchlist = [
    { name: 'NIFTY', ticker: '^NSEI' },
    { name: 'SENSEX', ticker: '^BSESN' },
    { name: 'BANKNIFTY', ticker: '^NSEBANK' },
    { name: 'RELIANCE', ticker: 'RELIANCE.NS' },
    { name: 'HDFC', ticker: 'HDFCBANK.NS' },
    { name: 'INFY', ticker: 'INFY.NS' },
    { name: 'ICICI', ticker: 'ICICIBANK.NS' },
    { name: 'SBI', ticker: 'SBIN.NS' },
    { name: 'AIRTEL', ticker: 'BHARTIARTL.NS' }
  ];

  try {
    const fetchPromises = watchlist.map(async (stock) => {
      try {
        const liveTimestamp = Date.now();
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}?ts=${liveTimestamp}`, {
          headers: { 
            'User-Agent': 'Mozilla/5.0',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          cache: 'no-store' 
        });
        const data = await res.json();
        
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        
        const priceChange = price - previousClose;
        const percentChange = ((priceChange / previousClose) * 100).toFixed(2);
        
        let trend = '';
        let color = '#FFFFFF'; 
        let percentDisplay = '';
        
        // Using Bull and Bear emojis instead of text
        if (priceChange > 0) {
          trend = '🐂';
          color = '#00FF00'; 
          percentDisplay = `(+${percentChange}\%)`; } else if (priceChange < 0) { trend = '🐻'; color = '#FF0000'; percentDisplay = `(${percentChange}%)`;
        } else {
          percentDisplay = `(0.00%)`;
        }

        return `<span style="color: ${color};">${stock.name}:${price.toFixed(2)} ${trend}${percentDisplay}</span>`;
      } catch (err) {
        return `<span style="color: #FFFFFF;">${stock
