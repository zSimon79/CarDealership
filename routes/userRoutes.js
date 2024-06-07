import express from 'express';
import { getAllUsers, deleteUser } from '../database/dbquery.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('users', { users, user: req.cookies.user });
  } catch (error) {
    res.status(500).send('Nincs ilyen felhasználó!');
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
