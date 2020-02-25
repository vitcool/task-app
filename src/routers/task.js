const express = require('express');
const router = new express.Router();

const Task = require('./../models/task');

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  };
});

router.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const { body } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['completed', 'description'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (isValidUpdate) {
    const { id } = req.params;
    try {
      const task = await Task.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      if (task) {
        return res.send(task);
      }
      res.status(404 ).send(e);
    } catch (e) {
      res.status(400).send(e);
    }
  }
  res.status(400).send();
})

router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params; 
  try {
    const task = await Task.findByIdAndDelete(id);

    if (task) {
      return res.send(task);
    }
    res.status(404).send();
  } catch (e) {
    res.status(400).send(e);
  }
})

module.exports = router;