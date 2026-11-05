# Will Arsenault · Data Lab — Live Odds Upgrade

## What's new

Select **Pricing & Arbitrage Tool** in the Workbench, then choose a league and click **Load live games**. The site retrieves real upcoming/in-progress games and two-way moneyline prices from The Odds API, displays the best price across US bookmakers on each side, and calculates whether the best available quotes imply a *theoretical* arbitrage. The live feed is **not active until you connect an API key**.

Other features (animated hockey photo, About portrait, SportLytics, terminal and example-odds calculator) remain intact.

## Publish / update on Netlify

**Recommended: deploy this entire project using a GitHub repo connected to Netlify**, so Netlify builds the `netlify/functions/live-odds.mjs` serverless function. A simple static-file upload can leave the function unavailable. The root of this folder should be the repository root, containing `netlify.toml`, `public/`, and `netlify/functions/`.

1. Get an API key from https://the-odds-api.com/ (check free usage credits and sports coverage).
2. In your existing Netlify site's **Project configuration → Environment variables**, add `ODDS_API_KEY` with your key; mark as a secret when available. **Never put it in index.html or GitHub.**
3. Connect this folder as a GitHub repository to the site (or deploy using Netlify's build-aware workflow); ensure **publish directory `public`** and functions directory `netlify/functions`. Then trigger a fresh deploy so the variable reaches the function.
4. Open the published site, select **Pricing & Arbitrage Tool**, choose NBA or NHL, and press **Load live games**.
5. If it says function not found, you deployed the HTML statically; switch to Git-connected deployment or a serverless-capable deployment workflow.

## Data and limitations

* Sports: NBA, NHL, NFL, MLB, NCAAB, WNBA, subject to subscription/season coverage.
* Markets: two-way **moneyline only**; no arbitrage inference for three-way results, spreads, or player props.
* Prices: best price for each competitor across books, with source bookmaker names; starts before now labeled IN-PLAY / STARTED, not verified as currently underway.
* A theoretical arbitrage exists when `1/decimalOddsA + 1/decimalOddsB < 1`; illustrative $100 stakes are split proportional to implied probability. **Actual execution is not guaranteed**, and stale prices, bet limits, venue rules, void rules, fees, and differing market definitions can invalidate the opportunity.
* Live-odds endpoint cached 120 seconds within each function instance and by CDN; front-end refresh is manual to control API credits. Provider quotas still apply, especially if many visitors request different leagues or server instances.
* Running `public/index.html` from a local file displays the site and example calculator, but the live endpoint requires deployment (or `netlify dev`).
* No odds are bundled or faked as real-time data. The endpoint is unavailable until a valid API key is configured.
