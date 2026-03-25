// req.headers.authorization — the token comes in the request header like Bearer eyJ...
// authHeader.startsWith('Bearer ') — checks the format is correct
// authHeader.split(' ')[1] — splits "Bearer eyJ..." by space and takes the second part — just the token
// jwt.verify — checks if token is valid and not expired. If tampered or expired it throws an error caught by the catch block
// req.user = decoded — attaches the decoded payload { id, username } to the request object so any route after this can access req.user.id
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protect };