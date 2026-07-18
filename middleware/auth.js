const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    req.admin = decoded;
    next();
  });
};

module.exports = { authenticateAdmin };
