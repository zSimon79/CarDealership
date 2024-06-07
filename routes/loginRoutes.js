import bcrypt from 'bcrypt';
import express from 'express';
import {} from 'dotenv/config.js';
import jwt from 'jsonwebtoken';
import { createUser, getUserPassword, findUserByUsername } from '../database/dbquery.js';

const router = express.Router();
const secret = process.env.JWT_SECRET_KEY;

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await createUser(username, hash);
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Nem sikerült felhasználót létrehozni!');
  }
});

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      res.status(404).send('User not found');
    }
    const hashPasswd = await getUserPassword(username);
    const isMatch = await bcrypt.compare(password, hashPasswd.hash_jelszo);
    if (isMatch) {
      const token = jwt.sign({ userId: user.id, username: user.nev }, secret, { expiresIn: '12h' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
      res.cookie('user', username, { httpOnly: true, secure: true });
      res.redirect('/listings');
    } else {
      res.status(401).send('Hibás felhasználónév vagy jelszó!');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Nem sikerült bejelentkezni!');
  }
});

router.get('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.redirect('/login');
});

export default router;
