const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendFarewellEmail } = require('../emails/account');


// -------- USER ENDPOINTS --------

// create new User
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
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
        sendFarewellEmail(req.user.email, req.user.name)
        res.send(req.user);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//upload avatar image
const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Only JPG, JPEG and PNG format allowed'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
},
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

//delete own avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//serve avatar of a user by id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }
    catch (err) {
        res.status(404).send();
    }
})



module.exports = router;