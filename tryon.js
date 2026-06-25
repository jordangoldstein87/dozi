// ===== Dozi frame renderer + Virtual Try-On =====
window.DoziFrame = (function () {
  let uid = 0;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * (1 - amt)); g = Math.round(g * (1 - amt)); b = Math.round(b * (1 - amt));
    return `rgb(${r},${g},${b})`;
  }
  function light(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * amt); g = Math.round(g + (255 - g) * amt); b = Math.round(b + (255 - b) * amt);
    return `rgb(${r},${g},${b})`;
  }

  // viewBox 0 0 460 240 — swept wraparound, nose notch at BOTTOM-center
  const OUTER = "M40,96 C44,74 70,58 120,54 C160,51 195,52 230,52 C265,52 300,51 340,54 C390,58 416,74 420,96 C426,112 420,150 392,168 C360,190 320,186 270,178 C252,175 244,166 230,166 C216,166 208,175 190,178 C140,186 100,190 68,168 C40,150 34,112 40,96 Z";
  const INNER = "M74,100 C80,82 106,72 152,69 C187,67 212,68 230,70 C248,68 273,67 308,69 C354,72 380,82 386,100 C391,116 386,146 362,162 C334,180 302,176 260,168 C248,166 240,158 230,158 C220,158 212,166 200,168 C158,176 126,180 98,162 C74,146 69,116 74,100 Z";

  function inner(color, tint) {
    const id = "df" + (uid++);
    const top = light(color, 0.20), bot = shade(color, 0.18), edge = shade(color, 0.30);
    const tintFill = tint === "amber" ? "rgba(226,160,70,.42)" : "rgba(150,170,180,.22)";
    const tintTop = tint === "amber" ? "rgba(240,200,120,.34)" : "rgba(220,230,235,.34)";
    return `
    <defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${top}"/>
        <stop offset=".5" stop-color="${color}"/>
        <stop offset="1" stop-color="${bot}"/>
      </linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${tintTop}"/>
        <stop offset="1" stop-color="${tintFill}"/>
      </linearGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="rgba(255,255,255,.5)"/>
        <stop offset=".35" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <!-- swept temple arms (behind) -->
    <path d="M44,96 C22,98 9,110 11,130 C25,120 36,116 48,116 C45,109 44,102 44,96 Z" fill="${edge}"/>
    <path d="M416,96 C438,98 451,110 449,130 C435,120 424,116 412,116 C415,109 416,102 416,96 Z" fill="${edge}"/>
    <!-- lens tint fill -->
    <path d="${INNER}" fill="url(#${id}l)"/>
    <!-- frame ring (evenodd hole) -->
    <path d="${OUTER} ${INNER}" fill-rule="evenodd" fill="url(#${id}f)" stroke="${edge}" stroke-width="1.4"/>
    <!-- silk inner lining hint -->
    <path d="${INNER}" fill="none" stroke="${light(color, 0.42)}" stroke-width="3" opacity=".5"/>
    <!-- diagonal lens sheen -->
    <path d="${INNER}" fill="url(#${id}s)" opacity=".55"/>
    `;
  }

  function svg(color, tint, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 460 240" xmlns="http://www.w3.org/2000/svg">${inner(color, tint)}</svg>`;
  }

  return { inner, svg, shade, light };
})();

// ===== Virtual Try-On modal =====
(function () {
  const modal = document.getElementById("tryonModal");
  if (!modal) return;

  const SAMPLE_FACE = "assets/tryon-face.png";

  const video = document.getElementById("tryonVideo");
  const photo = document.getElementById("tryonPhoto");
  const frameEl = document.getElementById("tryonFrame");
  const guide = document.getElementById("tryonGuide");
  const fallback = document.getElementById("tryonFallback");
  const stage = modal.querySelector(".tryon-stage");
  const scaleRange = document.getElementById("tsScale");
  const scaleVal = document.getElementById("tsScaleVal");
  const canvas = document.getElementById("tryonCanvas");

  let stream = null;
  let state = { color: "#E8E2D0", name: "Cream", tint: "clear", scale: 1, x: 0, y: 0, mode: "sample" };

  function render() {
    frameEl.innerHTML = DoziFrame.svg(state.color, state.tint);
    frameEl.style.transform =
      `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px)) scale(${state.scale})`;
    scaleRange.value = Math.round(state.scale * 100);
    scaleVal.textContent = Math.round(state.scale * 100) + "%";
  }

  // Show the built-in real-face sample (default)
  function showSample() {
    state.mode = "sample";
    stopStream();
    photo.src = SAMPLE_FACE;
    photo.hidden = false;
    video.hidden = true;
    fallback.hidden = true;
    guide.hidden = true;
    frameEl.classList.add("pos-sample");
    state.scale = 0.84; state.x = 0; state.y = 0;
    render();
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      state.mode = "camera";
      video.srcObject = stream;
      video.hidden = false;
      photo.hidden = true;
      fallback.hidden = true;
      guide.hidden = false;
      frameEl.classList.remove("pos-sample");
      state.scale = 1; state.x = 0; state.y = 0;
      render();
    } catch (e) {
      if (window.doziToast) window.doziToast("No camera available — showing a sample instead");
      showSample();
    }
  }

  function usePhoto(file) {
    state.mode = "photo";
    const url = URL.createObjectURL(file);
    photo.src = url;
    photo.hidden = false;
    video.hidden = true;
    fallback.hidden = true;
    guide.hidden = false;
    frameEl.classList.remove("pos-sample");
    stopStream();
    state.scale = 1; state.x = 0; state.y = 0;
    render();
  }

  function stopStream() {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  }

  function open() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showSample();
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    stopStream();
  }

  ["openTryon", "openTryon2"].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", (e) => { e.preventDefault(); open(); });
  });
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });

  // Camera button
  const camBtn = document.getElementById("tryonCam");
  if (camBtn) camBtn.addEventListener("click", startCamera);

  // Color swatches
  document.querySelectorAll("#tryonSwatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("#tryonSwatches .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      state.color = sw.style.getPropertyValue("--sw").trim();
      state.name = sw.dataset.name;
      render();
    });
  });

  // Tint
  document.querySelectorAll("#tryonTint .seg-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#tryonTint .seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      state.tint = b.dataset.tint;
      render();
    });
  });

  // Scale
  scaleRange.addEventListener("input", () => {
    state.scale = scaleRange.value / 100;
    scaleVal.textContent = scaleRange.value + "%";
    render();
  });

  // Drag the frame
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
  function down(cx, cy) { dragging = true; sx = cx; sy = cy; ox = state.x; oy = state.y; }
  function move(cx, cy) { if (!dragging) return; state.x = ox + (cx - sx); state.y = oy + (cy - sy); render(); }
  function up() { dragging = false; }
  frameEl.addEventListener("pointerdown", (e) => { down(e.clientX, e.clientY); frameEl.setPointerCapture(e.pointerId); });
  frameEl.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
  frameEl.addEventListener("pointerup", up);
  frameEl.addEventListener("pointercancel", up);

  // Photo upload
  ["photoInput", "photoInput2"].forEach((id) => {
    const inp = document.getElementById(id);
    if (inp) inp.addEventListener("change", (e) => { if (e.target.files[0]) usePhoto(e.target.files[0]); });
  });

  // Snapshot
  document.getElementById("tryonSnap").addEventListener("click", () => {
    const src = !video.hidden ? video : photo;
    const W = 900, H = 900;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#F5F0E6"; ctx.fillRect(0, 0, W, H);
    const sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight;
    if (sw && sh) {
      const r = Math.max(W / sw, H / sh);
      const dw = sw * r, dh = sh * r;
      ctx.save();
      if (!video.hidden) { ctx.translate(W, 0); ctx.scale(-1, 1); }
      ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.restore();
    }
    const svgStr = DoziFrame.svg(state.color, state.tint);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const baseW = W * 0.6 * state.scale;
      const baseH = baseW * (240 / 460);
      const fr = frameEl.getBoundingClientRect(), st = stage.getBoundingClientRect();
      const cx = (fr.left + fr.width / 2 - st.left) * (W / st.width);
      const cy = (fr.top + fr.height / 2 - st.top) * (H / st.height);
      ctx.drawImage(img, cx - baseW / 2, cy - baseH / 2, baseW, baseH);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `dozi-${state.name.toLowerCase()}-tryon.png`;
      a.click();
      if (window.doziToast) window.doziToast("Snapshot saved to your downloads");
    };
    img.src = url;
  });

  // Add look to cart
  document.getElementById("tryonAdd").addEventListener("click", () => {
    if (window.syncColor) window.syncColor(state.name, state.color);
    if (window.doziAddToCart) window.doziAddToCart();
    close();
  });
})();
