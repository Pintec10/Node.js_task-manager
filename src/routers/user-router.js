const express = require('express');
const User = require('../models/user');
const router = new express.Router();


// -------- USER ENDPOINTS --------

// create new User
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//fetch all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//fetch one user by id
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send('No mathcing user found');
        }
        res.send(user);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//update a user by id
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidated = updates.every(oneUpdate => allowedUpdates.includes(oneUpdate));

    if (!isValidated) {
        return res.status(400).send({ error: 'One or more invalid fields submitted' });
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        console.log('updated:')
        console.log(user)
        res.send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//delete a user by id
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'The user could not be found' })
        }
        res.send(user);
    }
    catch (err) {
        res.status(500).send(err);
    }
});



module.exports = router;