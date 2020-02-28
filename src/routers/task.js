const express = require('express');

const auth = require('../middleware/auth');
const Task = require('./../models/task');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /tasks?completed=false
router.get('/tasks', auth, async (req, res) => {
  const { completed, limit, skip, sortBy } = req.query; 
  const match = {};
  const sort = {}
  if (completed) {
    match.completed = completed === 'true';
  }

  if (sortBy) {
    const [sortField, order] = sortBy.split('_');
    sort[sortField] = order === 'ASC' ? 1 : -1;
  }

  try {
    // simple solution the next line
    // const tasks = await Task.find({ owner: req.user._id});
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort
      }
    }).execPopulate(); 
    
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  };
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const { body } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['completed', 'description'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (isValidUpdate) {
    const { id } = req.params;
    try {
      const task = await Task.findOne({ _id: id, owner: req.user._id });

      if (task) {
        updates.forEach(update => task[update] = body[update]);
        await task.save();
        return res.send(task);
      }
      res.status(404).send(e);
    } catch (e) {
      res.status(400).send(e);
    }
  }
  res.status(400).send();
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params; 
  try {
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });

    if (task) {
      return res.send(task);
    }
    res.status(404).send();
  } catch (e) {
    res.status(400).send(e);
  }
})

module.exports = router;