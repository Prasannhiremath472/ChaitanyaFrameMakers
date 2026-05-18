const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const makeStorage = (subDir) =>
  multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', subDir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB

const uploadProduct = multer({ storage: makeStorage('products'), fileFilter: imageFilter,
  limits: { fileSize: maxSize, files: 8 } });

const uploadBanner  = multer({ storage: makeStorage('banners'),  fileFilter: imageFilter,
  limits: { fileSize: maxSize, files: 1 } });

const uploadAvatar  = multer({ storage: makeStorage('avatars'),  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

const uploadCustom  = multer({ storage: makeStorage('custom'),   fileFilter: imageFilter,
  limits: { fileSize: maxSize, files: 1 } });

module.exports = { uploadProduct, uploadBanner, uploadAvatar, uploadCustom };
