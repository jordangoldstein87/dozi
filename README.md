# Dozi — Downtime Eyewear

A marketing & e-commerce mockup for **Dozi**, the world's first comfort-first "downtime eyewear" — soft-touch medical silicone, silk-lined, hinge-free glasses designed to be worn while reading, watching, and winding down.

Static site (HTML/CSS/vanilla JS), no build step.

## Pages

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | Hero, problem/solution, features, colorways, shop, reviews, FAQ |
| Product detail | `product.html` | Gallery, frame/lens/size/color configurator, live pricing, **virtual try-on** |
| Technology | `technology.html` | Materials science, interactive contact-zone diagram, lens & sleep-science, fit, safety |

## Features

- **Virtual Try-On** — overlays a procedurally-rendered SVG frame on a sample face, live webcam (`getUserMedia`), or an uploaded photo; switch colorways/tints, drag & scale, save a snapshot.
- **Slide-out cart** — shared across pages, persists via `localStorage`, with mini frame thumbnails, quantity controls, and a free-shipping progress bar.
- **Interactive technology page** — tap contact zones on a real photo to reveal the engineering behind each.
- Fully responsive; brand system pulled from the Dozi brand guide (Ink Navy / Cream palette, Fraunces + Inter).

## Run locally

```bash
python3 serve.py        # serves on http://localhost:3460
```

Or any static server, e.g. `python3 -m http.server`.

## Structure

```
index.html  product.html  technology.html   # pages
styles.css                                   # all styles
app.js  product.js  tech.js                  # per-page logic
tryon.js                                      # frame renderer + virtual try-on
cart.js                                       # shared slide-out cart
assets/                                       # product photos, logo, lifestyle imagery
```

---

Mockup for demonstration purposes.
