import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(dirname, '../uploads'));
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Csak képet megengedett feltölteni!'), false);
  }
};

const upload = multer({ storage, fileFilter: imageFileFilter });

export default upload;
