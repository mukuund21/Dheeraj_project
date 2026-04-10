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

const STAGES = [
  'Placed',
  'Confirmed',
  'Cutting',
  'Bending',
  'Finishing',
  'Shipped',
  'Delivered',
];

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const statusBadge = (status) => {
  const key = status.toLowerCase();
  return `<span class="badge badge--${key}">${status}</span>`;
};

const getStageTimestamp = (statusHistory, stage) => {
  const entry = statusHistory
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .find((h) => h.status === stage);
  return entry ? entry.timestamp : null;
};

const currentStageIndex = (status) => STAGES.indexOf(status);

const renderTimeline = (order) => {
  const timeline = document.getElementById('timeline');
  const activeIdx = currentStageIndex(order.status);
  timeline.innerHTML = '';

  STAGES.forEach((stage, idx) => {
    const timestamp = getStageTimestamp(order.statusHistory, stage);
    const isDone = idx < activeIdx || (idx === activeIdx && timestamp);
    const isActive = idx === activeIdx;

    const li = document.createElement('li');
    li.className = `timeline__item${isDone ? ' timeline__item--done' : ''}${isActive && !isDone ? ' timeline__item--active' : ''}`;

    li.innerHTML = `
      <div class="timeline__dot">${isDone ? '✓' : '○'}</div>
      <div>
        <div class="timeline__stage">${stage}</div>
        ${timestamp ? `<div class="timeline__time">${formatDateTime(timestamp)}</div>` : '<div class="timeline__time">Pending</div>'}
      </div>
    `;
    timeline.appendChild(li);
  });
};

const showOrderInfo = (order) => {
  document.getElementById('trackingSection').classList.remove('hidden');
  document.getElementById('trackOrderId').textContent = order.id;
  document.getElementById('trackStatus').innerHTML = statusBadge(order.status);
  document.getElementById('trackDate').textContent = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  renderTimeline(order);
};

let refreshInterval = null;
let currentOrderId = null;

const fetchAndRender = async (orderId) => {
  const searchError = document.getElementById('searchError');
  searchError.classList.add('hidden');

  try {
    const order = await getOrder(orderId);
    showOrderInfo(order);
  } catch (err) {
    document.getElementById('trackingSection').classList.add('hidden');
    searchError.textContent = err.message;
    searchError.classList.remove('hidden');
  }
};

const startAutoRefresh = (orderId) => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => fetchAndRender(orderId), 30000);
};

const init = () => {
  if (!requireAuth()) return;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (refreshInterval) clearInterval(refreshInterval);
    logout();
  });

  window.addEventListener('pagehide', () => {
    if (refreshInterval) clearInterval(refreshInterval);
  });

  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get('id');

  if (idFromUrl) {
    const input = document.getElementById('orderIdInput');
    input.value = idFromUrl;
    currentOrderId = idFromUrl;
    fetchAndRender(idFromUrl);
    startAutoRefresh(idFromUrl);
  }

  document.getElementById('searchBtn').addEventListener('click', async () => {
    const id = document.getElementById('orderIdInput').value.trim();
    if (!id) return;

    if (refreshInterval) clearInterval(refreshInterval);
    currentOrderId = id;
    await fetchAndRender(id);
    startAutoRefresh(id);
  });
};

init();
