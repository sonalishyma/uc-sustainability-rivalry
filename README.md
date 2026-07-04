# The Other Rivalry — UC campuses, ranked on sustainability

**Live site:** https://sonalishyma.github.io/UC-Sustainability-Rivalry/ 

UC campuses compete over everything: U.S. News rank, rivalry games, Nobel counts,
admit rates. Nobody ranks them on sustainability — so Team 3 did. Nine of the ten
UC campuses (every campus with an undergraduate class; UCSF is health-sciences-only
and isn't part of this comparison), ranked 1–9 on seven real, publicly reported
sustainability metrics: LEED buildings, emissions intensity, energy-use intensity,
water use, curriculum, air & climate, and waste.

Zero build step — `index.html` + `css/style.css` + `js/data.js` + `js/script.js`,
Chart.js from a CDN for the interactive charts. Open `index.html` directly or serve
the folder with any static server.

## What's in here

- **The rivalry** — the editorial framing: UC campuses are ruthlessly competitive
  everywhere except the one competition that affects the planet they share.
- **Standings** — sum-of-ranks scoreboard across all seven metrics (lower = better).
- **The grid** — all 63 individual ranks in one hoverable heatmap.
- **Campus profiles** — a radar chart per campus vs. the 9-campus average.
- **Targets deep-dive** — how each campus does against its own energy, water, and
  emissions numbers.
- **LEED buildings** — certified building stock by tier.
- **Methods & honesty notes** — how the ranking was built, and where the data is
  rough (composite proxies, self-set targets, approximated goals).

## Data

`Team 3 Metrics Data Chart.xlsx` is the original research workbook — every number
on the site traces back to a cell in that file, sourced from UCOP's Annual
Sustainability Report, AASHE STARS reports, and USGBC's LEED building list (full
citations are in the Methods section of the site).

## Deploy (GitHub Pages)

Settings → Pages → Deploy from a branch → `main`, `/ (root)`. The site is a static
`index.html`, so no build step is needed.

## Credits

Team 3 — Sonali S., Rowan N., Raphael P. & Olivia P. (SYN 100, UC San Diego
Synthesis Program). Interactive redesign, narrative framing & data pipeline:
Sonali Singh, built from the team's original research dataset.
