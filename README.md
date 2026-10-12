# Phoenix's Cookie Shop Tycoon

Open `index.html` in a web browser. No installation or build step is needed.

For a local server, run `python3 -m http.server 8000` in this folder, then visit http://localhost:8000.

Start with $100 and run your shop for 30 days. Choose a batch size and price for each cookie variety, plus a shared advertising budget, then open the shop to see the day's results. Chocolate chip costs $0.50 (suggested selling price $2.00), oatmeal raisin costs $0.40 ($1.75), and double chocolate costs $0.80 ($3.00), with $5 daily overhead. Daily results show each variety’s sales and revenue. Neighborhood demand is split between tastes (50% chocolate chip, 25% oatmeal, 25% double chocolate); unserved demand does not transfer to other varieties. Unsold cookies expire. Demand responds to price, advertising, the day's forecast, growing shop awareness, and a little randomness. You must pay upfront expenses from available cash. The game ends after day 30 or when you have less than $5 to open.

Progress saves automatically in your browser when local storage is available. Use New game to restart. The optional Google Fonts enhance the appearance; system fonts work offline.

Existing saved games remain readable: past single-variety days retain their original accounting, and future days use the variety menu. Daily sales totals, cash, and the 30-day limit carry over.

Verification: run `node verify-varieties.cjs` for deterministic accounting, budget, save compatibility, and closure checks.
