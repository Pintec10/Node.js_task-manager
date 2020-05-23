const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth')


// -------- USER ENDPOINTS --------

// create new User
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    }
    catch {
        res.status(400).send();
    }
});

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(oneToken => oneToken.token !== req.token);
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send();
    }
})

//logout from ALL current sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send();
    }
})

//fetch current user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

//update a user by id
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidated = updates.every(oneUpdate => allowedUpdates.includes(oneUpdate));

    if (!isValidated) {
        return res.status(400).send({ error: 'One or more invalid fields submitted' });
    }
    try {
        updates.forEach(oneUpdate => req.user[oneUpdate] = req.body[oneUpdate]);
        await req.user.save();
        res.send(req.user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

//delete own user profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    }
    catch (err) {
        res.status(500).send(err);
    }
});





module.exports = router;