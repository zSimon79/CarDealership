import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: '12h' });
}

export function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).send({ message: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token' });
  }

  return next();
}
