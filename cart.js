// ===== Dozi shared cart + slide-out drawer =====
window.Cart = (function () {
  const KEY = "dozi_cart_v1";
  const FREE_SHIP = 75;
  const money = (n) => "$" + Number(n).toFixed(2);

  let items = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

  function keyOf(it) { return [it.name, it.frame, it.lens, it.size, it.color].join("|"); }
  function count() { return items.reduce((n, i) => n + i.qty, 0); }
  function subtotal() { return items.reduce((s, i) => s + i.price * i.qty, 0); }

  // ---- DOM injection ----
  let root, itemsEl, subEl, shipFill, shipMsg, badge;
  function build() {
    root = document.createElement("div");
    root.className = "cart-drawer";
    root.id = "cartDrawer";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="cart-overlay" data-cart-close></div>
      <aside class="cart-panel" role="dialog" aria-label="Shopping bag">
        <header class="cart-top">
          <h2>Your bag</h2>
          <button class="cart-x" data-cart-close aria-label="Close">×</button>
        </header>
        <div class="cart-ship">
          <div class="cart-ship-msg" id="cartShipMsg"></div>
          <div class="cart-ship-track"><i id="cartShipFill"></i></div>
        </div>
        <div class="cart-items" id="cartItems"></div>
        <footer class="cart-foot">
          <div class="cart-sub"><span>Subtotal</span><strong id="cartSub">$0.00</strong></div>
          <p class="cart-tax">Shipping &amp; taxes calculated at checkout.</p>
          <button class="btn btn-primary btn-block cart-checkout">Checkout</button>
          <button class="cart-continue" data-cart-close>Continue shopping</button>
        </footer>
      </aside>`;
    document.body.appendChild(root);
    itemsEl = root.querySelector("#cartItems");
    subEl = root.querySelector("#cartSub");
    shipFill = root.querySelector("#cartShipFill");
    shipMsg = root.querySelector("#cartShipMsg");

    root.querySelectorAll("[data-cart-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    // Item interactions (delegated)
    itemsEl.addEventListener("click", (e) => {
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const id = row.dataset.id;
      if (e.target.closest(".ci-remove")) remove(id);
      else if (e.target.closest(".ci-inc")) bump(id, 1);
      else if (e.target.closest(".ci-dec")) bump(id, -1);
    });

    // Wire all nav cart buttons
    document.querySelectorAll(".cart").forEach((c) => {
      c.addEventListener("click", (e) => { e.preventDefault(); open(); });
    });
  }

  // ---- Toast ----
  let toastEl, tTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(tTimer);
    tTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function thumb(it) {
    if (window.DoziFrame) {
      return `<div class="ci-thumb">${window.DoziFrame.svg(it.colorHex || "#E8E2D0", it.tint === "amber" ? "amber" : "clear")}</div>`;
    }
    return `<div class="ci-thumb" style="background:${it.colorHex || "#E8E2D0"}"></div>`;
  }

  function render() {
    const c = count();
    document.querySelectorAll(".cart-count").forEach((b) => (b.textContent = c));

    if (!root) return;
    if (!items.length) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-ico">☾</div>
          <p class="cart-empty-title">Your bag is quiet for now</p>
          <p class="cart-empty-sub">Find the pair you'll wind down in.</p>
          <a href="product.html" class="btn btn-primary">Shop Dozi</a>
        </div>`;
    } else {
      itemsEl.innerHTML = items.map((it) => `
        <div class="cart-item" data-id="${keyOf(it)}">
          ${thumb(it)}
          <div class="ci-body">
            <div class="ci-top">
              <span class="ci-name">${it.name}</span>
              <button class="ci-remove" aria-label="Remove">Remove</button>
            </div>
            <p class="ci-meta">${[it.lens, it.size, it.color].filter(Boolean).join(" · ")}</p>
            <div class="ci-bottom">
              <div class="ci-qty">
                <button class="ci-dec" aria-label="Decrease">−</button>
                <span>${it.qty}</span>
                <button class="ci-inc" aria-label="Increase">+</button>
              </div>
              <span class="ci-price">${money(it.price * it.qty)}</span>
            </div>
          </div>
        </div>`).join("");
    }

    subEl.textContent = money(subtotal());
    const st = subtotal();
    const pct = Math.min(100, (st / FREE_SHIP) * 100);
    shipFill.style.width = pct + "%";
    if (st === 0) shipMsg.innerHTML = `Spend <strong>${money(FREE_SHIP)}</strong> to unlock free shipping`;
    else if (st >= FREE_SHIP) shipMsg.innerHTML = `🎉 You've unlocked <strong>free shipping</strong>`;
    else shipMsg.innerHTML = `You're <strong>${money(FREE_SHIP - st)}</strong> away from free shipping`;
  }

  // ---- Public actions ----
  function add(item) {
    const it = Object.assign({ qty: 1 }, item);
    const k = keyOf(it);
    const existing = items.find((i) => keyOf(i) === k);
    if (existing) existing.qty += 1;
    else items.push(it);
    save(); render();
    toast(`Added · ${it.name} — ${money(it.price)}`);
    open();
  }
  function bump(id, d) {
    const it = items.find((i) => keyOf(i) === id);
    if (!it) return;
    it.qty += d;
    if (it.qty <= 0) items = items.filter((i) => keyOf(i) !== id);
    save(); render();
  }
  function remove(id) { items = items.filter((i) => keyOf(i) !== id); save(); render(); }

  function open() { if (!root) return; root.classList.add("open"); root.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function close() { if (!root) return; root.classList.remove("open"); root.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

  // init
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { build(); render(); });
  else { build(); render(); }

  return { add, open, close, render, toast };
})();
window.doziToast = (m) => window.Cart.toast(m);
