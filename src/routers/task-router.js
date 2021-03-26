const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();


// -------- TASK ENDPOINTS --------

//create new Task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//fetch own tasks 
// params examples: ?completed=true / ?limit=10&skip=20 / ?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'userTasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.userTasks);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//fetch one task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send('No matching task found');
        }
        res.send(task);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//update a task by id
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every(oneUpdate => allowedUpdates.includes(oneUpdate));
    if (!isValidUpdate) {
        return res.status(400).send({ error: 'One or more invalid fields submitted' });
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach(oneUpdate => task[oneUpdate] = req.body[oneUpdate]);
        await task.save();
        res.send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//delete a task by id
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send({ error: 'The task could not be found' });
        }
        res.send(task);
    }
    catch (err) {
        res.status(500).send(err);
    }
});



module.exports = router;