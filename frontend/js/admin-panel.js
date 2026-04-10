const requireAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('login.html');
    return false;
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') {
    window.location.replace('dashboard.html');
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

const ALLOWED_STATUSES = ['Placed', 'Confirmed', 'Cutting', 'Bending', 'Finishing', 'Shipped', 'Delivered'];

const detectPage = () => {
  const path = window.location.pathname;
  if (path.includes('admin-pricing')) return 'pricing';
  if (path.includes('admin')) return 'orders';
  return null;
};

const PAGE_SIZE = 20;

const initOrders = () => {
  if (!requireAdmin()) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const loadingMsg = document.getElementById('loadingMsg');
  const errorMsg = document.getElementById('errorMsg');
  const emptyState = document.getElementById('emptyState');
  const tableSection = document.getElementById('tableSection');
  const ordersBody = document.getElementById('ordersBody');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageInfo = document.getElementById('pageInfo');
  const statusFilter = document.getElementById('statusFilter');

  let allOrders = [];
  let currentPage = 1;
  let statusValue = '';

  const renderPage = () => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = allOrders.slice(start, start + PAGE_SIZE);
    const total = allOrders.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    pageInfo.textContent = `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    ordersBody.innerHTML = '';

    slice.forEach((order) => {
      const userEmail = order.user ? order.user.email : '—';

      const statusOptions = ALLOWED_STATUSES.map((s) =>
        `<option value="${s}"${order.status === s ? ' selected' : ''}>${s}</option>`
      ).join('');

      const tr = document.createElement('tr');
      tr.dataset.orderId = order.id;
      tr.innerHTML = `
        <td><strong>${order.id}</strong></td>
        <td>${userEmail}</td>
        <td>${formatDate(order.createdAt)}</td>
        <td>${fmt(order.totalPrice)}</td>
        <td class="status-cell-${order.id}">${statusBadge(order.status)}</td>
        <td>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <select class="table-select status-select" data-id="${order.id}">
              ${statusOptions}
            </select>
            <button class="btn btn--primary btn--sm save-status-btn" data-id="${order.id}">Save</button>
            <span class="save-confirm-${order.id}" style="font-size:0.8rem;color:#16a34a;display:none;">Saved</span>
          </div>
        </td>
      `;
      ordersBody.appendChild(tr);
    });

    ordersBody.querySelectorAll('.save-status-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const select = ordersBody.querySelector(`.status-select[data-id="${id}"]`);
        const newStatus = select.value;

        btn.disabled = true;
        btn.textContent = '…';

        try {
          await updateOrderStatus(id, newStatus);
          const idx = allOrders.findIndex((o) => o.id === id);
          if (idx !== -1) allOrders[idx].status = newStatus;

          const cell = ordersBody.querySelector(`.status-cell-${id}`);
          if (cell) cell.innerHTML = statusBadge(newStatus);

          const confirm = ordersBody.querySelector(`.save-confirm-${id}`);
          if (confirm) {
            confirm.style.display = 'inline';
            setTimeout(() => { confirm.style.display = 'none'; }, 2500);
          }
        } catch (err) {
          alert(`Failed to update status: ${err.message}`);
        }

        btn.disabled = false;
        btn.textContent = 'Save';
      });
    });
  };

  const loadOrders = async () => {
    loadingMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    emptyState.classList.add('hidden');
    tableSection.classList.add('hidden');

    try {
      const result = await getAllOrders(statusValue);

      loadingMsg.classList.add('hidden');

      allOrders = result.orders || [];
      currentPage = 1;

      if (allOrders.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }

      tableSection.classList.remove('hidden');
      renderPage();
    } catch (err) {
      loadingMsg.classList.add('hidden');
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  };

  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    statusValue = statusFilter.value;
    currentPage = 1;
    loadOrders();
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderPage(); }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(allOrders.length / PAGE_SIZE);
    if (currentPage < totalPages) { currentPage++; renderPage(); }
  });

  loadOrders();
};

const initPricing = () => {
  if (!requireAdmin()) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const loadingMsg = document.getElementById('loadingMsg');
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const tableSection = document.getElementById('tableSection');
  const configBody = document.getElementById('configBody');

  const formatUpdated = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const loadConfig = async () => {
    loadingMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    tableSection.classList.add('hidden');

    try {
      const config = await getPricingConfig();
      loadingMsg.classList.add('hidden');
      tableSection.classList.remove('hidden');

      configBody.innerHTML = '';

      config.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${row.key}</code></td>
          <td>
            <input
              type="text"
              class="form-control"
              style="max-width:140px;"
              value="${row.value}"
              data-key="${row.key}"
            >
          </td>
          <td>${formatUpdated(row.updatedAt)}</td>
          <td>
            <button class="btn btn--primary btn--sm save-config-btn" data-key="${row.key}">Save</button>
            <span class="config-saved-${row.key.replace(/_/g, '-')}" style="font-size:0.8rem;color:#16a34a;margin-left:0.4rem;display:none;">Saved</span>
          </td>
        `;
        configBody.appendChild(tr);
      });

      configBody.querySelectorAll('.save-config-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const key = btn.dataset.key;
          const input = configBody.querySelector(`input[data-key="${key}"]`);
          const value = input.value.trim();

          if (!value) return;

          btn.disabled = true;
          btn.textContent = '…';
          successMsg.classList.add('hidden');

          try {
            await updatePricingConfig(key, value);

            const safeKey = key.replace(/_/g, '-');
            const confirm = configBody.querySelector(`.config-saved-${safeKey}`);
            if (confirm) {
              confirm.style.display = 'inline';
              setTimeout(() => { confirm.style.display = 'none'; }, 2500);
            }
          } catch (err) {
            errorMsg.textContent = `Failed to save ${key}: ${err.message}`;
            errorMsg.classList.remove('hidden');
          }

          btn.disabled = false;
          btn.textContent = 'Save';
        });
      });
    } catch (err) {
      loadingMsg.classList.add('hidden');
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  };

  loadConfig();
};

const page = detectPage();
if (page === 'orders') initOrders();
else if (page === 'pricing') initPricing();
