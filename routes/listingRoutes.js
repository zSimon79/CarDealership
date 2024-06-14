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
  createOffer,
  getOffersByCarId,
  updateOffer,
  getListingOwner,
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

router.get('/new', (req, res) => {
  try {
    res.render('new', { errors: [], user: req.user.username, userId: req.user.userId, listing: null });
  } catch (error) {
    res.status(500).render('error', { error: 'Form hiba' });
  }
});

router.post('/', listingValidation, async (req, res) => {
  req.body.userId = req.user.userId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(400).send({ errors: errors.array() });
    }
    return res.status(400).redirect('back');
  }

  try {
    await createListing(req.body);
    return res.redirect('/?success=true');
  } catch (error) {
    return res.status(500).send({ error: error.message });
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
        res.status(200).render('index', {
          listings,
          searchQuery: req.query,
          user: req.user?.username || null,
          szerep: req.user?.szerep || 'vendeg',
        });
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
      res.status(404).json({ success: false, message: 'Listázás nem található' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Szerver hiba', error: error.message });
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    if (!listing) {
      res.status(404).send('Listázás nem található');
    }
    res.status(200).render('new', { listing, user: req.user.username });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.post('/:id/edit', async (req, res) => {
  const owner = await getListingOwner(req.params.id);
  if (req.user.userId !== owner.felhasznaloID || req.user.szerep !== 'admin') {
    res.status(500).send('Nincs joga szerkeszteni a listázást.');
  } else {
    try {
      const { brand, model, city, price, motor, date } = req.body;
      await updateListing({ autoID: req.params.id, brand, model, city, price, motor, date });
      res.redirect('/listings');
    } catch (error) {
      res.status(500).send('Failed to update listing');
    }
  }
});

router.delete('/:id', async (req, res) => {
  const owner = await getListingOwner(req.params.id);
  if (req.user.userId !== owner.felhasznaloID || req.user.szerep !== 'admin') {
    res.status(500).json({ message: 'Nincs joga törölni a listázást.' });
  } else {
    try {
      await deleteListing(req.params.id);
      res.status(200).json({ message: 'Listázás törölve' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/details/:id', async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    if (listing) {
      const images = await getImagesByCarId(req.params.id);
      listing.images = images;
      const offers = await getOffersByCarId(req.params.id);
      if (req.user) {
        const { user } = req;
        res.render('details', {
          listing,
          user: user.username,
          userId: user.userId,
          userRole: user.szerep,
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
    res.status(200).json({ message: 'Kérem jelentkezzen be ajánlat tételhez' });
  } else {
    try {
      const car = await getListingById(id);
      if (car.felhasznaloID === req.user.userId) {
        res.status(403).json({ message: 'Miért tenne ajánlatot a saját kocsijára?.' });
      } else {
        await createOffer({
          listingId: id,
          offerorId: req.user.userId,
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
  const { decision } = req.body;
  if (['elfogadva', 'elutasitva'].includes(decision)) {
    try {
      await updateOffer(req.params.id, decision);
      res.status(200).json({ decision });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Nem sikerült értékelni az ajánlatot.' });
    }
  } else {
    res.status(400).json({ message: 'Hibás döntés.' });
  }
});

export default router;
