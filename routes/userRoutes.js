import express from 'express';
import { getAllUsers, deleteUser, getUserById } from '../database/dbquery.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const activeUser = await getUserById(req.cookies.userId);
  if (req.cookies.role !== 'admin') {
    res.status(403).send('Nincs jogosultságod a felhasználók megtekintésére!');
  } else {
    try {
      const users = await getAllUsers();
      res.status(200).render('users', { users, user: activeUser.nev });
    } catch (error) {
      res.status(500).send('Nincs ilyen felhasználó!');
    }
  }
});

router.get('/list', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Nincs ilyen felhasználó!');
  }
});

router.delete('/:id', async (req, res) => {
  if (req.cookies.role !== 'admin') {
    res.status(403).send('Nincs jogosultságod a felhasználó törlésére!');
  } else {
    try {
      const user = getUserById(req.params.id);
      await deleteUser(req.params.id);
      if (req.cookies.user === user.nev) {
        res.status(200).send('Felhasználó törölve és kijelentkeztetve.').redirect('/login');
      }
      res.status(200).redirect('/users');
    } catch (error) {
      console.error('Hiba a felhasználó törlésekor:', error);
      res.status(500).send('Ne sikerült a felhasználót törölni!');
    }
  }
});

export default router;
