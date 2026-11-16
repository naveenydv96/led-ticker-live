export default async function handler(request, response) {
  const watchlist = [
    { name: 'NIFTY', ticker: 'NIFTY', exchange: 'NSE', segment: 'INDEX' },
    { name: 'SENSEX', ticker: 'SENSEX', exchange: 'BSE', segment: 'INDEX' },
    { name: 'BANKNIFTY', ticker: 'BANKNIFTY', exchange: 'NSE', segment: 'INDEX' },
    { name: 'RELIANCE', ticker: 'RELIANCE', exchange: 'NSE', segment: 'CASH' },
    { name: 'HDFC', ticker: 'HDFCBANK', exchange: 'NSE', segment: 'CASH' },
    { name: 'INFY', ticker: 'INFY', exchange: 'NSE', segment: 'CASH' },
    { name: 'ICICI', ticker: 'ICICIBANK', exchange: 'NSE', segment: 'CASH' },
    { name: 'SBI', ticker: 'SBIN', exchange: 'NSE', segment: 'CASH' },
    { name: 'AIRTEL', ticker: 'BHARTIARTL', exchange: 'NSE', segment: 'CASH' }
  ];

  try {
    const fetchPromises = watchlist.map(async (stock) => {
      try {
        const url = `https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/${stock.exchange}/segment/${stock.segment}/${stock.ticker}`;
        
        // Disguising the server as a normal Windows Google Chrome browser
        const res = await fetch(url, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://groww.in',
            'Referer': 'https://groww.in/',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          cache: 'no-store'
        });
        const data = await res.json();
        
        // Safely searching for where Groww hid the price in their data
        const price = data?.livePriceDto?.ltp || data.ltp || data.price;
        const previousClose = data?.livePriceDto?.close || data.close || data.previousClose;
        
        if (!price || !previousClose) throw new Error("Blocked or Missing");

        const priceChange = price - previousClose;
        const percentChange = ((priceChange / previousClose) * 100).toFixed(2);
        
        let arrow = '';
        let color = '#FFFFFF'; 
        let percentDisplay = '';
        
        if (priceChange > 0) {
          arrow = '▲';
          color = '#00FF00'; 
          percentDisplay = `(+${percentChange}%)`;
        } else if (priceChange < 0) {
          arrow = '▼';
          color = '#FF0000'; 
          percentDisplay = `(${percentChange}%)`;
        } else {
          percentDisplay = `(0.00%)`;
        }

        return `<span style="color: ${color};">${stock.name}: ${price.toFixed(2)} ${arrow} ${percentDisplay}</span>`;
      } catch (err) {
        // If it fails, it will now show an error dot so we know it got blocked
        return `<span style="color: gray;">${stock.name}: N/A (•)</span>`; 
      }
    });

    const results = await Promise.all(fetchPromises);
    
    const separator = ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ';
    const singleText = results.join(separator) + separator;

    const htmlDesign = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              background-color: black; 
              color: white; 
              font-family: Arial, sans-serif;
              font-weight: bold;
              font-size: 50px; 
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              overflow: hidden;
              white-space: nowrap;
            }
            .ticker-wrap {
              display: flex;
              width: max-content;
              animation: ticker 30s linear infinite;
            }
            .ticker-item {
              display: flex;
              flex-shrink: 0;
            }
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          </style>
        </head>
        <body>
          <div class="ticker-wrap">
            <div class="ticker-item">${singleText}</div>
            <div class="ticker-item">${singleText}</div>
          </div>
        </body>
      </html>
    `;

    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
    response.setHeader('Content-Type', 'text/html');
    response.status(200).send(htmlDesign);

  } catch (error) {
    response.status(500).send("<html><body style='color:red; font-size:40px;'>WAITING FOR GROWW DATA...</body></html>");
  }
}
