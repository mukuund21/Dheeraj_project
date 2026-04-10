const isLoggedIn = () => !!localStorage.getItem('token');

const redirectIfLoggedIn = () => {
  if (isLoggedIn()) {
    window.location.replace('upload.html');
  }
};

const showError = (msg) => {
  const el = document.getElementById('errorMsg');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
};

const hideError = () => {
  const el = document.getElementById('errorMsg');
  if (el) el.classList.add('hidden');
};

const setLoading = (btn, loading) => {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label;
};

const saveSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const detectPage = () => {
  const path = window.location.pathname;
  if (path.includes('login')) return 'login';
  if (path.includes('register')) return 'register';
  return null;
};

const initLogin = () => {
  redirectIfLoggedIn();

  const form = document.getElementById('loginForm');
  const btn = document.getElementById('submitBtn');
  btn.dataset.label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    setLoading(btn, true);

    try {
      const data = await loginUser(email, password);
      saveSession(data.token, data.user);
      window.location.replace('upload.html');
    } catch (err) {
      showError(err.message);
      setLoading(btn, false);
    }
  });
};

const initRegister = () => {
  redirectIfLoggedIn();

  const form = document.getElementById('registerForm');
  const btn = document.getElementById('submitBtn');
  btn.dataset.label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!email || !password || !confirm) {
      showError('All fields are required.');
      return;
    }

    if (password !== confirm) {
      showError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    setLoading(btn, true);

    try {
      const data = await registerUser(email, password);
      saveSession(data.token, data.user);
      window.location.replace('upload.html');
    } catch (err) {
      showError(err.message);
      setLoading(btn, false);
    }
  });
};

const page = detectPage();
if (page === 'login') initLogin();
else if (page === 'register') initRegister();
