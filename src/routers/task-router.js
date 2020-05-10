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

//fetch all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//fetch one task by id
router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findById(_id);
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
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every(oneUpdate => allowedUpdates.includes(oneUpdate));
    if (!isValidUpdate) {
        return res.status(400).send({ error: 'One or more invalid fields submitted' });
    }
    try {
        const task = await Task.findById(req.params.id);
        updates.forEach(oneUpdate => task[oneUpdate] = req.body[oneUpdate]);
        await task.save();
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//delete a task by id
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
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