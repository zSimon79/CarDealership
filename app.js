import express from 'express';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import loginRouter from './routes/loginRoutes.js';
import listingsRouter from './routes/listingRoutes.js';
import usersRouter from './routes/userRoutes.js';
import imagesRouter from './routes/imageRoutes.js';
import { getUploadDir } from './config/uploadConfig.js';
import { verifyToken, optionalAuth } from './middleware/jwt.js';

const app = express();

const uploadDir = getUploadDir('../uploads');
console.log(uploadDir);
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.use('/login', loginRouter);
app.use('/listings', optionalAuth, listingsRouter);
app.use('/users', verifyToken, usersRouter);
app.use('/listings', verifyToken, imagesRouter); // Images is listinget használ,mert a listázáshoz töltjük a képet

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
