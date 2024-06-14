import express from 'express';
import { query } from 'express-validator';
import { getAllUsers, deleteUser, getUserById, searchUsers } from '../database/dbquery.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (req.user.szerep !== 'admin') {
    res.status(403).send('Nincs jogosultságod a felhasználók megtekintésére!');
  } else {
    try {
      const users = await getAllUsers();
      res.status(200).render('users', { users, user: req.user.username });
    } catch (error) {
      res.status(500).send('Nincs ilyen felhasználó!');
    }
  }
});

router.get(
  '/list',
  [query('name').optional().isString().trim(), query('role').optional().isString().trim()],
  async (req, res) => {
    try {
      const filters = req.query;
      let users = [];
      if (Object.values(filters).some((v) => v !== undefined && v !== '')) {
        users = await searchUsers(filters);
      } else {
        users = await getAllUsers();
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Nincs ilyen felhasználó!' });
    }
  },
);

router.delete('/:id', async (req, res) => {
  if (req.user.szerep !== 'admin') {
    return res.status(403).json({ message: 'Nincs jogosultságod a felhasználó törlésére!' });
  }
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Nincs ilyen felhasználó' });
    }
    await deleteUser(req.params.id);
    if (req.user.userId === user.felhasznaloID) {
      console.log('Felhasználó törölve és kijelentkeztetve.');
      return res.status(200).json({ message: 'Felhasználó törölve és kijelentkeztetve.' });
    }
    return res.status(200).json({ message: 'Felhasználó törölve.' });
  } catch (error) {
    console.error('Hiba a felhasználó törlésekor:', error);
    return res.status(500).json({ message: 'Ne sikerült a felhasználót törölni!' });
  }
});

export default router;
