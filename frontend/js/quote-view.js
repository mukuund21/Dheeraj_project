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

const fmt = (num) => `£${Number(num).toFixed(2)}`;

const populateBreakdown = (quote) => {
  document.getElementById('materialCost').textContent = fmt(quote.materialCost);
  document.getElementById('cuttingCost').textContent = fmt(quote.cuttingCost);
  document.getElementById('bendingCost').textContent = fmt(quote.bendingCost);
  document.getElementById('finishingCost').textContent = fmt(quote.finishingCost);
  document.getElementById('subtotal').textContent = fmt(quote.subtotal);
  document.getElementById('margin').textContent = fmt(quote.margin);
  document.getElementById('unitPrice').textContent = fmt(quote.unitPrice);
  document.getElementById('discountPct').textContent = quote.bulkDiscount;

  const discountAmount = (quote.unitPrice * quote.quantity) - quote.totalPrice;
  document.getElementById('bulkDiscount').textContent =
    quote.bulkDiscount > 0 ? `-${fmt(discountAmount)}` : fmt(0);

  document.getElementById('totalQty').textContent = quote.quantity;
  document.getElementById('totalPrice').textContent = fmt(quote.totalPrice);
  document.getElementById('leadTime').textContent = quote.leadTime;
};

const init = () => {
  if (!requireAuth()) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const raw = sessionStorage.getItem('quoteData');
  if (!raw) {
    window.location.replace('configure.html');
    return;
  }

  const quoteData = JSON.parse(raw);
  populateBreakdown(quoteData);

  const placeOrderBtn = document.getElementById('placeOrderBtn');

  placeOrderBtn.addEventListener('click', async () => {
    const fileId = sessionStorage.getItem('fileId');
    const inputs = JSON.parse(sessionStorage.getItem('inputs') || '{}');

    if (!fileId) {
      window.location.replace('upload.html');
      return;
    }

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing order…';

    try {
      const data = await placeOrder(fileId, quoteData, inputs);
      sessionStorage.setItem('orderId', data.orderId);
      sessionStorage.setItem('lastOrder', JSON.stringify(data.order));
      window.location.href = 'order-confirm.html';
    } catch (err) {
      const errorMsg = document.getElementById('errorMsg');
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
  });
};

init();
