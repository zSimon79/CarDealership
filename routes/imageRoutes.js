import express from 'express';
import { addImageToListing } from '../database/dbquery.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nincs file megadva' });
    }

    await addImageToListing({ listingId: req.params.id, filename: req.file.filename });
    res.status(201).json({ message: 'Kép hozzáadva', fileInfo: req.file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  return res;
});

export default router;
