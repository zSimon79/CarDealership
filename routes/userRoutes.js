import express from 'express';
import { createUser, getAllUsers, deleteUser } from '../database/dbquery.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('users', { users });
  } catch (error) {
    res.status(500).send('Nincs ilyen felhasználó!');
  }
});

router.post('/', async (req, res) => {
  try {
    await createUser(req.body.name);
    res.redirect('/users');
  } catch (error) {
    res.status(500).send('Nem sikerült felhasználót létrehozni!');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.redirect('/users');
  } catch (error) {
    res.status(500).send('Ne sikerült a felhasználót törölni!');
  }
});

export default router;
