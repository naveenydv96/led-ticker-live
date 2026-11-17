export default async function handler(request, response) {
const watchlist = [
    { name: 'NIFTY', ticker: '^NSEI' },
    { name: 'BANKNIFTY', ticker: '^NSEBANK' },
    { name: 'SENSEX', ticker: '^BSESN' },
    { name: 'RELIANCE', ticker: 'RELIANCE.NS' },
    { name: 'HDFC', ticker: 'HDFCBANK.NS' },
    { name: 'ICICI', ticker: 'ICICIBANK.NS' },
     { name: 'NIFTY', ticker: '^NSEI' },
    { name: 'INFY', ticker: 'INFY.NS' },
    { name: 'TCS', ticker: 'TCS.NS' },
    { name: 'SBI', ticker: 'SBIN.NS' },
    { name: 'AIRTEL', ticker: 'BHARTIARTL.NS' },
    { name: 'ITC', ticker: 'ITC.NS' },
    { name: 'L&T', ticker: 'LT.NS' }
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
        
        // Replaced Bull/Bear with Triangle Up/Down
        if (priceChange > 0) {
          trend = '▲';
          color = '#00FF00'; 
          percentDisplay = `(+${percentChange}%)`;
        } else if (priceChange < 0) {
          trend = '▼';
          color = '#FF0000'; 
          percentDisplay = `(${percentChange}%)`;
        } else {
          percentDisplay = `(0.00%)`;
        }

        return `<span style="color: ${color};">${stock.name} ${price.toFixed(2)} ${trend} ${percentDisplay}</span>`;
      } catch (err) {
        return `<span style="color: #FFFFFF;">${stock.name} N/A</span>`; 
      }
    });

    const results = await Promise.all(fetchPromises);
    
    const separator = ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ';
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
              animation: ticker 40s linear infinite;
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
    response.status(500).send("<html><body style='color:red; font-size:40px;'>WAITING FOR DATA...</body></html>");
  }
}
