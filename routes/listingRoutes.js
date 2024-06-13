import express from 'express';
import { body, validationResult, query } from 'express-validator';
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getImagesByCarId,
  searchListings,
  getUserById,
  createOffer,
  getOffersByCarId,
  updateOffer,
} from '../database/dbquery.js';

const router = express.Router();

const listingValidation = [
  body('brand').isString().withMessage('Márka név szöveg kell legyen'),
  body('model').isString().withMessage('Model név szöveg kell legyen'),
  body('city').isString().withMessage('Város név szöveg kell legyen'),
  body('motor').isString().withMessage('Üzemanyag típus szöveg kell legyen'),
  body('price').isFloat({ min: 1 }).withMessage('Ár valós pozitív szám kell legyen'),
  body('date').isISO8601().withMessage('Dátum valid dátum kell legyen'),
];

router.get('/new', async (req, res) => {
  try {
    const user = await getUserById(req.cookies.userId);
    res.render('new', { errors: [], user: user.nev, userId: user.felhasznaloID });
  } catch (error) {
    res.status(500).render('error', { error: 'Form hiba' });
  }
});

router.post('/', listingValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(400).json({ errors: errors.array() });
    }
    return res.status(400).redirect('back');
  }

  try {
    await createListing(req.body);
    return res.redirect('/?success=true');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get(
  '/',
  [
    query('marka').optional().isString().trim(),
    query('model').optional().isString().trim(),
    query('varos').optional().isString().trim(),
    query('motor').optional().isString().trim(),
    query('minAr').optional().toFloat(),
    query('maxAr').optional().toFloat(),
    query('datum').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const filters = req.query;
      let listings = [];

      if (Object.values(filters).some((v) => v !== undefined && v !== '' && v != null)) {
        listings = await searchListings(filters);
      } else {
        listings = await getAllListings();
      }
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        res.json(listings);
      } else {
        res.render('index', { listings, searchQuery: req.query, user: req.cookies.user });
      }
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  },
);

router.get('/:id', async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    if (listing) {
      const images = await getImagesByCarId(req.params.id);
      listing.images = images;
      res.json(listing);
    } else {
      res.status(404).render('error', { message: 'Listázás nem található' });
    }
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await updateListing({ listingId: req.params.id, ...req.body });
    res.status(200).json({ message: 'Listázás frissítve' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteListing(req.params.id);
    res.status(200).json({ message: 'Listázás törölve' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/details/:id', async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    if (listing) {
      const images = await getImagesByCarId(req.params.id);
      listing.images = images;
      const offers = await getOffersByCarId(req.params.id);
      if (req.cookies.userId) {
        const user = await getUserById(req.cookies.userId);
        res.render('details', {
          listing,
          user: user.nev || null,
          userId: user.felhasznaloID || null,
          userRole: user.szerep || null,
          offers,
        });
      } else {
        res.render('details', {
          listing,
          user: null,
          userId: null,
          userRole: null,
          offers,
        });
      }
    } else {
      res.status(404).render('error', { message: 'Listázás nem található', user: null });
    }
  } catch (error) {
    res.status(500).render('error', { error: error.message, user: null });
  }
});

router.post('/:id/offers', async (req, res) => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ message: 'Kérem jelentkezzen be ajánlat tételhez' });
  } else {
    try {
      const car = await getListingById(id);
      if (car.felhasznaloID === req.cookies.userId) {
        res.status(403).json({ message: 'Miért tenne ajánlatot a saját kocsijára?.' });
      } else {
        await createOffer({
          listingId: id,
          offerorId: req.cookies.userId,
          listerId: car.felhasznaloID,
          price: req.body.offer,
        });
        res.status(201).json({ message: 'Ajánlat feltéve.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Hiba történt ajánláskor.' });
    }
  }
});

router.post('/offers/:id', async (req, res) => {
  console.log(req.user);
  const { decision } = req.body;
  if (['elfogadva', 'elutasitva'].includes(decision)) {
    try {
      await updateOffer(req.params.id, decision);
      res.json({ decision });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Nem sikerült értékelni az ajánlatot.' });
    }
  } else {
    res.status(400).json({ message: 'Hibás döntés.' });
  }
});

export default router;
