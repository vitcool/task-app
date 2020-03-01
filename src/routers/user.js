const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');

const { sendWelcomeEmail, removeAccountEmail } = require('../emails/account');

const auth = require('../middleware/auth');

const User = require('./../models/user');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const { email, name } = user;
    sendWelcomeEmail(email, name);
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
    const { email, name } = req.user;
    removeAccountEmail(email, name);
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

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send(200);
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.sendStatus(200);
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.avatar) {
      res.set('Content-Type', 'image/png');
      res.send(user.avatar);
    }

    throw new Error();
  } catch (e) {
    res.status(400).send();
  }
});



module.exports = router;
