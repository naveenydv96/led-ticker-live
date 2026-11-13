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
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await res.json();
        
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        
        const priceChange = price - previousClose;
        const percentChange = ((priceChange / previousClose) * 100).toFixed(2);
        
        let arrow = '';
        let color = '#FFFFFF'; 
        let percentDisplay = '';
        
        // This logic now applies the color to the entire line of text
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

        // We wrap both the name and the price in the dynamic color span
        return `<span style="color: ${color};">${stock.name}: ${price.toFixed(2)} ${arrow} ${percentDisplay}</span>`;
      } catch (err) {
        return `<span style="color: #FFFFFF;">${stock.name}: N/A</span>`; 
      }
    });

    const results = await Promise.all(fetchPromises);
    const textToDisplay = results.join(' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ');

    const htmlDesign = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              background-color: black; 
              font-family: Arial, sans-serif;
              font-weight: bold;
              font-size: 50px; 
              margin: 0;
              display: flex;
              align-items: center;
              height: 100vh;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <marquee scrollamount="10">${textToDisplay}</marquee>
        </body>
      </html>
    `;

    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.setHeader('Content-Type', 'text/html');
    response.status(200).send(htmlDesign);

  } catch (error) {
    response.status(500).send("<html><body style='color:red; font-size:40px;'>WAITING FOR DATA...</body></html>");
  }
}
