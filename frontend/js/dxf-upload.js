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

const showError = (msg) => {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
};

const hideError = () => {
  document.getElementById('errorMsg').classList.add('hidden');
};

let selectedFile = null;

const setFile = (file) => {
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'dxf') {
    showError('Only .dxf files are accepted.');
    return;
  }

  hideError();
  selectedFile = file;

  const fileSelected = document.getElementById('fileSelected');
  document.getElementById('fileName').textContent = file.name;
  fileSelected.classList.remove('hidden');

  document.getElementById('uploadBtn').disabled = false;
};

const initDropzone = () => {
  const dropzone = document.getElementById('dropzone');
  const dxfInput = document.getElementById('dxfInput');

  dxfInput.addEventListener('change', () => {
    if (dxfInput.files.length > 0) setFile(dxfInput.files[0]);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    setFile(file);
  });
};

const showResults = (geometry) => {
  document.getElementById('resPerimeter').textContent = geometry.perimeter;
  document.getElementById('resWidth').textContent = geometry.boundingBoxWidth;
  document.getElementById('resHeight').textContent = geometry.boundingBoxHeight;
  document.getElementById('resEntities').textContent = geometry.entityCount;
  document.getElementById('resultsSection').classList.remove('hidden');
};

const init = () => {
  if (!requireAuth()) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  initDropzone();

  const uploadBtn = document.getElementById('uploadBtn');

  uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    hideError();
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading…';

    try {
      const formData = new FormData();
      formData.append('dxfFile', selectedFile);

      const data = await uploadDXF(formData);
      sessionStorage.setItem('fileId', data.fileId);
      sessionStorage.setItem('geometry', JSON.stringify(data.geometry));

      showResults(data.geometry);
    } catch (err) {
      showError(err.message);
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload File';
    }
  });

  document.getElementById('continueBtn').addEventListener('click', () => {
    window.location.href = 'configure.html';
  });
};

init();
