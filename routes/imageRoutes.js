import express from 'express';
import { addImageToListing, deleteImageById, getListingOwner } from '../database/dbquery.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nincs file megadva' });
    }
    const user = await getListingOwner(req.params.id);
    if (req.user.username !== user.nev) {
      return res.status(500).send('Nincs joga feltölteni ide képet.');
    }
    await addImageToListing({ listingId: req.params.id, filename: req.file.filename });
    res.redirect('back');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  return res;
});

router.delete('/images/delete/:imageId', async (req, res) => {
  if (req.user.username !== req.cookies.user) {
    res.status(500).send('Nincs joga törölni a képet.');
  }
  try {
    console.log(req.params);
    const result = await deleteImageById(req.params.imageId);
    console.log(result);
    if (result > 0) {
      res.status(200).send('Kép törölve');
    } else {
      res.status(404).send('Kép nem található');
    }
  } catch (error) {
    console.error('Hiba a kép törlésekor', error);
    res.status(500).send('Szerver hiba történt.');
  }
});

export default router;
