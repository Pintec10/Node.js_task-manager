const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user-router');
const taskRouter = require('./routers/task-router');


const app = express();

app.use(express.json());    //auto parses incoming json to an object in req.body

// prevent CORS issues
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');     //tighten up allowed origin for production
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(userRouter);
app.use(taskRouter);



module.exports = app;



