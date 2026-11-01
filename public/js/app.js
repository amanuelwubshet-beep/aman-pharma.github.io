const IS_FILE_MODE = location.protocol === 'file:';

function apiUnavailableNote() {
  return '<p style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);font-size:0.92rem">This section loads from the local backend. Run <code>node server.js</code> and open <a href="http://localhost:3000" style="color:var(--sky-700);text-decoration:underline">localhost:3000</a>.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const hero = document.querySelector('.hero, .page-hero');
  let threshold = 24;
  const measure = () => {
    threshold = hero ? hero.offsetTop + hero.offsetHeight - 90 : 24;
  };
  const onScroll = () => {
    const scrolled = window.scrollY > threshold;
    header.classList.toggle('scrolled', scrolled);
    header.classList.toggle('over-hero', !scrolled && window.scrollY > 24);
  };
  measure();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
});

function getToken() {
  return localStorage.getItem('token') || '';
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  return { 'Authorization': 'Bearer ' + getToken() };
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('active');
  document.querySelector('.nav-toggle')?.classList.toggle('open');
}

function updateNavAuth() {
  const el = document.getElementById('authNav');
  if (!el) return;
  const user = getUser();
  if (user) {
    if (user.role === 'admin') {
      el.textContent = 'Admin';
      el.href = 'admin.html';
    } else {
      el.textContent = 'Hi, ' + user.name.split(' ')[0];
      el.href = 'cart.html';
    }
  } else {
    el.textContent = 'Login';
    el.href = 'auth.html';
  }
}

function updateCartCount() {
  const els = document.querySelectorAll('#cartCount');
  els.forEach(async el => {
    if (!isLoggedIn()) { el.textContent = '0'; return; }
    try {
      const res = await fetch('/api/cart', { headers: authHeaders() });
      if (res.ok) {
        const { cart } = await res.json();
        const count = cart.reduce((sum, c) => sum + c.qty, 0);
        el.textContent = count || '0';
      }
    } catch (e) {}
  });
}

async function addToCart(productId) {
  if (!isLoggedIn()) { window.location.href = 'auth.html'; return; }
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty: 1 })
    });
    if (res.ok) {
      updateCartCount();
      alert('Added to cart successfully!');
    } else if (res.status === 401) {
      window.location.href = 'auth.html';
    }
  } catch (e) {}
}
