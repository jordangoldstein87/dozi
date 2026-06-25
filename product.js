// ===== Product Detail Page =====
(function () {
  const money = (n) => "$" + Number(n).toFixed(2);

  const COLOR_HEX = { Cream: "#E8E2D0", Blush: "#E9C9C4", Sage: "#9FB39C", Slate: "#6E94AE", Sand: "#C9A876", Honey: "#E4CF76" };

  const sel = {
    frame: "silk",
    lens: "blue",
    lensName: "Blue Light",
    lensTint: "Clear",
    base: 79.95,
    size: "Small",
    strength: "+1.00",
    color: "Blush",
  };

  const LENS_META = {
    blue: { name: "Blue Light", tint: "Clear" },
    amber: { name: "Amber", tint: "Amber" },
    readers: { name: "Readers", tint: "Clear" },
    rx: { name: "Prescription", tint: "Clear" },
  };

  const els = {
    price: document.getElementById("price"),
    addPrice: document.getElementById("addPrice"),
    note: document.getElementById("priceNote"),
    lensVal: document.getElementById("lensVal"),
    frameVal: document.getElementById("frameVal"),
    frameHint: document.getElementById("frameHint"),
    colorVal: document.getElementById("colorVal"),
    sizeHint: document.getElementById("sizeHint"),
    strengthGroup: document.getElementById("strengthGroup"),
  };

  function siliconeDelta() {
    return sel.lens === "rx" ? -25 : -20;
  }
  function currentPrice() {
    return sel.base + (sel.frame === "silicone" ? siliconeDelta() : 0);
  }

  function update() {
    const p = currentPrice();
    els.price.textContent = money(p);
    els.addPrice.textContent = money(p);
    els.note.textContent = `${sel.lensName} · ${sel.size}`;
    els.lensVal.textContent = sel.lens === "readers"
      ? `Readers · ${sel.strength}`
      : `${sel.lensName} · ${sel.lensTint}`;
    els.strengthGroup.hidden = sel.lens !== "readers";
  }

  // Gallery
  const mainImg = document.getElementById("galleryMain");
  document.querySelectorAll("#galleryThumbs .thumb").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll("#galleryThumbs .thumb").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
      mainImg.src = t.dataset.src;
    });
  });

  // Frame segment
  document.querySelectorAll("#frameSeg .seg-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#frameSeg .seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      sel.frame = b.dataset.frame;
      els.frameVal.textContent = sel.frame === "silk" ? "Silk-Lined" : "Silicone";
      els.frameHint.textContent = sel.frame === "silk"
        ? "100% mulberry silk lining across every contact zone — coolest, most breathable, our most-loved."
        : "Soft-touch medical silicone throughout. The same hinge-free comfort, a lighter price.";
      update();
    });
  });

  // Lens cards
  document.querySelectorAll("#lensOpts .lens-card").forEach((c) => {
    c.addEventListener("click", () => {
      document.querySelectorAll("#lensOpts .lens-card").forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");
      sel.lens = c.dataset.lens;
      sel.base = parseFloat(c.dataset.base);
      sel.lensName = LENS_META[sel.lens].name;
      sel.lensTint = LENS_META[sel.lens].tint;
      update();
    });
  });

  // Reading strength
  document.querySelectorAll("#strengthSeg .seg-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#strengthSeg .seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      sel.strength = b.textContent;
      update();
    });
  });

  // Size
  document.querySelectorAll("#sizeSeg .seg-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#sizeSeg .seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      sel.size = b.dataset.size;
      els.sizeHint.textContent = sel.size === "Small"
        ? "Small fits head circumference 52–55cm · 138mm frame width. Covers ~P5–P50 of adults."
        : "Large fits head circumference 56–60cm · 152mm frame width. Covers ~P50–P95 of adults.";
      update();
    });
  });

  // Color swatches
  document.querySelectorAll("#swatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("#swatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      sel.color = sw.dataset.name;
      els.colorVal.textContent = sel.color;
    });
  });

  // Sync color from try-on
  window.syncColor = (name, hex) => {
    sel.color = name;
    els.colorVal.textContent = name;
    document.querySelectorAll("#swatches .swatch").forEach((s) => {
      s.classList.toggle("is-active", s.dataset.name === name);
    });
  };

  // Add to cart → shared Cart drawer
  window.doziAddToCart = () => {
    const frameName = sel.frame === "silk" ? "Silk-Lined" : "Silicone";
    const lensLabel = sel.lens === "readers" ? `Readers ${sel.strength}` : sel.lensName;
    const tint = sel.lens === "amber" ? "amber" : "clear";
    window.Cart.add({
      name: `Dozi ${frameName}`,
      frame: frameName,
      lens: lensLabel,
      size: sel.size,
      color: sel.color,
      colorHex: COLOR_HEX[sel.color] || "#E8E2D0",
      tint,
      price: currentPrice(),
    });
  };
  document.getElementById("addBtn").addEventListener("click", window.doziAddToCart);

  // Size guide smooth scroll handled by anchor; offset via CSS scroll-margin

  update();
})();
