const { parseDXF } = require('../services/dxf-processor');
const { savePendingUpload } = require('../utils/upload-store');
const { success, error } = require('../utils/api-response');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No DXF file uploaded', 400);
    }

    const geometry = await parseDXF(req.file.path);

    const fileId = savePendingUpload(req.file.filename, req.file.originalname, geometry);

    return success(res, { fileId, geometry }, 'File uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFile };
