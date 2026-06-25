// ---- Dozi store interactions ----
const money = n => '$' + Number(n).toFixed(2);

// Colorway swatches
const swatches = document.querySelectorAll('.swatch');
const swatchName = document.getElementById('swatch-name');
swatches.forEach(sw => sw.addEventListener('click', () => {
  swatches.forEach(s => s.classList.remove('is-active'));
  sw.classList.add('is-active');
  if (swatchName) swatchName.textContent = sw.dataset.name;
}));

// Lens price selectors per product card
document.querySelectorAll('.product-card').forEach(card => {
  const opts = card.querySelectorAll('.price-opt');
  const addPrice = card.querySelector('.add-price');
  opts.forEach(opt => opt.addEventListener('click', () => {
    opts.forEach(o => o.classList.remove('is-active'));
    opt.classList.add('is-active');
    if (addPrice) addPrice.textContent = money(opt.dataset.price);
  }));
});

// Add-to-cart on homepage product cards → shared Cart drawer
const colorHexMap = { Cream: '#E8E2D0', Blush: '#E9C9C4', Sage: '#9FB39C', Slate: '#6E94AE', Sand: '#C9A876', Honey: '#E4CF76' };
document.querySelectorAll('[data-add]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const card = btn.closest('.product-card');
    const active = card.querySelector('.price-opt.is-active');
    const lens = active.querySelector('.po-name').textContent;
    const price = parseFloat(active.dataset.price);
    const activeSwatch = document.querySelector('.colorways .swatch.is-active');
    const color = activeSwatch?.dataset.name || 'Cream';
    const name = btn.dataset.add; // "Dozi Silicone" / "Dozi Silk-Lined"
    window.Cart.add({
      name,
      frame: name.replace('Dozi ', ''),
      lens,
      size: 'Small',
      color,
      colorHex: colorHexMap[color] || '#E8E2D0',
      tint: 'clear',
      price,
    });
  });
});

// Subtle nav shadow on scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => {
  nav.style.boxShadow = scrollY > 10 ? '0 6px 24px -18px rgba(15,34,53,.4)' : 'none';
}, { passive: true });
