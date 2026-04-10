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

const showErrors = (errors) => {
  const msg = document.getElementById('errorMsg');
  const list = document.getElementById('errorList');

  list.innerHTML = '';
  if (Array.isArray(errors)) {
    errors.forEach((e) => {
      const li = document.createElement('li');
      li.textContent = e;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = errors;
    list.appendChild(li);
  }

  msg.classList.remove('hidden');
};

const hideErrors = () => {
  document.getElementById('errorMsg').classList.add('hidden');
};

const init = () => {
  if (!requireAuth()) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const fileId = sessionStorage.getItem('fileId');
  if (!fileId) {
    window.location.replace('upload.html');
    return;
  }

  const form = document.getElementById('configForm');
  const quoteBtn = document.getElementById('quoteBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErrors();

    const material = document.getElementById('material').value;
    const finish = document.getElementById('finish').value;
    const thickness = parseFloat(document.getElementById('thickness').value);
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const bends = parseInt(document.getElementById('bends').value, 10);
    const bendAngle = parseFloat(document.getElementById('bendAngle').value);

    if (!material || !finish || isNaN(thickness) || isNaN(quantity) || isNaN(bends) || isNaN(bendAngle)) {
      showErrors(['Please fill in all fields.']);
      return;
    }

    quoteBtn.disabled = true;
    quoteBtn.textContent = 'Calculating…';

    try {
      const quoteData = await getQuote(fileId, material, thickness, quantity, bends, bendAngle, finish);

      const inputs = { material, thickness, quantity, bends, bendAngle, finish };
      sessionStorage.setItem('quoteData', JSON.stringify(quoteData));
      sessionStorage.setItem('inputs', JSON.stringify(inputs));

      window.location.href = 'quote.html';
    } catch (err) {
      const details = err.details;
      if (Array.isArray(details) && details.length > 0) {
        showErrors(details);
      } else {
        showErrors([err.message]);
      }
      quoteBtn.disabled = false;
      quoteBtn.textContent = 'Get Quote';
    }
  });
};

init();
