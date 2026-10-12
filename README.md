# Phoenix's Cookie Shop Tycoon

Open `index.html` in a web browser. No installation or build step is needed.

For a local server, run `python3 -m http.server 8000` in this folder, then visit http://localhost:8000.

Start with $100 and run your shop for 30 days. Choose a batch size, cookie price, and advertising budget, then open the shop to see the day's results. Ingredients cost $0.50 per cookie, with $5 daily overhead. Unsold cookies expire. Demand responds to price, advertising, the day's forecast, growing shop awareness, and a little randomness. You must pay upfront expenses from available cash. The game ends after day 30 or when you have less than $5 to open.

Progress saves automatically in your browser when local storage is available. Use New game to restart. The optional Google Fonts enhance the appearance; system fonts work offline.

Customer satisfaction starts at 75 and stays between 0 and 100. Each day, prices below $2 add 4 points, prices from $2 to $3 have no effect, and prices above $3 subtract 2 points per dollar above $3 (rounded up, capped at 10). Serving all demand adds 3 points; missing customers subtracts up to 15 points in proportion to unmet demand (rounded up). Zero demand has no inventory effect. The daily report explains both effects, and the ledger retains each day’s score and explanation. Existing saved games receive scores calculated from their historical results. Satisfaction tracks customer feedback; it does not alter demand.

Run the browser regression checks with `python3 tests/test_satisfaction.py`. They require the Python `playwright` package and Chromium at `/usr/bin/chromium`; the test starts its own temporary local server and uses isolated browser storage.
