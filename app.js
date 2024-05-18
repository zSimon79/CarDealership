import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import { body, validationResult, query } from 'express-validator';

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const uploadDir = path.join(dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(dirname, '/uploads'));
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const listings = {};
let nextId = 1;

app.get('/', (req, res) => {
  res.sendFile(path.join(dirname, '/index.html'));
});

app.post(
  '/listings',
  [
    body('brand').isString().withMessage('Márka név szöveg kell legyen'),
    body('city').isString().withMessage('Város név szöveg kell legyen'),
    body('price').isFloat({ min: 1 }).withMessage('Ár valós pozitív szám kell legyen'),
    body('date').isISO8601().withMessage('Dátum valid dátum kell legyen'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { brand, city, price, date } = req.body;
    const id = nextId++;
    listings[id] = { brand, city, price, date, images: [] };

    return res.json({
      message: 'Listázás létrehozva',
      listingDetails: {
        id,
        brand,
        city,
        price,
        date,
      },
    });
  },
);

app.post('/upload/:id', upload.single('image'), (req, res) => {
  const listingId = req.params.id;

  if (!listings[listingId]) {
    if (req.file) {
      fs.unlink(path.join(uploadDir, req.file.filename), (err) => {
        if (err) console.error('Hiba a file törlésénél:', err);
      });
    }
    return res.status(404).json({ message: 'Listázás nem található' });
  }
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Nincs kép megadva' });
  }

  listings[listingId].images.push(req.file.path);
  console.log('Feltöltöt file:', req.file);
  return res.json({ message: 'Kép sikeresen feltöltve', fileInfo: req.file });
});

app.get('/upload/:id', (req, res) => {
  if (!listings[req.params.id]) {
    return res.status(404).send({ message: 'Listázás nem található' });
  }

  return res.json({ images: listings[req.params.id].images });
});

app.get(
  '/search',
  [
    query('brand').optional().isString().withMessage('Márka név szöveg kell legyen'),
    query('city').optional().isString().withMessage('Város név szöveg kell legyen'),
    query('minPrice')
      .optional()
      .custom((value) => {
        if (value === '') return true;
        const float = parseFloat(value);
        return !Number.isNaN(float) && float >= 0;
      })
      .withMessage('A minimum ár muszáj pozitív szám legyen'),
    query('maxPrice')
      .optional()
      .custom((value) => {
        if (value === '') return true;
        const float = parseFloat(value);
        return !Number.isNaN(float) && float >= 0;
      })
      .withMessage('A maximum ár muszáj pozitív szám legyen'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { brand, city, minPrice, maxPrice } = req.query;
    const filteredListings = Object.entries(listings)
      .filter(
        ([, listing]) =>
          (!brand || listing.brand === brand) &&
          (!city || listing.city === city) &&
          (!minPrice || parseFloat(listing.price) >= parseFloat(minPrice)) &&
          (!maxPrice || parseFloat(listing.price) <= parseFloat(maxPrice)),
      )
      .map(([id, listing]) => ({
        id,
        brand: listing.brand,
        city: listing.city,
        price: listing.price,
        date: listing.date,
      }));

    return res.json({ results: filteredListings });
  },
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
