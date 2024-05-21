import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import listingsRouter from './routes/listingRoutes.js';
import usersRouter from './routes/userRoutes.js';
import imagesRouter from './routes/imageRoutes.js';

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const uploadDir = path.join(dirname, 'uploads');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(dirname, 'uploads')));

app.use('/listings', listingsRouter);
app.use('/users', usersRouter);
app.use('/listings', imagesRouter); // Images is listinget használ,mert a listázáshoz töltjük a képet

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
