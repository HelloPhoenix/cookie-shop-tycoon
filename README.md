# Phoenix's Cookie Shop Tycoon

Open `index.html` in a web browser. No installation or build step is needed.

For a local server, run `python3 -m http.server 8000` in this folder, then visit http://localhost:8000.

Start with $100 and run your shop for 30 days. Choose a batch size and price for each cookie variety, plus a shared advertising budget, then open the shop to see the day's results. Chocolate chip costs $0.50 (suggested selling price $2.00), oatmeal raisin costs $0.40 ($1.75), and double chocolate costs $0.80 ($3.00), with $5 daily overhead. Daily results show each variety’s sales and revenue. Neighborhood demand is split between tastes (50% chocolate chip, 25% oatmeal, 25% double chocolate); unserved demand does not transfer to other varieties. Unsold cookies expire. Demand responds to price, advertising, the day's forecast, growing shop awareness, and a little randomness. You must pay upfront expenses from available cash. The game ends after day 30 or when you have less than $5 to open.

Progress saves automatically in your browser when local storage is available. Use New game to restart. The optional Google Fonts enhance the appearance; system fonts work offline.

Existing saved games remain readable: past single-variety days retain their original accounting, and future days use the variety menu. Daily sales totals, cash, and the 30-day limit carry over.

Verification: run `node verify-varieties.cjs` for deterministic accounting, budget, save compatibility, and closure checks.
Customer satisfaction starts at 75 and stays between 0 and 100. For variety days, the price is averaged by customer demand across varieties. Each day, prices below $2 add 4 points, prices from $2 to $3 have no effect, and prices above $3 subtract 2 points per dollar above $3 (rounded up, capped at 10). Serving all demand adds 3 points; missing customers subtracts up to 15 points in proportion to unmet demand (rounded up). Zero demand has no inventory effect. The daily report explains both effects, and the ledger retains each day’s score and explanation. Existing saved games receive scores calculated from their historical results. Satisfaction tracks customer feedback; it does not alter demand.

Run the browser regression checks with `python3 tests/test_satisfaction.py`. They require the Python `playwright` package and Chromium at `/usr/bin/chromium`; the test starts its own temporary local server and uses isolated browser storage.
