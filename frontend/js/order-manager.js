const requireAuth = () => {
  if (!localStorage.getItem('token')) {
    window.location.replace('login.html');
    return false;
  }
  return true;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.replace('login.html');
};

const fmt = (num) => `₹${Number(num).toFixed(2)}`;

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
  const key = status.toLowerCase();
  return `<span class="badge badge--${key}">${status}</span>`;
};

const detectPage = () => {
  const path = window.location.pathname;
  if (path.includes('order-confirm')) return 'confirm';
  if (path.includes('dashboard')) return 'dashboard';
  return null;
};

const initConfirm = () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const orderId = sessionStorage.getItem('orderId');
  const orderRaw = sessionStorage.getItem('lastOrder');
  const quoteRaw = sessionStorage.getItem('quoteData');
  const inputsRaw = sessionStorage.getItem('inputs');

  if (orderId) {
    document.getElementById('orderId').textContent = orderId;
  }

  if (orderRaw) {
    const order = JSON.parse(orderRaw);
    const inputs = inputsRaw ? JSON.parse(inputsRaw) : {};
    const quote = quoteRaw ? JSON.parse(quoteRaw) : {};

    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('sumMaterial', cap(inputs.material || ''));
    setVal('sumFinish', (inputs.finish || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    setVal('sumQuantity', inputs.quantity || '—');
    setVal('sumTotal', fmt(order.totalPrice || quote.totalPrice || 0));
    setVal('sumLeadTime', `${quote.leadTime || '—'} days`);
  }

  const trackBtn = document.getElementById('trackBtn');
  if (trackBtn && orderId) {
    trackBtn.href = `order-tracking.html?id=${encodeURIComponent(orderId)}`;
  }
};

const initDashboard = () => {
  if (!requireAuth()) return;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const loadingMsg = document.getElementById('loadingMsg');
  const errorMsg = document.getElementById('errorMsg');
  const emptyState = document.getElementById('emptyState');
  const tableSection = document.getElementById('tableSection');
  const ordersBody = document.getElementById('ordersBody');

  const loadOrders = async () => {
    try {
      const orders = await getMyOrders();

      loadingMsg.classList.add('hidden');

      if (!orders || orders.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }

      tableSection.classList.remove('hidden');
      ordersBody.innerHTML = '';

      orders.forEach((order) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${order.id}</strong></td>
          <td>${formatDate(order.createdAt)}</td>
          <td>${fmt(order.totalPrice)}</td>
          <td>${statusBadge(order.status)}</td>
          <td>
            <a href="order-tracking.html?id=${encodeURIComponent(order.id)}"
               class="btn btn--secondary btn--sm">Track</a>
          </td>
        `;
        ordersBody.appendChild(tr);
      });
    } catch (err) {
      loadingMsg.classList.add('hidden');
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  };

  loadOrders();
};

const page = detectPage();
if (page === 'confirm') initConfirm();
else if (page === 'dashboard') initDashboard();
