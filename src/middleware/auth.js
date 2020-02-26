const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'thisismynewcourse');
    const { _id } = decoded;
    const user = await User.findOne({ _id , 'tokens.token': token });

    if (user) {
      req.user = user;
      next();
    } else {
      res.status(402).send('Auth error');
    }
  } catch (e) {
    res.status(401).send('Auth error');
  }
  next();
}

module.exports = auth;