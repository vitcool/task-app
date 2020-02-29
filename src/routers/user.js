const express = require('express');
const router = new express.Router();
const multer = require('multer');

const auth = require('../middleware/auth');

const User = require('./../models/user');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  };
});

router.patch('/users/me', auth, async (req, res) => {
  const { body, user } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (isValidUpdate) {
    const { id } = req.params;
    try {
        updates.forEach(update => user[update] = body[update]);
        await req.user.save();
        return res.send(req.user);
    } catch (e) {
      res.status(400).send(e);
    }
  }
  res.status(400).send();
});

router.delete('/users/me', auth,  async (req, res) => {
  const { _id } = req.user;
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const { body } = req;
  const { email, password } = body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ token, user });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    const newTokens = req.user.tokens.filter(token => token.token !== req.token);
    req.user.tokens = newTokens;

    await req.user.save();
    res.send();
  }
  catch (e) { 
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens= [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  dest: 'avatars',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(undefined, true);
    }
    cb(new Error('File must be image'));
  }
});

router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
  res.send(200);
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
})

module.exports = router;
