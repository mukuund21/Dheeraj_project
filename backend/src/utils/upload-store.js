const { v4: uuidv4 } = require('uuid');

const store = new Map();

const savePendingUpload = (filename, originalName, geometry) => {
  const fileId = uuidv4();
  store.set(fileId, { fileId, filename, originalName, geometry });
  return fileId;
};

const getPendingUpload = (fileId) => {
  return store.get(fileId) || null;
};

const deletePendingUpload = (fileId) => {
  store.delete(fileId);
};

module.exports = { savePendingUpload, getPendingUpload, deletePendingUpload };
