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
        const price = data.chart.result[0].meta.regularMarketPrice;
        return `${stock.name}: ${price.toFixed(2)}`;
      } catch (err) {
        return `${stock.name}: N/A`; 
      }
    });

    const results = await Promise.all(fetchPromises);
    const textToDisplay = results.join(' &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; ');

    // This creates the scrolling webpage design
    const htmlDesign = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              background-color: black; 
              color: #00FF00; 
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
