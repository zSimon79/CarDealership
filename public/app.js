import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const listings = {};
let nextId = 1;

app.get('/', (req, res) => {
  res.sendFile(path.join(dirname, '/index.html'));
});

app.post('/listings', (req, res) => {
  const { brand, city, price, date } = req.body;
  const id = nextId++;
  listings[id] = { brand, city, price, date, images: [] };

  res.json({
    message: 'Listázás létrehozva',
    listingDetails: {
      id,
      brand,
      city,
      price,
      date,
    },
  });
});

app.post('/upload/:id', upload.single('image'), (req, res) => {
  if (req.file) {
    console.log('Uploaded: ', req.file);
    res.json({ message: 'Kép feltöltve', fileInfo: req.file });
  } else {
    res.status(400).send({ message: 'Kép nem töltődött fel' });
  }
});

app.get('/search', (req, res) => {
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

  res.json({
    results: filteredListings,
  });
});

app.listen(3000, () => {
  console.log('Server running');
});
