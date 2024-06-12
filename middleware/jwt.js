import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next, requiredAuth = true) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    if (requiredAuth) {
      return res.status(403).send({ message: 'A token is required for authentication' });
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    if (requiredAuth) {
      return res.status(401).send({ message: 'Invalid Token' });
    }
  }

  return next();
}

export function optionalAuth(req, res, next) {
  return verifyToken(req, res, next, false);
}
