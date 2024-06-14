import express from 'express';
import fs from 'fs';
import path from 'path';
import upload from '../config/multerConfig.js';
import { getUploadDir } from '../config/uploadConfig.js';
import {
  addImageToListing,
  deleteImageById,
  getListingOwner,
  getImageOwner,
  getImageById,
} from '../database/dbquery.js';

const router = express.Router();
const uploadDir = getUploadDir('../uploads');

router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nincs file megadva' });
    }
    const owner = await getListingOwner(req.params.id);
    if (req.user.userId !== owner.felhasznaloID && req.user.szerep !== 'admin') {
      return res.status(403).json({ message: 'Nincs joga feltölteni ide képet.' });
    }
    await addImageToListing({ listingId: req.params.id, filename: req.file.filename });
    res.redirect('back');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  return res;
});

router.delete('/images/delete/:imageId', async (req, res) => {
  const owner = await getImageOwner(req.params.imageId);
  if (req.user.userId !== owner.felhasznaloID || req.user.szerep !== 'admin') {
    res.status(500).send('Nincs joga törölni a képet.');
  } else {
    try {
      const image = await getImageById(req.params.imageId);
      const filePath = path.join(uploadDir, image.fajlnev);
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error('File deletion error:', err);
          res.status(500).send('Nem sikerült törölni');
        } else {
          const result = await deleteImageById(req.params.imageId);
          if (result > 0) {
            res.status(200).send('Kép törölve');
          } else {
            res.status(404).send('Kép nem található');
          }
        }
      });
    } catch (error) {
      console.error('Hiba a kép törlésekor', error);
      res.status(500).send('Szerver hiba történt.');
    }
  }
});

export default router;
