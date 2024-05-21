import express from 'express';
import { body, validationResult, query } from 'express-validator';
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getAllUsers,
  getImagesByCarId,
  searchListings,
} from '../database/dbquery.js';

const router = express.Router();

const listingValidation = [
  body('brand').isString().withMessage('Márka név szöveg kell legyen'),
  body('city').isString().withMessage('Város név szöveg kell legyen'),
  body('price').isFloat({ min: 1 }).withMessage('Ár valós pozitív szám kell legyen'),
  body('date').isISO8601().withMessage('Dátum valid dátum kell legyen'),
];

router.get('/new', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('new', { users, errors: [] });
  } catch (error) {
    res.status(500).render('error', { error: 'Form hiba' });
  }
});

router.post('/', listingValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const listingId = await createListing(req.body);
    return res.redirect('/?success=true', listingId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get(
  '/',
  [
    query('marka').optional().isString().trim(),
    query('varos').optional().isString().trim(),
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

      res.render('index', { listings, searchQuery: req.query });
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
      res.render('details', { listing });
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

export default router;