const products = [
  { id: 1, name: "Studio Headphones", category: "Tech", price: 2499, badge: "Bestseller", description: "Immersive sound for your everyday.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Ceramic Pour-Over", category: "Home", price: 899, badge: "Staff pick", description: "A slower, better morning ritual.", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Everyday Tote", category: "Accessories", price: 699, badge: "New", description: "Room for all the little essentials.", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Minimal Desk Lamp", category: "Home", price: 1599, badge: "", description: "A warm glow for focused moments.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Wireless Speaker", category: "Tech", price: 3299, badge: "Popular", description: "Small speaker, big atmosphere.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Daily Water Bottle", category: "Accessories", price: 549, badge: "", description: "Hydration that goes wherever you do.", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Soft Knit Throw", category: "Home", price: 1899, badge: "Cosy pick", description: "Your favourite corner, made cosier.", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Smart Watch", category: "Tech", price: 4299, badge: "", description: "A little more insight, at a glance.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80" }
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const filterContainer = document.querySelector("#category-filters");
const emptyState = document.querySelector("#empty-state");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast");
let activeCategory = "All";
let toastTimeout;

function getCart() {
  try { return JSON.parse(localStorage.getItem("shopsphere-cart")) || {}; }
  catch { return {}; }
}
function saveCart(cart) {
  localStorage.setItem("shopsphere-cart", JSON.stringify(cart));
  updateCartCount();
}
function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}
function updateCartCount() {
  const count = Object.values(getCart()).reduce((total, quantity) => total + quantity, 0);
  cartCount.textContent = count;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}
function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  switch (sortSelect.value) {
    case "price-low": visibleProducts.sort((a, b) => a.price - b.price); break;
    case "price-high": visibleProducts.sort((a, b) => b.price - a.price); break;
    case "name": visibleProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
  }
  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" width="700" height="800">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">＋ Add to cart</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <div class="product-title-row"><h3 class="product-title">${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
        <p class="product-description">${product.description}</p>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
}
function addToCart(productId) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
  const product = products.find(item => item.id === productId);
  showToast(`${product.name} added to cart`);
}
function renderCart() {
  const cart = getCart();
  const items = Object.entries(cart).map(([id, quantity]) => ({
    product: products.find(product => product.id === Number(id)), quantity
  })).filter(item => item.product && item.quantity > 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="page-panel">
      <p class="eyebrow">YOUR PICKS</p><h1>Your shopping cart</h1>
      ${items.length ? `
        <table class="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
        <tbody>${items.map(({product, quantity}) => `
          <tr><td><div class="cart-product"><img src="${product.image}" alt=""><div><strong>${product.name}</strong><p class="product-category">${product.category}</p></div></div></td>
          <td>${formatPrice(product.price)}</td>
          <td><div class="quantity-control"><button data-qty="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button><span>${quantity}</span><button data-qty="1" data-id="${product.id}" aria-label="Increase quantity">+</button></div></td>
          <td>${formatPrice(product.price * quantity)}</td><td><button class="remove-button" data-remove="${product.id}">Remove</button></td></tr>`).join("")}
        </tbody></table>
        <div class="cart-summary"><div><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div><div><span>Shipping</span><strong>${subtotal >= 1999 ? "FREE" : formatPrice(99)}</strong></div><div><span>Estimated total</span><strong>${formatPrice(subtotal + (subtotal >= 1999 ? 0 : 99))}</strong></div><button id="checkout-button" class="button button-dark" type="button">Demo checkout ↗</button><p class="product-description">Demo only — no payment is collected.</p></div>
      ` : `<p class="product-description">Your cart is empty for now. Find something lovely in our collection.</p><a class="button button-dark" href="#shop">Browse products ↗</a>`}
    </section>`;
}
function renderAbout() {
  document.querySelector("#app").innerHTML = `
    <section class="page-panel"><p class="eyebrow">A SMALLER, THOUGHTFUL WAY TO SHOP</p><h1>Everyday things.<br><em>Picked with purpose.</em></h1>
    <p>ShopSphere is a demo e-commerce storefront built to showcase a clean product catalog, responsive design, client-side navigation, search, sorting, category filters, and a persistent shopping cart.</p>
    <p>Our project focuses on making the essentials easy to discover and enjoyable to browse. Product listings and checkout are illustrative; no real orders or payments are processed.</p>
    <a class="button button-dark" href="#shop">Explore the collection ↗</a></section>`;
}
// Keep the original home page markup available for client-side route transitions.
const initialAppMarkup = document.querySelector("#app").innerHTML;
function navigate() {
  const route = (location.hash.replace("#", "") || "home").split("?")[0];
  const app = document.querySelector("#app");
  if (route === "cart") renderCart();
  else if (route === "about") renderAbout();
  else if (route === "shop") {
    app.innerHTML = initialAppMarkup;
    bindHomeControls();
    document.querySelector("#shop-section")?.scrollIntoView({ behavior: "smooth" });
  } else {
    app.innerHTML = initialAppMarkup;
    bindHomeControls();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  updateCartCount();
}
function bindHomeControls() {
  const grid = document.querySelector("#product-grid");
  const search = document.querySelector("#search-input");
  const sort = document.querySelector("#sort-select");
  const filters = document.querySelector("#category-filters");
  if (search) search.addEventListener("input", renderProducts);
  if (sort) sort.addEventListener("change", renderProducts);
  if (filters) filters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip === button));
    renderProducts();
  });
  if (grid) grid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
  });
  const newsletterForm = document.querySelector("#newsletter-form");
  if (newsletterForm) newsletterForm.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.querySelector("#email-input").value.trim();
    document.querySelector("#newsletter-message").textContent = `Thanks! ${email} has been added to this demo list.`;
    newsletterForm.reset();
  });
  renderProducts();
}
document.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const cart = getCart();
    const id = quantityButton.dataset.id;
    cart[id] = (cart[id] || 0) + Number(quantityButton.dataset.qty);
    if (cart[id] <= 0) delete cart[id];
    saveCart(cart); renderCart();
  }
  if (removeButton) {
    const cart = getCart();
    delete cart[removeButton.dataset.remove];
    saveCart(cart); renderCart();
  }
  if (event.target.closest("#checkout-button")) showToast("Demo checkout only — no payment was taken.");
});
window.addEventListener("hashchange", navigate);
document.querySelector("#year").textContent = new Date().getFullYear();
bindHomeControls();
updateCartCount();
if (location.hash) navigate();
