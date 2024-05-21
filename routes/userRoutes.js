import express from 'express';
import { createUser, getAllUsers, deleteUser } from '../database/dbquery.js'; // Assume these functions are implemented

const router = express.Router();

// Combined route to display and manage users
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('users', { users }); // Renders the user management page
  } catch (error) {
    res.status(500).send('Failed to retrieve users');
  }
});

// Handle the addition of a new user
router.post('/', async (req, res) => {
  try {
    await createUser(req.body.name);
    res.redirect('/users'); // Redirects back to the user management page
  } catch (error) {
    res.status(500).send('Failed to add user');
  }
});

// Handle user deletion
router.delete('/:id', async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.redirect('/users'); // Redirects back to the user management page
  } catch (error) {
    res.status(500).send('Failed to delete user');
  }
});

export default router;
