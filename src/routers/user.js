const express = require('express');
const router = new express.Router();

const User = require('./../models/user');

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  };
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (user) {
      return res.send(user);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/users/:id', async (req, res) => {
  const { body } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (isValidUpdate) {
    const { id } = req.params;
    try {
      const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true });

      if (user) {
        return res.send(user);
      }

      res.status(404).send();
    } catch (e) {
      res.status(400).send(e);
    }
  }
  res.status(400).send();
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      return res.send(user);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
})

module.exports = router;
