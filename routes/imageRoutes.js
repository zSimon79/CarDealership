import express from 'express';
import { addImageToListing, deleteImageById } from '../database/dbquery.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nincs file megadva' });
    }

    await addImageToListing({ listingId: req.params.id, filename: req.file.filename });
    res.redirect('back');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  return res;
});

router.delete('/images/delete/:imageId', async (req, res) => {
  try {
    const result = await deleteImageById(req.params.imageId);
    console.log(result);
    if (result > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'A kép nem található.' });
    }
  } catch (error) {
    console.error('Hiba a kép törlésekor', error);
    res.status(500).json({ success: false, message: 'Szerver hiba történt.' });
  }
});

export default router;
