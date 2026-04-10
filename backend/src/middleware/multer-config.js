const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.dxf') {
    return cb(new Error('Only .dxf files are allowed'), false);
  }
  const mimeType = file.mimetype.toLowerCase();
  const allowedMimes = [
    'application/dxf',
    'application/octet-stream',
    'text/plain',
    'image/vnd.dxf',
    'application/acad'
  ];
  if (!allowedMimes.includes(mimeType)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
};

const maxSizeBytes = parseInt(
  process.env.MAX_FILE_SIZE_MB || '10', 10
) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeBytes,
    files: 1
  }
});

const validateDXFContent = (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const buffer = Buffer.alloc(32);
  let fd;

  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 32, 0);
    fs.closeSync(fd);

    const header = buffer.toString('utf8', 0, 32);
    const hasBinaryHeader = buffer[0] === 0x1F || 
                            buffer[0] === 0x4D ||
                            buffer[0] === 0x50 ||
                            buffer[0] === 0x7F;

    if (hasBinaryHeader) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid file content. Must be a valid DXF file.',
        error: 'INVALID_FILE_CONTENT',
        details: null
      });
    }

    next();
  } catch (err) {
    if (fd) fs.closeSync(fd);
    next();
  }
};

module.exports = [upload.single('dxfFile'), validateDXFContent];