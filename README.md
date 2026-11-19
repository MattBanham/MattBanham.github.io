# GitHub Page

Portfolio site for github.com/MattBanham. Static HTML/CSS/JS — no build step.

- `index.html` — the page
- `assets/` — styles and script (project list lives in `assets/main.js`)
- `assets/demos.js` / `demos.css` + `images/projects/` — the Arc and VoiceScript demos, bundled from the matt-os site (`matt-os-portfolio-refresh-20261031/src/site/ArcPreview.tsx`, `VoiceScriptPreview.tsx`) with esbuild
- `demos/` — self-contained copies of Cellular Life v1–v6 and Evolving Code, embedded live in the Lab section

## Deploy on GitHub Pages

1. Create a repo named `MattBanham.github.io` (serves at https://mattbanham.github.io).
2. Copy the contents of this folder into it, commit and push to `main`.
3. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/`.

Preview locally: `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

When the simulations change, re-copy them from `CellularLife/vN/index.html` and `evolvingcode/v1/index.html`.
